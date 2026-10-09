const API_URL = 'https://script.google.com/macros/s/AKfycbx_rZ0Uwf3ogHY6SFNSb1q5cPgVpys0TDhCWc2Hb_loRPS30HCJ5EY6yVpFAXcJPZlWSA/exec';
(async () => {
  const req = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      accion: 'actualizarAfiliado',
      id: 'b894019e-0906-4fa8-a005-381c8ad8f05d',
      datos: {
        estado: 'EN_REVISION',
        observaciones: '|_JSON_|{\"estado_afiliacion\":\"EN_REVISION\"}'
      }
    })
  });
  console.log(await req.text());
})();
