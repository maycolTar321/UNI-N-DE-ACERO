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
  estado: "ACTIVO" | "PENDIENTE" | "RECHAZADO";
  observaciones: string;
  fecha_registro?: string;
  registrado_por?: string;
  actualizado_en?: string;
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

