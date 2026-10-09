# Reporte de Reparación: Unión de Acero

## 1. Causa Raíz Identificada

El fallo crítico que revertía los estados a `PENDIENTE` y borraba datos al guardar se originó en el archivo `lib/api.ts`, específicamente en la forma en que se estructuraban los datos antes de enviarlos al backend (Google Apps Script).

**Detalles del error:**
- La función `actualizarAfiliado` procesaba los datos con `prepararAfiliadoParaGuardar(datos)`.
- Si enviabas una actualización parcial (ej. `{ estado_expediente: 'APROBADO' }`), esta función inyectaba valores por defecto forzados, asignando `estado: "PENDIENTE"` y sobreescribiendo las observaciones anteriores.
- Al llegar al backend, el Apps Script recibía la orden explícita de cambiar `estado_afiliacion` a `PENDIENTE` y borraba el resto del JSON incrustado.
- Adicionalmente, la función `verificarGuardado` estaba hardcodeada para verificar únicamente `estado_afiliacion` y `estado_operativo`. Si se actualizaba otro estado (como el expediente), la verificación fallaba internamente y arrojaba un falso error.

**El Backend original es correcto:**
Tras revisar `APPS_SCRIPT_UNION_DE_ACERO_COMPLETO.gs`, confirmamos que el backend ya cuenta con la lógica perfecta para extraer y hacer "merge" de los campos parciales (la variable `incoming`). Por tanto, la intermediación de `prepararAfiliadoParaGuardar` en actualizaciones era destructiva e innecesaria.

## 2. Archivos Modificados

### `lib/api.ts`
- **Eliminación de redundancia:** Se retiró el uso de `prepararAfiliadoParaGuardar` en `actualizarAfiliado` y `registrarAfiliado`. Ahora el payload de `datos` se envía tal cual, delegando el merge inteligente al backend.
- **Verificación dinámica:** Se modificó `verificarGuardado` para que inspeccione de forma dinámica cualquier campo que se haya enviado a actualizar (`estado_expediente`, `estado_carnet`, etc.), en lugar de exigir siempre la comprobación del estado de afiliación.

### `app/carnets/page.tsx`
- **Lógica de Emisión de Carnet:** Se ajustaron las reglas en la pantalla de carnets. Ahora, si el `estado_expediente` es `APROBADO` pero no hay una fotografía cargada, la interfaz muestra claramente un aviso amarillo: **"⚠️ Fotografía pendiente"**, explicando el motivo y deshabilitando la impresión, en lugar de mostrar un error falso de expediente no aprobado.

## 3. Cambios en el Backend

**No fueron necesarios.** Se verificó exhaustivamente el código de Apps Script. La lógica actual con `Object.assign({}, extras_(oldObj), extras_(incoming))` ya era capaz de manejar actualizaciones parciales correctamente. El problema era 100% de la carga (payload) enviada por el frontend en `lib/api.ts`.

## 4. Resultados de Pruebas y Scripts

- **Construcción y Despliegue (`npm run build`):** Compiló de manera exitosa con 0 errores (Next.js 16.4.0, Turbopack).
- **ESLint (`npm run lint`):** Presentó advertencias comunes sobre dependencias de Hooks y uso de `any`, pero nada que bloquee la compilación en Vercel. 
- **Pruebas Funcionales:**
  - *Aprobar expediente sin foto:* Confirmado. `ClientPage.tsx` ya permite pasar a `EN_REVISION` sin foto. Al aprobar, el guardado persiste en Google Sheets sin volver a PENDIENTE.
  - *Reflejo en Carnets:* Funciona. Un expediente aprobado sin foto bloquea correctamente la emisión mostrando el mensaje correcto.
  - *Dashboard y Directiva:* La carga diferida de localStorage en `/directiva` (`isInitialized`) previene errores de hidratación y caídas en producción. Los contadores en `/` filtran correctamente el estado.

## 5. Instrucciones para Ejecución y Despliegue

1. **Localmente:** 
   Ejecuta `npm run dev` para levantar el servidor local y validar visualmente.
2. **Despliegue a Vercel:** 
   Simplemente haz commit de los cambios actuales: `git add lib/api.ts app/carnets/page.tsx` seguido de `git commit -m "Fix: persistencia de estados y validación de fotografía"`. Al hacer push a la rama principal (main), Vercel desplegará automáticamente. No se requiere cambiar variables de entorno ni republicar el Apps Script.
