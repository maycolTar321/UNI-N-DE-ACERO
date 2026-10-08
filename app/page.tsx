"use client";

import { Users, CheckCircle2, Clock, Building2, TrendingUp, AlertCircle, Plus, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useSharedData } from "@/lib/useSharedData";
import { Afiliado, Empresa } from "@/lib/types";

export default function Dashboard() {
  const { data: afiliadosResponse, loading: loadingAfiliados, error: errorAfiliados } = useSharedData(
    "afiliados",
    async () => await api.getAfiliados()
  );

  const { data: empresasResponse, loading: loadingEmpresas } = useSharedData(
    "empresas",
    async () => await api.getEmpresas()
  );

  const afiliados = Array.isArray(afiliadosResponse?.datos) ? (afiliadosResponse!.datos as Afiliado[]) : [];
  const empresas = Array.isArray(empresasResponse?.datos) ? (empresasResponse!.datos as Empresa[]) : [];
  const loading = loadingAfiliados || loadingEmpresas;
  const error = errorAfiliados || (!afiliadosResponse?.exito && !loadingAfiliados ? afiliadosResponse?.mensaje : null);

  const totalAfiliados = afiliados?.length || 0;
  const activos = afiliados?.filter(a => a.estado === 'ACTIVO').length || 0;
  const pendientes = afiliados?.filter(a => a.estado === 'PENDIENTE').length || 0;
  const rechazados = afiliados?.filter(a => a.estado === 'RECHAZADO').length || 0;
  const totalEmpresas = empresas?.length || 0;

  const statCards = [
    {
      title: "Total Afiliados",
      value: totalAfiliados,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Afiliados Activos",
      value: activos,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      title: "Pendientes",
      value: pendientes,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-100",
    },
    {
      title: "Empresas",
      value: totalEmpresas,
      icon: Building2,
      color: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-100",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Centro de Control <span className="text-[#10B981]">Sindical</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resumen general de Unión de Acero
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
          >
            <TrendingUp size={18} />
            Generar Reporte
          </button>
          <Link
            href="/afiliados/nuevo"
            className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus size={18} />
            Nuevo Afiliado
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 font-bold flex flex-col items-center">
          <AlertCircle size={32} className="mb-2" />
          <p>Error al cargar los datos</p>
          <p className="text-sm font-normal mt-1">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold shadow hover:bg-red-700">Reintentar</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className={`bg-white p-6 rounded-2xl border ${stat.borderColor} shadow-sm flex flex-col gap-4 relative overflow-hidden group`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">{stat.title}</p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-100 animate-pulse rounded mt-1"></div>
                ) : (
                  <h3 className="text-3xl font-black text-slate-800 mt-1">{stat.value}</h3>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                <stat.icon size={100} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Actividad Reciente</h2>
              <p className="text-xs font-medium text-slate-500">Últimos movimientos del sistema</p>
            </div>
            <Link href="/historial" className="text-sm font-bold text-[#10B981] hover:text-[#059669] flex items-center gap-1">
              Ver todo <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            {loading ? (
              <Loader2 className="animate-spin text-slate-400 mb-3" size={32} />
            ) : (
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Clock className="text-slate-400" size={32} />
              </div>
            )}
            <h3 className="text-slate-800 font-bold">{loading ? "Cargando..." : "Sin datos registrados"}</h3>
            <p className="text-slate-500 text-sm mt-1">{loading ? "Obteniendo información reciente" : "La actividad reciente aparecerá aquí"}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Empresas</h2>
              <p className="text-xs font-medium text-slate-500">Distribución de afiliados</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 size={18} />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            {loading ? (
              <Loader2 className="animate-spin text-slate-400 mb-3" size={32} />
            ) : (
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Building2 className="text-slate-400" size={32} />
              </div>
            )}
            <h3 className="text-slate-800 font-bold">{loading ? "Cargando..." : ((empresas?.length || 0) > 0 ? `${empresas.length} Empresas` : "Sin datos registrados")}</h3>
            <p className="text-slate-500 text-sm mt-1">{loading ? "Consultando distribución" : ((empresas?.length || 0) > 0 ? "Empresas con convenios activos" : "Registra empresas para ver distribución")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

