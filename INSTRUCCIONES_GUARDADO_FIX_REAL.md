CORRECCIÓN DEL GUARDADO DE ESTADOS — UNIÓN DE ACERO

CAUSA CORREGIDA:
El frontend convertía estado_afiliacion y estado_operativo a JSON dentro de observaciones y quitaba esos campos del objeto principal. El Apps Script anterior no recuperaba los metadatos entrantes antes de combinar con los antiguos, por lo que el estado anterior podía prevalecer. Ahora el frontend envía también los estados como campos directos y el Apps Script combina los metadatos nuevos con los anteriores.

PASOS OBLIGATORIOS:
1. Reemplaza los archivos del proyecto por los de esta carpeta o aplica los cambios de lib/api.ts.
2. En el editor de Google Apps Script vinculado a la hoja correcta, reemplaza el código por APPS_SCRIPT_UNION_DE_ACERO_COMPLETO.gs.
3. Verifica que NOMBRE_HOJA coincida exactamente con el nombre de la pestaña de afiliados. Si el script NO está vinculado a la hoja, configura ID_HOJA con el ID del documento.
4. En Apps Script: Implementar > Gestionar implementaciones > Editar (lápiz) > Versión nueva > Implementar. Autoriza permisos si los solicita.
5. Comprueba que la URL implementada sea la misma que está en lib/api.ts.
6. Reinicia localmente con npm run dev y prueba un afiliado.

NOTA: No se puede actualizar tu implementación de Google Apps Script desde este ZIP. El código nuevo debe desplegarse en tu cuenta para que el cambio funcione.
