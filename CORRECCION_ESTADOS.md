# Corrección de estados de afiliados

## Causa comprobada
La hoja compartida contiene solo las columnas `estado` y `observaciones` para persistir el estado. Algunas filas tienen JSON en `estado` y otras en `observaciones`. La versión anterior del lector se detenía tras leer el primer marcador `|_JSON_|`, por lo que un bloque `{}` podía impedir que leyera el estado real guardado en la otra columna.

## Qué cambia
- Lee y combina los metadatos de ambas columnas, sin detenerse si uno contiene `{}`.
- Guarda `estado` como una etiqueta simple, por ejemplo `APROBADO`.
- Guarda los estados adicionales y metadatos en `observaciones` usando `|_JSON_|`.
- Conserva el endpoint de Apps Script configurado.

## Publicación
1. Descomprime este proyecto.
2. Reemplaza los archivos en el repositorio conectado a Vercel.
3. Haz commit/push o carga los cambios y espera el despliegue.
4. En Vercel, abre el dominio y recarga sin caché con `Ctrl + Shift + R`.
5. Cambia un afiliado a `APROBADO` y `ACTIVO`, guarda, vuelve a cargar la página y verifica.
6. Si no se persiste, abre Google Sheets y revisa la fila: `estado` debe contener una etiqueta sencilla y `observaciones` debe contener `|_JSON_|` seguido de JSON.

El modo `no-cors` del frontend no permite leer la respuesta del POST; por eso el mensaje de guardado solo confirma que la solicitud fue enviada, no que Google haya confirmado el cambio.
