import { Afiliado, ApiResponse, DashboardStats, Empresa } from "./types";

const API_URL = "https://script.google.com/macros/s/AKfycbyGl6KBXz1bPrdIsikOlpzrBJk42b5OycNxWDJm5Ehedb2P3wij-q37ny5hhj0He0rKmQ/exec";

export const api = {
  getAfiliados: async (): Promise<ApiResponse<Afiliado[]>> => {
    try {
      const response = await fetch(`${API_URL}?accion=listarAfiliados`, { cache: 'no-store' });
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error fetching afiliados:", error);
      return { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error.message };
    }
  },

  registrarAfiliado: async (afiliado: Partial<Afiliado>): Promise<ApiResponse<Afiliado>> => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
          accion: "registrarAfiliado",
          datos: afiliado,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Error registrando afiliado:", error);
      return { exito: false, mensaje: "No pudimos conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.", error: error.message };
    }
  },

  // Preparando la arquitectura para las demás funciones solicitadas
  getAfiliado: async (id: string): Promise<ApiResponse<Afiliado>> => {
    try {
      const response = await fetch(`${API_URL}?accion=obtenerAfiliado&id=${id}`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  actualizarAfiliado: async (id: string, datos: Partial<Afiliado>): Promise<ApiResponse> => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ accion: "actualizarAfiliado", id, datos }),
      });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  eliminarAfiliado: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ accion: "eliminarAfiliado", id }),
      });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  cambiarEstadoAfiliado: async (id: string, estado: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ accion: "cambiarEstadoAfiliado", id, estado }),
      });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  getEmpresas: async (): Promise<ApiResponse<Empresa[]>> => {
    try {
      const response = await fetch(`${API_URL}?accion=listarEmpresas`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  registrarEmpresa: async (empresa: Partial<Empresa>): Promise<ApiResponse> => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ accion: "registrarEmpresa", datos: empresa }),
      });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  getHistorial: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await fetch(`${API_URL}?accion=obtenerHistorial`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  },

  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await fetch(`${API_URL}?accion=dashboard`, { cache: 'no-store' });
      return await response.json();
    } catch (error: any) {
      return { exito: false, mensaje: "Error de conexión." };
    }
  }
};

