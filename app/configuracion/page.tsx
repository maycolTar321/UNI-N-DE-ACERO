"use client";

import { useState } from "react";
import { Settings, Save, ShieldAlert, Database, Globe, CheckCircle2 } from "lucide-react";

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("institucional");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 relative">
      
      {saved && (
        <div className="fixed top-24 right-8 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-10 z-50">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">Configuración guardada exitosamente</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Configuración</h1>
          <p className="text-sm text-slate-500 mt-1">
            Preferencias globales e información institucional del sistema.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Save size={18} />
          Guardar cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("institucional")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-left transition-colors ${activeTab === 'institucional' ? 'bg-white border border-[#10B981] text-[#10B981] shadow-sm' : 'bg-transparent hover:bg-slate-100 text-slate-600'}`}
          >
            <Globe size={18} /> Información institucional
          </button>
          <button 
            onClick={() => setActiveTab("roles")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-left transition-colors ${activeTab === 'roles' ? 'bg-white border border-[#10B981] text-[#10B981] shadow-sm' : 'bg-transparent hover:bg-slate-100 text-slate-600'}`}
          >
            <ShieldAlert size={18} /> Roles y permisos
          </button>
          <button 
            onClick={() => setActiveTab("conexion")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-left transition-colors ${activeTab === 'conexion' ? 'bg-white border border-[#10B981] text-[#10B981] shadow-sm' : 'bg-transparent hover:bg-slate-100 text-slate-600'}`}
          >
            <Database size={18} /> Conexión y estado
          </button>
        </div>

        {/* Content Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === "institucional" && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
              <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Globe className="text-slate-400" size={18} /> Detalles de la Institución
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Institucional</label>
                  <input type="text" defaultValue="Unión de Acero" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Slogan o Descripción</label>
                  <input type="text" defaultValue="Plataforma Sindical" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">País</label>
                    <input type="text" defaultValue="Bolivia"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Moneda base</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]">
                      <option>BOB - Boliviano</option>
                      <option>USD - Dólar</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
              <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <ShieldAlert className="text-slate-400" size={18} /> Roles de Usuario
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Aún no has invitado a otros administradores al sistema.</p>
                <button className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">
                  + Invitar Administrador
                </button>
              </div>
            </div>
          )}

          {activeTab === "conexion" && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
              <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Database className="text-slate-400" size={18} /> API y Conexión (Google Apps Script)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">URL Base (Webhook)</label>
                  <input type="text" defaultValue="https://script.google.com/macros/s/AKfycbyGDnWz_znUwnCmpUtDDczRIIgjdSGonDnBFOpaZ2iqtSrPHAnbUR96Vc9Izkfs0wM-Xg/exec" disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-mono text-xs" />
                  <p className="text-xs text-slate-500 mt-2">Esta URL está configurada desde el backend y gestiona las funciones del sistema sindical.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

