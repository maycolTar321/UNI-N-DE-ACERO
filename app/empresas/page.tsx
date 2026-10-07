"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Building2, MoreVertical } from "lucide-react";
import { api } from "@/lib/api";
import { Empresa } from "@/lib/types";

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getEmpresas();
        if (res.exito && Array.isArray(res.datos)) {
          setEmpresas(res.datos);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredEmpresas = (Array.isArray(empresas) ? empresas : []).filter(e => 
    (e?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmpresa, setNewEmpresa] = useState("");

  const handleSaveEmpresa = () => {
    setIsModalOpen(false);
    alert(`Empresa "${newEmpresa}" registrada exitosamente.`);
    setNewEmpresa("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-4">Nueva Empresa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={newEmpresa}
                  onChange={(e) => setNewEmpresa(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" 
                  placeholder="Ej. Metalúrgica del Sur" 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button onClick={handleSaveEmpresa} className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-[#059669] transition-colors">Guardar Empresa</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Empresas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administración de las empresas asociadas al sindicato.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          Nueva empresa
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar empresa por nombre..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#10B981] rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Cargando empresas...</p>
            </div>
          ) : filteredEmpresas.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Sin empresas registradas</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                No se encontraron empresas asociadas con los parámetros de búsqueda.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Afiliados</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmpresas.map((empresa, idx) => (
                  <tr key={empresa.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                          {(empresa.nombre || "E").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{empresa.nombre}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-slate-600">
                        {empresa.cantidad_afiliados || 0} registrados
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

