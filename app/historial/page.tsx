"use client";

import { useEffect, useState } from "react";
import { Search, History, Filter } from "lucide-react";
import { api } from "@/lib/api";

export default function HistorialPage() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getHistorial();
        if (res.exito && Array.isArray(res.datos)) {
          setHistorial(res.datos);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLogs = (Array.isArray(historial) ? historial : []).filter(log => 
    (log?.descripcion || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log?.usuario || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Historial</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro completo de auditoría y movimientos del sistema.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex gap-4 justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar evento, usuario o acción..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => alert("Filtros de fechas en desarrollo...")} className="flex items-center gap-2 p-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span className="hidden sm:inline text-sm font-bold">Filtros</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#10B981] rounded-full animate-spin mb-4"></div>
              <p className="font-bold">Cargando historial...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <History className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Sin movimientos registrados</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                No hay actividad reciente para mostrar en el sistema.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-slate-800">{log.fecha || "—"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-bold text-slate-700">{log.usuario || "Sistema"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-black tracking-widest uppercase">
                        {log.accion || "EVENTO"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600">{log.descripcion || "Sin detalle"}</div>
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

