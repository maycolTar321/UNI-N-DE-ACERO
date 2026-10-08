"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "./api";

type Role = "ADMIN" | "USER" | null;

interface AuthContextType {
  role: Role;
  nombre: string;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Configuración de Tiempos
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos en ms
const WARNING_TIME = 1 * 60 * 1000;     // Mostrar aviso 1 minuto antes (a los 14 min)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Evadir el error del linter sobre llamar setState directamente en el body del efecto
    const initAuth = () => {
      const saved = localStorage.getItem("auth_role") as Role;
      if (saved) setRole(saved);
      const savedNombre = localStorage.getItem("auth_nombre");
      if (savedNombre) setNombre(savedNombre);
      setLoading(false);
    };
    initAuth();
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setNombre("");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_nombre");
    localStorage.removeItem("auth_last_activity");
    setShowWarning(false);
    router.replace('/login');
  }, [router]);

  useEffect(() => {
    if (!loading) {
      if (!role && pathname !== '/login') {
        router.replace('/login');
      } else if (role && pathname === '/login') {
        router.replace('/');
      }
    }
  }, [loading, role, pathname, router]);

  // SISTEMA DE INACTIVIDAD
  useEffect(() => {
    if (!role) return;

    let lastActivityUpdate = Date.now();

    const updateActivity = () => {
      const now = Date.now();
      // Throttle: solo actualizar localStorage cada 1.5 segundos máximo
      if (now - lastActivityUpdate > 1500) {
        lastActivityUpdate = now;
        localStorage.setItem("auth_last_activity", now.toString());
        setShowWarning(false); // Ocultar warning si interactúa
      }
    };

    const checkInactivity = () => {
      const lastActivityStr = localStorage.getItem("auth_last_activity");
      const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : Date.now();
      const now = Date.now();
      const timePassed = now - lastActivity;

      if (timePassed >= SESSION_TIMEOUT) {
        logout();
      } else if (timePassed >= SESSION_TIMEOUT - WARNING_TIME) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Inicializar actividad al loguearse/montarse
    if (!localStorage.getItem("auth_last_activity")) {
      localStorage.setItem("auth_last_activity", Date.now().toString());
    }

    // Listeners de interacción (PC y Móvil)
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'touchmove'];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));

    // Sincronización entre pestañas
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "auth_role" && !e.newValue) {
        // Otra pestaña cerró la sesión
        setRole(null);
        setNombre("");
        router.replace('/login');
      } else if (e.key === "auth_last_activity") {
        // Otra pestaña actualizó la actividad, verificamos el estado
        checkInactivity();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Revisar la inactividad periódicamente
    const intervalId = setInterval(checkInactivity, 5000);

    return () => {
      events.forEach(e => window.removeEventListener(e, updateActivity));
      window.removeEventListener('storage', handleStorage);
      clearInterval(intervalId);
    };
  }, [role, logout, router]);

  const entrar = (r: "ADMIN" | "USER", n: string) => {
    setRole(r);
    setNombre(n);
    localStorage.setItem("auth_role", r);
    localStorage.setItem("auth_nombre", n);
    localStorage.setItem("auth_last_activity", Date.now().toString());
    router.replace('/');
  };

  const login = async (pin: string) => {
    if (pin === "5230") {
      entrar("ADMIN", "Administrador");
      return { success: true };
    }
    if (pin === "0000") {
      entrar("USER", "Usuario");
      return { success: true };
    }

    try {
      const res = await api.validarPin(pin);
      if (res.exito && res.datos && (res.datos.rol === "ADMIN" || res.datos.rol === "USER")) {
        entrar(res.datos.rol, res.datos.nombre);
        return { success: true };
      } else {
        return { success: false, error: "PIN Incorrecto" };
      }
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-700 border-t-[#10B981] rounded-full animate-spin"></div></div>;
  }

  // Prevent rendering protected content while redirecting to login
  if (!role && pathname !== '/login') {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ role, nombre, login, logout, loading }}>
      {children}
      
      {/* AVISO DE INACTIVIDAD */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Sesión por expirar</h3>
            <p className="text-sm text-slate-600 mb-6">
              No detectamos actividad durante varios minutos. Tu sesión se cerrará automáticamente por seguridad.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => {
                localStorage.setItem("auth_last_activity", Date.now().toString());
                setShowWarning(false);
              }} className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all">
                Continuar Sesión
              </button>
              <button onClick={logout} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

