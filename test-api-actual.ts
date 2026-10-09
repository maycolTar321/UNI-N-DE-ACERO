import { api } from './lib/api';

(async () => {
  // Let's get the afiliado we want to update
  const getRes = await api.getAfiliados();
  if (!getRes.exito || !getRes.datos) {
    console.log("Failed to get afiliados", getRes);
    return;
  }
  const af = getRes.datos.find(a => a.id === '739ef875-4c2a-44fc-b0b0-27c588f5bd26');
  console.log("Original estado_afiliacion:", af?.estado_afiliacion);

  // Update it to APROBADO
  const updated = { ...af, estado_afiliacion: 'APROBADO' } as any;
  const res = await api.actualizarAfiliado(String(af!.id), updated);
  
  console.log("Update result:", res);
})();
