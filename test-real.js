const API_URL = "https://script.google.com/macros/s/AKfycbx_rZ0Uwf3ogHY6SFNSb1q5cPgVpys0TDhCWc2Hb_loRPS30HCJ5EY6yVpFAXcJPZlWSA/exec";

async function fetchGet(params) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}?${q}`);
  return await res.json();
}

async function fetchPost(body) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function runTest() {
  console.log("Obteniendo afiliados...");
  const data = await fetchGet({ accion: "listarAfiliados" });
  if (!data.exito) {
    console.error("Fallo al listar afiliados", data);
    return;
  }
  
  const maycolId = "UA-TEMP-1791502015905";
  const adrianaId = "UA-TEMP-1791504646006";
  
  const maycol = data.datos.find(a => a.codigo_afiliado === maycolId || a.id === maycolId);
  const adriana = data.datos.find(a => a.codigo_afiliado === adrianaId || a.id === adrianaId);
  
  if (!maycol) console.error("No se encontró a Maycol");
  if (!adriana) console.error("No se encontró a Adriana");
  
  console.log("Maycol antes:", maycol?.estado, maycol?.observaciones);
  console.log("Adriana antes:", adriana?.estado, adriana?.observaciones);
  
  console.log("Actualizando a Maycol...");
  const resMaycol = await fetchPost({
    accion: "actualizarAfiliado",
    id: maycol.id,
    datos: { estado_afiliacion: "APROBADO" }
  });
  console.log("Respuesta Maycol:", resMaycol);
  
  console.log("Actualizando a Adriana...");
  const resAdriana = await fetchPost({
    accion: "actualizarAfiliado",
    id: adriana.id,
    datos: { estado_afiliacion: "APROBADO" }
  });
  console.log("Respuesta Adriana:", resAdriana);
  
  console.log("Verificando actualización...");
  const data2 = await fetchGet({ accion: "listarAfiliados" });
  const maycol2 = data2.datos.find(a => a.id === maycol.id);
  const adriana2 = data2.datos.find(a => a.id === adriana.id);
  
  console.log("Maycol después:", maycol2?.estado, maycol2?.observaciones);
  console.log("Adriana después:", adriana2?.estado, adriana2?.observaciones);
}

runTest();
