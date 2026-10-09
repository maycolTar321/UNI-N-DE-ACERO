const fs = require('fs');
let code = fs.readFileSync('lib/api.ts', 'utf-8');

code = code.replace(/getAfiliado: async \(id: string\): Promise<ApiResponse<Afiliado>> => {[\s\S]*?\} catch \(error: any\) {[\s\S]*?\}[\s\S]*?\},/, `getAfiliado: async (id: string): Promise<ApiResponse<Afiliado>> => {
    try {
      const response = await fetch(\`\${API_URL}?accion=obtenerAfiliado&id=\${id}\`, { cache: 'no-store' });
      const data = await response.json();
      if (data.datos) {
        if (data.datos.observaciones && typeof data.datos.observaciones === 'string' && data.datos.observaciones.includes('|_JSON_|')) {
          const parts = data.datos.observaciones.split('|_JSON_|');
          data.datos.observaciones = parts[0];
          try {
            const extra = JSON.parse(parts[1]);
            Object.assign(data.datos, extra);
          } catch (e) {}
        }
      }
      return data;
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexin." };
    }
  },`);

fs.writeFileSync('lib/api.ts', code);
