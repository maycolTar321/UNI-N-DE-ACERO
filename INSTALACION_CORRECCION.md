# UNION DE ACERO — CORRECCIÓN DE GUARDADO Y VERIFICACIÓN

## Qué se corrigió
El frontend usaba `fetch(..., mode: "no-cors")` para enviar actualizaciones a Google Apps Script y devolvía `exito: true` sin comprobar que la hoja hubiera guardado el cambio. Eso podía mostrar un guardado exitoso aunque la fila siguiera igual.

Ahora `lib/api.ts`:
- envía la actualización como antes para conservar la compatibilidad con Apps Script;
- vuelve a consultar `listarAfiliados` con una URL sin caché;
- verifica que los estados y campos editados realmente aparezcan en Google Sheets;
- si la hoja no refleja el cambio, devuelve un error con los estados que el servidor sigue reportando.

## Cómo instalar
1. Descomprime el ZIP.
2. Reemplaza los archivos del repositorio que está conectado al proyecto Vercel por estos archivos.
3. Haz commit/push al repositorio (o carga los archivos por el método que uses para desplegar).
4. Espera a que Vercel termine el deployment.
5. Abre `/afiliados`, edita un registro, cambia Estado Afiliación y Estado Operativo y pulsa Guardar Cambios.
6. Si el backend no guardó, la pantalla debe mostrar un error indicando qué estados continúan en la hoja. Ese mensaje sirve para diferenciar un fallo del backend de un fallo visual.

## Importante
No he podido ejecutar la compilación en este entorno: `npm run build` falló porque no está disponible el ejecutable `next` dentro de las dependencias locales. Tampoco puedo publicar en tu cuenta de Vercel ni desplegar Apps Script desde aquí. No se afirma que ya esté desplegado.
