"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, MoreVertical, ShieldCheck, Clock, XCircle, Users, Edit2, Trash2, X } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Afiliado } from "@/lib/types";
import { useSharedData } from "@/lib/useSharedData";

export default function AfiliadosPage() {
  const { data: response, loading, error, mutate } = useSharedData("afiliados", async () => await api.getAfiliados());
  const afiliados = response?.exito ? (response.datos as Afiliado[]) : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [selectedAfiliado, setSelectedAfiliado] = useState<Afiliado | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { role } = useAuth();

  const handleDelete = async (afiliado: Afiliado) => {
    if (confirm(`¿Estás seguro de eliminar al afiliado ${afiliado.nombres} ${afiliado.apellidos}? Esta acción borrará el registro de la base de datos permanentemente.`)) {
      const original = response;
      if (original) mutate({ ...original, datos: afiliados.filter(a => a.id !== afiliado.id) });
      
      try {
        const res = await api.eliminarAfiliado(String(afiliado.id));
        if (!res.exito) {
          alert(`Error al eliminar: ${res.mensaje}`);
          if (original) mutate(original);
        }
      } catch (e) {
        alert("Error de conexión al intentar eliminar. El registro no se eliminó.");
        if (original) mutate(original);
      }
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAfiliado) return;
    const original = response;
    if (original) mutate({ ...original, datos: afiliados.map(a => a.id === selectedAfiliado.id ? selectedAfiliado : a) });
    setEditModalOpen(false);
    
    try { 
      const res = await api.actualizarAfiliado(String(selectedAfiliado.id), selectedAfiliado); 
      if (!res.exito) {
        alert(`Error al guardar: ${res.mensaje}`);
        if (original) mutate(original);
      }
    } catch(e) {
      alert("Error de conexión. Se revirtieron los cambios.");
      if (original) mutate(original);
    }
  };

  const getStatusBadge = (afiliado: Afiliado) => {
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex w-fit items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${afiliado.estado_afiliacion === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : afiliado.estado_afiliacion === 'EN_REVISION' ? 'bg-blue-50 text-blue-700 border-blue-200' : afiliado.estado_afiliacion === 'RECHAZADO' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {afiliado.estado_afiliacion === 'APROBADO' ? <ShieldCheck size={14}/> : <Clock size={14}/>} {afiliado.estado_afiliacion}
        </span>
        <span className={`inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${afiliado.estado_operativo === 'ACTIVO' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
          {afiliado.estado_operativo}
        </span>
      </div>
    );
  };

  const filteredAfiliados = (Array.isArray(afiliados) ? afiliados : []).filter(a => {
    const matchesSearch = 
      (a?.nombres || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a?.apellidos || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a?.ci || "").includes(searchTerm) ||
      (a?.codigo_afiliado || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "TODOS" || a.estado_afiliacion === statusFilter || a.estado_operativo === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {editModalOpen && selectedAfiliado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800">Editar Afiliado</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="editForm" onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombres</label>
                    <input required type="text" value={selectedAfiliado.nombres || ''} onChange={e => setSelectedAfiliado({...selectedAfiliado, nombres: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                    <input required type="text" value={selectedAfiliado.apellidos || ''} onChange={e => setSelectedAfiliado({...selectedAfiliado, apellidos: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CI</label>
                    <input required type="text" value={selectedAfiliado.ci || ''} onChange={e => setSelectedAfiliado({...selectedAfiliado, ci: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa</label>
                    <input type="text" value={selectedAfiliado.empresa_id || ''} onChange={e => setSelectedAfiliado({...selectedAfiliado, empresa_id: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cargo</label>
                    <input type="text" value={selectedAfiliado.cargo || ''} onChange={e => setSelectedAfiliado({...selectedAfiliado, cargo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Celular / Teléfono</label>
                    <input type="text" value={selectedAfiliado.telefono || ''} onChange={e => setSelectedAfiliado({...selectedAfiliado, telefono: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
                    <input type="text" value={selectedAfiliado.direccion || ''} onChange={e => setSelectedAfiliado({...selectedAfiliado, direccion: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado Operativo</label>
                    <select value={selectedAfiliado.estado_operativo || 'INACTIVO'} onChange={e => setSelectedAfiliado({...selectedAfiliado, estado_operativo: e.target.value as "ACTIVO" | "INACTIVO"})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                       <option value="ACTIVO">Activo</option>
                       <option value="INACTIVO">Inactivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado Afiliación</label>
                    <select value={selectedAfiliado.estado_afiliacion || 'PENDIENTE'} onChange={e => setSelectedAfiliado({...selectedAfiliado, estado_afiliacion: e.target.value as "PENDIENTE" | "EN_REVISION" | "APROBADO" | "RECHAZADO"})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                       <option value="PENDIENTE">Pendiente</option>
                       <option value="EN_REVISION">En Revisión</option>
                       <option value="APROBADO">Aprobado</option>
                       <option value="RECHAZADO">Rechazado</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl">Cancelar</button>
              <button type="submit" form="editForm" className="px-4 py-2 text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-lg shadow-emerald-500/20">Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Afiliados
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona y administra el registro de afiliados de Unión de Acero.
          </p>
        </div>
        <Link
          href="/afiliados/nuevo"
          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus size={18} />
          Nuevo afiliado
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por código, CI o nombre..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
            <button onClick={() => alert("Filtros avanzados en desarrollo...")} className="p-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#10B981] rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Cargando afiliados...</p>
            </div>
          ) : filteredAfiliados.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Sin afiliados registrados</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                {searchTerm || statusFilter !== "TODOS" 
                  ? "No se encontraron resultados para los filtros aplicados." 
                  : "Cuando registres el primer afiliado aparecerá aquí."}
              </p>
              {!(searchTerm || statusFilter !== "TODOS") && (
                <Link
                  href="/afiliados/nuevo"
                  className="text-sm font-bold text-[#10B981] bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  + Registrar afiliado
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <table className="w-full hidden md:table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código / CI</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Afiliado</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAfiliados.map((afiliado, idx) => (
                    <tr key={afiliado.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm font-bold text-slate-700">{afiliado.codigo_afiliado}</div>
                        <div className="text-xs text-slate-500 mt-0.5">CI: {afiliado.ci}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{afiliado.nombres} {afiliado.apellidos}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{afiliado.cargo}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-slate-700">{afiliado.empresa_id || "—"}</div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(afiliado)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {role === 'ADMIN' && (
                          <div className="flex justify-end gap-2  transition-all">
                            <button onClick={() => { setSelectedAfiliado(afiliado); setEditModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md" title="Editar">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(afiliado)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md" title="Eliminar">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col divide-y divide-slate-100">
                {filteredAfiliados.map((afiliado, idx) => (
                  <div key={afiliado.id || idx} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800">{afiliado.nombres} {afiliado.apellidos}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{afiliado.cargo} • {afiliado.empresa_id || "Sin empresa"}</div>
                      </div>
                      {role === 'ADMIN' && (
                        <div className="flex gap-1">
                          <button onClick={() => { setSelectedAfiliado(afiliado); setEditModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(afiliado)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código</span>
                        <span className="font-mono text-sm font-bold text-slate-700">{afiliado.codigo_afiliado}</span>
                      </div>
                      {getStatusBadge(afiliado)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

