import { Afiliado, ApiResponse, DashboardStats, Empresa } from "./types";

const API_URL = "https://script.google.com/macros/s/AKfycbx_rZ0Uwf3ogHY6SFNSb1q5cPgVpys0TDhCWc2Hb_loRPS30HCJ5EY6yVpFAXcJPZlWSA/exec";

/**
 * Los estados extendidos se guardan en observaciones para evitar que el backend
 * normalice el campo heredado "estado". También leemos el formato antiguo
 * (metadatos dentro de "estado") para no perder los datos ya registrados.
 */
/**
 * Compatibilidad con los dos formatos históricos de la hoja:
 * - estados extendidos dentro de la columna "estado"
 * - estados extendidos dentro de "observaciones"
 *
 * Se leen AMBAS columnas; un bloque JSON vacío no debe impedir leer el otro.
 */
function restaurarMetadatosAfiliado(afiliado: any) {
  if (!afiliado || typeof afiliado !== "object") return afiliado;

  const metadatos: Record<string, any> = {};
  for (const campo of ["estado", "observaciones"]) {
    const valor = afiliado[campo];
    if (typeof valor !== "string" || !valor.includes("|_JSON_|")) continue;

    const partes = valor.split("|_JSON_|");
    afiliado[campo] = partes[0] || "";
    const json = partes.slice(1).join("|_JSON_|").trim();
    if (!json) continue;

    try {
      const extras = JSON.parse(json);
      if (extras && typeof extras === "object" && !Array.isArray(extras)) {
        // No permitir que un JSON vacío borre metadatos útiles de la otra columna.
        Object.assign(metadatos, extras);
      }
    } catch (error) {
      console.error(`No se pudieron restaurar los metadatos de ${campo}:`, error);
    }
  }

  Object.assign(afiliado, metadatos);

  // En filas antiguas, el campo estado puede contener únicamente el marcador JSON.
  if (!afiliado.estado && afiliado.estado_afiliacion) {
    afiliado.estado = afiliado.estado_afiliacion;
  }

  afiliado.estado_afiliacion = afiliado.estado_afiliacion || afiliado.estado || "PENDIENTE";
  afiliado.estado_operativo = afiliado.estado_operativo || "INACTIVO";
  afiliado.estado_expediente = afiliado.estado_expediente || "INCOMPLETO";
  afiliado.estado_carnet = afiliado.estado_carnet || "PENDIENTE";

  return afiliado;
}

/**
 * La hoja actual NO tiene columnas para estado_afiliacion, estado_operativo,
 * estado_expediente, estado_carnet, documentos o coordenadas. Por eso se
 * persisten en observaciones usando el marcador que la app ya venía usando.
 */
function prepararAfiliadoParaGuardar(afiliado: any) {
  const base: any = { ...(afiliado || {}) };
  const extraKeys = [
    "estado_afiliacion",
    "estado_operativo",
    "estado_expediente",
    "estado_carnet",
    "documentos",
    "coordenadas_domicilio",
    "coordenadas_empresa",
  ];

  const extras: Record<string, any> = {};
  for (const key of extraKeys) {
    if (base[key] !== undefined) {
      extras[key] = base[key];
      // Do not delete from base so if columns exist they get updated natively
    }
  }

  const limpiarMarcador = (value: unknown) =>
    typeof value === "string" ? value.split("|_JSON_|")[0] : (value ?? "");

  const observacionesBase = String(limpiarMarcador(base.observaciones) || "");
  const estadoBase = String(limpiarMarcador(base.estado) || "");

  // La columna "estado" debe guardar un estado simple, no un objeto JSON.
  base.estado = extras.estado_afiliacion || estadoBase || "PENDIENTE";

  // Evitar escribir metadatos dentro de ambas columnas: usar observaciones.
  if (Object.keys(extras).length > 0) {
    base.observaciones =
      observacionesBase + "|_JSON_|" + JSON.stringify(extras);
  } else {
    base.observaciones = observacionesBase;
  }

  return base;
}


const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function encontrarPorId(afiliados: Afiliado[], id: string) {
  return afiliados.find(a => String(a.id ?? "").trim() === String(id).trim());
}

/**
 * Google Apps Script se llama con no-cors para evitar el preflight del navegador.
 * no-cors oculta la respuesta del POST, así que NUNCA debemos anunciar éxito
 * sin volver a leer Google Sheets y comprobar que el cambio quedó guardado.
 */
async function verificarGuardado(
  id: string,
  esperado: Partial<Afiliado>,
  intentos = 4
): Promise<ApiResponse> {
  let ultimo: Afiliado | undefined;

  for (let intento = 0; intento < intentos; intento++) {
    await esperar(intento === 0 ? 350 : 650);

    const consulta = await api.getAfiliados();
    if (consulta.exito && Array.isArray(consulta.datos)) {
      ultimo = encontrarPorId(consulta.datos, id);

      if (ultimo) {
        // La ventana de edición permite modificar estos estados.
        const comprobaciones: Array<keyof Afiliado> = [
          "estado_afiliacion",
          "estado_operativo",
          "estado_expediente",
          "estado_carnet"
        ];

        const camposAComprobar = comprobaciones.filter(
          campo => esperado[campo] !== undefined
        );

        // Si no estamos actualizando ninguno de esos campos, no fallar la verificación
        if (camposAComprobar.length === 0) {
          return { exito: true, mensaje: "Cambios enviados (sin campos de estado a verificar)." };
        }

        const coincide = camposAComprobar.every(campo => {
          const valorEsperado = esperado[campo];
          const valorReal = ultimo?.[campo];
          return String(valorReal ?? "").trim().toUpperCase() ===
            String(valorEsperado ?? "").trim().toUpperCase();
        });

        if (coincide) {
          return { exito: true, mensaje: "Cambios guardados y verificados en Google Sheets." };
        }
      }
    }
  }

  const estadoReal = ultimo
    ? `Estado que sigue en la hoja: afiliación=${ultimo.estado_afiliacion || "SIN DATO"}, operativo=${ultimo.estado_operativo || "SIN DATO"}.`
    : "No se pudo volver a leer el afiliado desde Google Sheets.";

  return {
    exito: false,
    mensaje: `Google Sheets no confirmó los cambios. ${estadoReal} Revisa que el despliegue de Apps Script esté actualizado y tenga acceso a la hoja.`
  };
}

