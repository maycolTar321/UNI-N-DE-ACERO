const base = {
  id: '123',
  estado: '|_JSON_|{\"estado_afiliacion\":\"PENDIENTE\",\"estado_operativo\":\"INACTIVO\"}',
  estado_afiliacion: 'APROBADO',
  estado_operativo: 'ACTIVO',
  observaciones: ''
};

const extraKeys = [
  'estado_afiliacion',
  'estado_operativo',
  'estado_expediente',
  'estado_carnet',
  'documentos',
  'coordenadas_domicilio',
  'coordenadas_empresa',
];

const extras = {};
for (const key of extraKeys) {
  if (base[key] !== undefined) {
    extras[key] = base[key];
    delete base[key];
  }
}

const limpiarMarcador = (value) =>
  typeof value === 'string' ? value.split('|_JSON_|')[0] : (value ?? '');

const observacionesBase = String(limpiarMarcador(base.observaciones) || '');
const estadoBase = String(limpiarMarcador(base.estado) || '');

base.estado = extras.estado_afiliacion || estadoBase || 'PENDIENTE';

if (Object.keys(extras).length > 0) {
  base.observaciones =
    observacionesBase + '|_JSON_|' + JSON.stringify(extras);
} else {
  base.observaciones = observacionesBase;
}

console.log(JSON.stringify(base, null, 2));
