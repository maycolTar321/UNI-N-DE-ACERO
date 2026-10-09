const fs = require('fs');
let code = fs.readFileSync('lib/api.ts', 'utf-8');

code = code.replace(/getAfiliados: async[\s\S]*?return data;\s*\} catch[\s\S]*?\},/, `getAfiliados: async (): Promise<ApiResponse<Afiliado[]>> => {
    try {
      const response = await fetch(\`\${API_URL}?accion=listarAfiliados\`, { cache: 'no-store' });
      const data = await response.json();
      if (data.datos) {
        data.datos = data.datos.map((a: any) => {
          if (a.observaciones && typeof a.observaciones === 'string' && a.observaciones.includes('|_JSON_|')) {
            const parts = a.observaciones.split('|_JSON_|');
            a.observaciones = parts[0];
            try {
              const extra = JSON.parse(parts[1]);
              Object.assign(a, extra);
            } catch (e) {}
          }
          return a;
        });
      }
      return data;
    } catch (error: any) {
      console.error("Error fetching afiliados:", error);
      return { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error.message };
    }
  },`);

code = code.replace(/registrarAfiliado: async[\s\S]*?body: JSON\.stringify\(\{\s*accion: "registrarAfiliado",\s*datos: afiliado,\s*\}\),\s*\}\);/, `registrarAfiliado: async (afiliado: Partial<Afiliado>): Promise<ApiResponse<Afiliado>> => {
    try {
      const { estado_afiliacion, estado_operativo, estado_expediente, estado_carnet, documentos, coordenadas_domicilio, coordenadas_empresa, ...baseData } = afiliado as any;
      const extraData = { estado_afiliacion, estado_operativo, estado_expediente, estado_carnet, documentos, coordenadas_domicilio, coordenadas_empresa };
      baseData.observaciones = (baseData.observaciones || '') + '|_JSON_|' + JSON.stringify(extraData);
      
      const response = await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          accion: "registrarAfiliado",
          datos: baseData,
        }),
      });`);

code = code.replace(/actualizarAfiliado: async[\s\S]*?body: JSON\.stringify\(\{ accion: "actualizarAfiliado", id, datos \}\),\s*\}\);/, `actualizarAfiliado: async (id: string, datos: Partial<Afiliado>): Promise<ApiResponse> => {
    try {
      const { estado_afiliacion, estado_operativo, estado_expediente, estado_carnet, documentos, coordenadas_domicilio, coordenadas_empresa, ...baseData } = datos as any;
      const extraData = { estado_afiliacion, estado_operativo, estado_expediente, estado_carnet, documentos, coordenadas_domicilio, coordenadas_empresa };
      baseData.observaciones = (baseData.observaciones || '').replace(/\\|_JSON_\\|.*/, '') + '|_JSON_|' + JSON.stringify(extraData);

      await fetch(API_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ accion: "actualizarAfiliado", id, datos: baseData }),
      });`);

fs.writeFileSync('lib/api.ts', code);
