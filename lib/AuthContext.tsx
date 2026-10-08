"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Lock, Loader2 } from "lucide-react";
import { api } from "./api";

type Role = "ADMIN" | "USER" | null;

interface AuthContextType {
  role: Role;
  nombre: string;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [verificando, setVerificando] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("auth_role") as Role;
    if (saved) {
      setRole(saved);
    }
    const savedNombre = localStorage.getItem("auth_nombre");
    if (savedNombre) {
      setNombre(savedNombre);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entrar = (r: "ADMIN" | "USER", n: string) => {
    setRole(r);
    setNombre(n);
    localStorage.setItem("auth_role", r);
    localStorage.setItem("auth_nombre", n);
  };

  const fallar = () => {
    setError(true);
    setTimeout(() => setError(false), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // PINs maestros (siempre funcionan, aunque no haya internet)
    if (pin === "5230") return entrar("ADMIN", "Administrador");
    if (pin === "0000") return entrar("USER", "Usuario");

    // PINs creados desde Configuración > Roles y permisos
    setVerificando(true);
    try {
      const res = await api.validarPin(pin);
      if (res.exito && res.datos && (res.datos.rol === "ADMIN" || res.datos.rol === "USER")) {
        entrar(res.datos.rol, res.datos.nombre);
      } else {
        fallar();
      }
    } catch {
      fallar();
    } finally {
      setVerificando(false);
    }
  };

  const logout = () => {
    setRole(null);
    setNombre("");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_nombre");
    setPin("");
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-700 border-t-[#10B981] rounded-full animate-spin"></div></div>;
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
           <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="text-slate-800" size={32} />
           </div>
           <h1 className="text-2xl font-black text-center text-slate-800 mb-2">Acceso al Sistema</h1>
           <p className="text-center text-slate-500 text-sm mb-8">Ingresa tu PIN para continuar</p>
           
           <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <input 
                 type="password" 
                 value={pin}
                 onChange={e => setPin(e.target.value)}
                 className={`w-full text-center tracking-[0.5em] text-2xl px-4 py-3 bg-slate-50 border ${error ? 'border-red-500 text-red-600' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all font-mono`}
                 placeholder="••••"
                 maxLength={4}
                 autoFocus
               />
               {error && <p className="text-red-500 text-xs text-center font-bold mt-2">PIN Incorrecto</p>}
             </div>
             <button type="submit" disabled={verificando} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2">
               {verificando ? <><Loader2 size={18} className="animate-spin" /> Verificando...</> : "Ingresar"}
             </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, nombre, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
