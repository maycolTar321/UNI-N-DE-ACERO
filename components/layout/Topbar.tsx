"use client";

import { Menu, Search, Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface TopbarProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

export function Topbar({ setSidebarOpen }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = () => {
    const term = window.prompt("Ingresa el CI o Código del afiliado para buscar:");
    if (term) {
      if (/^\d+$/.test(term.trim())) {
        router.push(`/afiliados/${term.trim()}`);
      } else {
        router.push(`/afiliados`);
      }
    }
  };

  const formatPath = (path: string) => {
    if (path === "/") return "Dashboard";
    const segment = path.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between bg-white/80 px-6 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-slate-500 font-medium">Unión de Acero</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-700">{formatPath(pathname || "/")}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSearch} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors">
          <Search size={20} />
        </button>
        <button onClick={() => alert("¡Tienes expedientes pendientes de imprimir carnet!")} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#10B981] border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        
        <button onClick={() => alert("Menú de perfil: Administrador Sindical")} className="flex items-center gap-3 pl-2 text-left hover:bg-slate-50 rounded-xl p-1 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-700">Administrador</p>
            <p className="text-[10px] text-slate-500 font-medium">Gestión Sindical</p>
          </div>
        </button>
      </div>
    </header>
  );
}

