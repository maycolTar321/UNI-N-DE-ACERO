export interface Afiliado {
  id?: string | number;
  codigo_afiliado: string;
  ci: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  sexo: string;
  fotografia: string;
  telefono: string;
  whatsapp: string;
  correo: string;
  direccion: string;
  empresa_id: string;
  cargo: string;
  especialidad: string;
  fecha_ingreso_laboral: string;
  fecha_afiliacion: string;
  tipo_afiliacion: string;
  estado_operativo: "ACTIVO" | "INACTIVO";
  estado_afiliacion: "PENDIENTE" | "EN_REVISION" | "APROBADO" | "RECHAZADO";
  observaciones: string;
  fecha_registro?: string;
  registrado_por?: string;
  actualizado_en?: string;

  // Nuevos campos para Expediente y Mapa
  coordenadas_domicilio?: { lat: number; lng: number };
  coordenadas_empresa?: { lat: number; lng: number };
  estado_expediente?: "INCOMPLETO" | "COMPLETO" | "EN_REVISION" | "APROBADO" | "RECHAZADO";
  estado_carnet?: "PENDIENTE" | "LISTO" | "EMITIDO";
  documentos?: {
    cedula: { estado: "PRESENTADO" | "PENDIENTE" | "OBSERVADO" | "NO_CORRESPONDE"; url?: string; observacion?: string };
    croquis_domicilio: { estado: "PRESENTADO" | "PENDIENTE" | "OBSERVADO" | "NO_CORRESPONDE"; url?: string; observacion?: string };
    croquis_empresa: { estado: "PRESENTADO" | "PENDIENTE" | "OBSERVADO" | "NO_CORRESPONDE"; url?: string; observacion?: string };
    servicio_basico: { estado: "PRESENTADO" | "PENDIENTE" | "OBSERVADO" | "NO_CORRESPONDE"; tipo?: "AGUA" | "LUZ" | "GAS"; url?: string; observacion?: string };
  };
}

export interface Empresa {
  id: string;
  nombre: string;
  cantidad_afiliados?: number;
}

export interface DashboardStats {
  total: number;
  activos: number;
  pendientes: number;
  rechazados: number;
  empresas: number;
}

export interface ApiResponse<T = any> {
  exito: boolean;
  mensaje?: string;
  datos?: T;
  error?: string;
}