export const api = {
  actualizarVigencia: async (ciOId: string, nuevaVigencia: string): Promise<ApiResponse> => {
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          accion: "renovarVigencia",
          id: ciOId,
          vigencia: nuevaVigencia,
        }),
      });
      return { exito: true, mensaje: "Vigencia renovada exitosamente" };
    } catch (e: any) {
      console.error("Error renovando vigencia:", e);
      return { exito: false, mensaje: "Error al conectar con el servidor" };
    }
  },
  getAfiliados: async (): Promise<ApiResponse<Afiliado[]>> => {
    try {
      const response = await fetch(`${API_URL}?accion=listarAfiliados&_ts=${Date.now()}`, { cache: "no-store" });
      const data = await response.json();
      if (Array.isArray(data.datos)) {
        data.datos = data.datos.map((a: any) => restaurarMetadatosAfiliado(a));
      }
      return data;
    } catch (error: any) {
      console.error("Error fetching afiliados:", error);
      return { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error.message };
    }
  },

  registrarAfiliado: async (afiliado: Partial<Afiliado>): Promise<ApiResponse<Afiliado>> => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          accion: "registrarAfiliado",
          datos: afiliado,
        }),
      });
      // En modo no-cors no es posible leer la respuesta HTTP. La lista debe refrescarse
      // después del guardado para confirmar el estado persistido.
      return { exito: true, mensaje: "Solicitud enviada. Actualiza la lista para verificar el guardado." };
    } catch (error: any) {
      console.error("Error registrando afiliado:", error);
      return { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error.message };
    }
  },

  // Preparando la arquitectura para las demás funciones solicitadas
  getAfiliado: async (id: string): Promise<ApiResponse<Afiliado>> => {
    try {
      const response = await fetch(`${API_URL}?accion=obtenerAfiliado&id=${id}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.datos) {
        data.datos = restaurarMetadatosAfiliado(data.datos);
      }
      return data;
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexin." };
    }
  },

  actualizarAfiliado: async (id: string, datos: Partial<Afiliado>): Promise<ApiResponse> => {
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "actualizarAfiliado", id, datos: datos }),
      });

      // El POST no-cors no permite leer el resultado del servidor.
      // Comprobamos los datos reales después de escribir; si no coinciden,
      // devolvemos error para que la pantalla no finja que se guardó.
      return await verificarGuardado(String(id), datos as Partial<Afiliado>);
    } catch (error: any) {
      console.error("Error actualizando afiliado:", error);
      return { exito: false, mensaje: `Error de conexión al guardar: ${error?.message || "desconocido"}` };
    }
  },

  eliminarAfiliado: async (id: string): Promise<ApiResponse> => {
    try {
      await fetch(API_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "eliminarAfiliado", id }),
      });
      return { exito: true };
    } catch (error: any) { return { exito: false, mensaje: "Error de conexión." }; }
  },

  cambiarEstadoAfiliado: async (id: string, estado: string): Promise<ApiResponse> => {
    try {
      await fetch(API_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "cambiarEstadoAfiliado", id, estado }),
      });
      return { exito: true };
    } catch (error: any) { return { exito: false, mensaje: "Error de conexión." }; }
  },

  getEmpresas: async (): Promise<ApiResponse<Empresa[]>> => {
    try {
      const response = await fetch(`${API_URL}?accion=listarEmpresas`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) { return { exito: false, mensaje: "Error de conexión." }; }
  },

  registrarEmpresa: async (empresa: Partial<Empresa>): Promise<ApiResponse> => {
    try {
      await fetch(API_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "registrarEmpresa", datos: empresa }),
      });
      return { exito: true };
    } catch (error: any) { return { exito: false, mensaje: "Error de conexión." }; }
  },

  getHistorial: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await fetch(`${API_URL}?accion=obtenerHistorial`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await fetch(`${API_URL}?accion=dashboard`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  }
  ,

  // ===== USUARIOS DEL SISTEMA (ACCESOS) =====
  listarUsuarios: async (): Promise<ApiResponse<UsuarioSistema[]>> => {
    try {
      const response = await fetch(`${API_URL}?accion=listarUsuarios`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  crearUsuario: async (nombre: string, pin: string, rol: string): Promise<ApiResponse> => {
    try {
      const params = new URLSearchParams({ accion: "crearUsuario", nombre, pin, rol });
      const response = await fetch(`${API_URL}?${params.toString()}`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  eliminarUsuario: async (id: string): Promise<ApiResponse> => {
    try {
      const params = new URLSearchParams({ accion: "eliminarUsuario", id });
      const response = await fetch(`${API_URL}?${params.toString()}`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  validarPin: async (pin: string): Promise<ApiResponse<{ nombre: string; rol: string }>> => {
    try {
      const params = new URLSearchParams({ accion: "validarPin", pin });
      const response = await fetch(`${API_URL}?${params.toString()}`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  }
};

export interface UsuarioSistema {
  id: string;
  nombre: string;
  rol: "ADMIN" | "USER";
  fecha_creacion?: string;
}

