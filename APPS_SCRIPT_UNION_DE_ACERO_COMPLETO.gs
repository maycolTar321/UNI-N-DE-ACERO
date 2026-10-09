/**
 * UNION DE ACERO — API COMPLETA DE AFILIADOS
 * Mantiene los encabezados actuales de AFILIADOS.
 * Los estados extendidos se guardan en observaciones como |_JSON_|{...}.
 */
const NOMBRE_HOJA = "AFILIADOS";
const ID_HOJA = ""; // Si el script está vinculado a la hoja, déjalo vacío.

function libro_() {
  if (ID_HOJA) return SpreadsheetApp.openById(ID_HOJA);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("No hay hoja activa; configura ID_HOJA.");
  return ss;
}
function hoja_() {
  const sh = libro_().getSheetByName(NOMBRE_HOJA);
  if (!sh) throw new Error('No existe la hoja "' + NOMBRE_HOJA + '".');
  return sh;
}
function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const a = String(p.accion || "");
    if (a === "listarAfiliados") return listar_();
    if (a === "diagnostico") {
      const sh = hoja_();
      return json_({exito:true, hoja:sh.getName(), encabezados:headers_(sh), filas:Math.max(0,sh.getLastRow()-1)});
    }
    if (a === "obtenerAfiliado") {
      const f = buscar_(p.id || p.ci || p.codigo);
      return json_({exito:!!f, mensaje:f ? "Encontrado" : "No encontrado", datos:f ? decodificar_(obj_(f.headers,f.rowValues)) : null});
    }
    if (a === "renovarVigencia" || a === "renovar") return renovar_(p.id || p.ci, p.vigencia);
    return json_({exito:true,mensaje:"API de Unión de Acero activa",version:"3.1"});
  } catch(err) { return json_({exito:false,mensaje:String(err.message || err)}); }
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const body = JSON.parse(e && e.postData && e.postData.contents || "{}");
    const a = String(body.accion || (e.parameter && e.parameter.accion) || "");
    if (a === "registrarAfiliado") return registrar_(body.datos || {});
    if (a === "actualizarAfiliado") return actualizar_(body.id, body.datos || {});
    if (a === "eliminarAfiliado") return eliminar_(body.id);
    if (a === "renovarVigencia" || a === "renovar") return renovar_(body.id || body.ci, body.vigencia);
    return json_({exito:false,mensaje:"Acción no reconocida: " + a});
  } catch(err) { return json_({exito:false,mensaje:String(err.message || err)}); }
  finally { try { lock.releaseLock(); } catch(_) {} }
}
function listar_() {
  const sh = hoja_(), all = sh.getDataRange().getValues();
  if (all.length < 2) return json_({exito:true,datos:[]});
  const hs = all[0].map(x=>String(x||"").trim());
  const datos = all.slice(1).filter(r=>r.some(v=>v!=="" && v!==null)).map(r=>decodificar_(obj_(hs,r)));
  return json_({exito:true,datos:datos});
}
function registrar_(datos) {
  const sh=hoja_(), hs=headers_(sh), x=Object.assign({},datos||{}), extras=extras_(x);
  const id=x.id || Utilities.getUuid(), now=new Date().toISOString();
  if (extras.estado_afiliacion !== undefined) x.estado=extras.estado_afiliacion;
  Object.keys(extras).forEach(k=>delete x[k]);
  const obs=limpiar_(x.observaciones||"");
  x.observaciones=Object.keys(extras).length ? obs+"|_JSON_|"+JSON.stringify(extras) : obs;
  const row=hs.map(h=>{
    const k=key_(h);
    if(k==="id") return id;
    if(["fecha_registro","actualizado_en","fecha_actualizacion"].includes(k)) return get_(x,h) || now;
    const v=get_(x,h);
    if(v!==undefined) return v;
    if(k==="estado") return "PENDIENTE";
    return "";
  });
  sh.appendRow(row); SpreadsheetApp.flush();
  return json_({exito:true,id:id,mensaje:"Afiliado registrado."});
}
function actualizar_(id, datos) {
  if(!id) return json_({exito:false,mensaje:"Falta ID."});
  const sh=hoja_(), all=sh.getDataRange().getValues();
  if(all.length<2) return json_({exito:false,mensaje:"No hay afiliados."});
  const hs=all[0].map(x=>String(x||"").trim()), idIdx=idx_(hs,["id"]);
  if(idIdx<0) return json_({exito:false,mensaje:'Falta la columna "id".'});
  let rowNo=-1;
  for(let i=1;i<all.length;i++) if(String(all[i][idIdx]).trim()===String(id).trim()){rowNo=i+1;break;}
  if(rowNo<0) return json_({exito:false,mensaje:"No se encontró el afiliado: "+id});

  const old=all[rowNo-1], oldObj=obj_(hs,old), incoming=Object.assign({},datos||{});
  // Primero recuperar metadatos anteriores y luego aplicar los nuevos metadatos
  // que pueden venir dentro de observaciones como |_JSON_|{...}.
  const extra=Object.assign({}, extras_(oldObj), extras_(incoming));
  const keys=["estado_afiliacion","estado_operativo","estado_expediente","estado_carnet","documentos","coordenadas_domicilio","coordenadas_empresa"];
  keys.forEach(k=>{ if(incoming[k]!==undefined) extra[k]=incoming[k]; });
  // Compatibilidad con nombres camelCase de versiones anteriores.
  if(incoming.estadoAfiliacion!==undefined) extra.estado_afiliacion=incoming.estadoAfiliacion;
  if(incoming.estadoOperativo!==undefined) extra.estado_operativo=incoming.estadoOperativo;
  // El frontend antiguo manda el nuevo estado en la columna simple "estado".
  // Si vino un estado simple en el payload, debe prevalecer sobre el anterior.
  if(incoming.estado!==undefined && String(incoming.estado).indexOf("|_JSON_|")===-1) {
    extra.estado_afiliacion=limpiar_(incoming.estado) || extra.estado_afiliacion;
  }

  const merged=Object.assign({},oldObj,incoming);
  if(extra.estado_afiliacion!==undefined) merged.estado=extra.estado_afiliacion;
  const observacionesBase=limpiar_(incoming.observaciones!==undefined ? incoming.observaciones : (oldObj.observaciones||""));
  merged.observaciones=observacionesBase+(Object.keys(extra).length ? "|_JSON_|"+JSON.stringify(extra) : "");
  const now=new Date().toISOString();
  const out=hs.map((h,i)=>{
    const k=key_(h);
    if(k==="id") return old[i];
    if(["actualizado_en","fecha_actualizacion"].includes(k)) return now;
    const v=get_(merged,h);
    return v!==undefined ? v : old[i];
  });
  sh.getRange(rowNo,1,1,hs.length).setValues([out]); SpreadsheetApp.flush();
  const saved=decodificar_(obj_(hs,sh.getRange(rowNo,1,1,hs.length).getValues()[0]));
  if(extra.estado_afiliacion!==undefined && String(saved.estado_afiliacion)!==String(extra.estado_afiliacion))
    return json_({exito:false,mensaje:"No se confirmó estado de afiliación",estadoGuardado:saved.estado_afiliacion});
  if(extra.estado_operativo!==undefined && String(saved.estado_operativo)!==String(extra.estado_operativo))
    return json_({exito:false,mensaje:"No se confirmó estado operativo",estadoGuardado:saved.estado_operativo});
  return json_({exito:true,mensaje:"Afiliado actualizado y verificado",datos:saved});
}
function eliminar_(id) {
  const f=buscar_(id); if(!f) return json_({exito:false,mensaje:"Afiliado no encontrado."});
  f.sheet.deleteRow(f.rowNo); SpreadsheetApp.flush(); return json_({exito:true,mensaje:"Eliminado."});
}
function renovar_(id,vigencia) {
  if(!id||!vigencia) return json_({exito:false,mensaje:"Falta ID/CI o vigencia."});
  const f=buscar_(id); if(!f) return json_({exito:false,mensaje:"Afiliado no encontrado."});
  const ix=idx_(f.headers,["vigencia_carnet","vigencia","fecha_vigencia"]);
  if(ix<0) return json_({exito:false,mensaje:"No existe columna de vigencia."});
  f.sheet.getRange(f.rowNo,ix+1).setValue(vigencia); SpreadsheetApp.flush();
  return json_({exito:true,vigencia:f.sheet.getRange(f.rowNo,ix+1).getDisplayValue()});
}
function buscar_(id) {
  if(!id) return null;
  const sh=hoja_(), all=sh.getDataRange().getValues();
  if(all.length<2) return null;
  const hs=all[0].map(x=>String(x||"").trim()), iId=idx_(hs,["id"]), iCi=idx_(hs,["ci","cedula","cedula_identidad"]), iCod=idx_(hs,["codigo_afiliado","codigo"]);
  for(let i=1;i<all.length;i++){
    const row=all[i], indices=[iId,iCi,iCod].filter(x=>x>=0);
    if(indices.some(x=>String(row[x]).trim()===String(id).trim())) return {sheet:sh,headers:hs,rowValues:row,rowNo:i+1};
  } return null;
}
function decodificar_(o) {
  const out=Object.assign({},o||{}); Object.assign(out,extras_(out));
  if(!out.estado_afiliacion) out.estado_afiliacion=out.estado||"PENDIENTE";
  if(!out.estado_operativo) out.estado_operativo="INACTIVO";
  if(!out.estado_expediente) out.estado_expediente="INCOMPLETO";
  if(!out.estado_carnet) out.estado_carnet="PENDIENTE";
  return out;
}
function extras_(o) {
  const x={};
  ["estado","observaciones"].forEach(k=>{
    const raw=o&&o[k]; if(typeof raw!=="string"||!raw.includes("|_JSON_|")) return;
    const j=raw.split("|_JSON_|").slice(1).join("|_JSON_|").trim(); if(!j) return;
    try { const parsed=JSON.parse(j); if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed)) Object.assign(x,parsed); } catch(_){}
  }); return x;
}
function limpiar_(v){return String(v==null?"":v).split("|_JSON_|")[0];}
function headers_(sh){return sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0].map(x=>String(x||"").trim());}
function obj_(hs,row){const o={};hs.forEach((h,i)=>{if(h)o[h]=row[i] instanceof Date?row[i].toISOString():row[i];});return o;}
function key_(v){return String(v==null?"":v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[\s-]+/g,"_");}
function idx_(hs,aliases){const a=aliases.map(key_);return hs.findIndex(h=>a.includes(key_(h)));}
function get_(o,h){if(!o)return undefined;const target=key_(h),k=Object.keys(o).find(x=>key_(x)===target);return k===undefined?undefined:o[k];}
function json_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
