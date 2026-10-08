import { Afiliado, ApiResponse, DashboardStats, Empresa } from "./types";

const API_URL = "https://script.google.com/macros/s/AKfycbyGDnWz_znUwnCmpUtDDczRIIgjdSGonDnBFOpaZ2iqtSrPHAnbUR96Vc9Izkfs0wM-Xg/exec";

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
      const response = await fetch(`${API_URL}?accion=listarAfiliados`, { cache: 'no-store' });
      const data = await response.json();
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
      return { exito: true, mensaje: "Enviado a Apps Script correctamente" };
    } catch (error: any) {
      console.error("Error registrando afiliado:", error);
      return { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error.message };
    }
  },

  // Preparando la arquitectura para las demás funciones solicitadas
  getAfiliado: async (id: string): Promise<ApiResponse<Afiliado>> => {
    try {
      const response = await fetch(`${API_URL}?accion=obtenerAfiliado&id=${id}`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  actualizarAfiliado: async (id: string, datos: Partial<Afiliado>): Promise<ApiResponse> => {
    try {
      await fetch(API_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "actualizarAfiliado", id, datos }),
      });
      return { exito: true };
    } catch (error: any) { return { exito: false, mensaje: "Error de conexión." }; }
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
};

