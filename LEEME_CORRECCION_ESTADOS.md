# Corrección de persistencia de estados

El frontend ahora espera la confirmación de guardado antes de cerrar el modal y compara solo `estado_afiliacion` y `estado_operativo` (los campos editados en esta pantalla), evitando revertir el formulario por diferencias en campos antiguos no editados.

También se incluye `APPS_SCRIPT_UNION_DE_ACERO_COMPLETO.gs`, compatible con los encabezados existentes de la hoja `AFILIADOS`. Reemplaza el código de Apps Script por este archivo, guarda y publica una nueva versión de la implementación web. Después despliega este frontend en Vercel.

No he publicado los cambios en tus cuentas ni he podido ejecutar una compilación completa desde aquí. Verifica con un único afiliado de prueba después de desplegar ambos lados.


URL configurada en esta versión: https://script.google.com/macros/s/AKfycbw0TzuCBgvygdpBwR1LfO75-roymx4Gx0ZYQUba6nHzisyE-cTaZ35Y7DkS-bc3ZJ7igg/exec. El formulario muestra “Guardando...” durante el envío y enseña el error recibido si la comprobación falla.
