"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  History, 
  UsersRound, 
  Settings, 
  GraduationCap,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  type NavItem = { id: string; label: string; icon: any; disabled?: boolean; };
  type NavGroup = { section: string; items: NavItem[]; };

  const navigation: NavGroup[] = [
    {
      section: "GESTIÓN",
      items: [
        { id: "/", label: "Dashboard", icon: LayoutDashboard },
        { id: "/afiliados", label: "Afiliados", icon: Users },
        { id: "/empresas", label: "Empresas", icon: Building2 },
        { id: "/carnets", label: "Carnets", icon: CreditCard },
      ],
    },
    {
      section: "ORGANIZACIÓN",
      items: [
        { id: "/historial", label: "Historial", icon: History },
        { id: "/directiva", label: "Directiva", icon: UsersRound },
      ],
    },
    {
      section: "SISTEMA",
      items: [
        { id: "/configuracion", label: "Configuración", icon: Settings },
      ],
    },
    {
      section: "PRÓXIMAMENTE",
      items: [
        { id: "#", label: "Formación", icon: GraduationCap, disabled: true },
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-800 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Top Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shrink-0">
            <Image src="/logo-union-acero.png" alt="Unión de Acero Logo" width={40} height={40} className="object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-black tracking-wide truncate">UNIÓN DE ACERO</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest truncate uppercase">Sistema Sindical</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
          {navigation.map((group) => (
            <div key={group.section}>
              <h2 className="px-3 text-[10px] font-black text-slate-500 tracking-widest mb-3">
                {group.section}
              </h2>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.id || (item.id !== "/" && pathname?.startsWith(item.id));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.disabled ? "#" : item.id}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                        item.disabled ? "opacity-50 cursor-not-allowed" : ""
                      } ${
                        isActive
                          ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-emerald-900/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                      onClick={(e) => {
                        if (item.disabled) e.preventDefault();
                        else setIsOpen(false);
                      }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[13px] font-bold">{item.label}</span>
                      {item.disabled && (
                        <span className="ml-auto text-[9px] font-bold bg-slate-700 px-2 py-0.5 rounded-full text-slate-400">
                          PRONTO
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
            <div>
              <p className="text-[11px] font-bold text-white">Estado del sistema</p>
              <p className="text-[9px] text-slate-400">Conectado a la API</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

