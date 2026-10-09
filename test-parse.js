const fs = require('fs');

function restaurarMetadatosAfiliado(afiliado) {
  if (!afiliado || typeof afiliado !== "object") return afiliado;

  const metadatos = {};
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
        Object.assign(metadatos, extras);
      }
    } catch (error) {
      console.error(`No se pudieron restaurar los metadatos de ${campo}:`, error);
    }
  }

  Object.assign(afiliado, metadatos);

  if (!afiliado.estado && afiliado.estado_afiliacion) {
    afiliado.estado = afiliado.estado_afiliacion;
  }

  afiliado.estado_afiliacion = afiliado.estado_afiliacion || afiliado.estado || "PENDIENTE";
  afiliado.estado_operativo = afiliado.estado_operativo || "INACTIVO";
  afiliado.estado_expediente = afiliado.estado_expediente || "INCOMPLETO";
  afiliado.estado_carnet = afiliado.estado_carnet || "PENDIENTE";

  return afiliado;
}

(async () => {
  const API_URL = 'https://script.google.com/macros/s/AKfycbx_rZ0Uwf3ogHY6SFNSb1q5cPgVpys0TDhCWc2Hb_loRPS30HCJ5EY6yVpFAXcJPZlWSA/exec';
  const response = await fetch(`${API_URL}?accion=listarAfiliados`);
  const data = await response.json();
  const af = data.datos.find(a => a.id === 'b894019e-0906-4fa8-a005-381c8ad8f05d');
  console.log("Raw from API:", af.estado_afiliacion, af.estado, af.observaciones);
  const parsed = restaurarMetadatosAfiliado(af);
  console.log("Parsed:", parsed.estado_afiliacion);
})();
