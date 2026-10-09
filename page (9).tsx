"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificando, setVerificando] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const fallar = (msg: string) => {
    setError(true);
    setErrorMessage(msg);
    setTimeout(() => setError(false), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificando(true);
    
    const result = await login(pin);
    if (!result.success) {
      fallar(result.error || "PIN Incorrecto");
      setVerificando(false);
    }
    // If successful, the AuthContext redirects automatically to /
  };

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
             {error && <p className="text-red-500 text-xs text-center font-bold mt-2">{errorMessage}</p>}
           </div>
           <button type="submit" disabled={verificando} className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2">
             {verificando ? <><Loader2 size={18} className="animate-spin" /> Verificando...</> : "Ingresar"}
           </button>
         </form>
      </div>
    </div>
  );
}
