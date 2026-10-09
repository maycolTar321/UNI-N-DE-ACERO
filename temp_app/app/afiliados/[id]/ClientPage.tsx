"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, FileText, AlertCircle, MapPin, Search, Camera } from "lucide-react";
import Link from "next/link";
import { useSharedData, mutateData } from "@/lib/useSharedData";
import { api } from "@/lib/api";
import { Afiliado } from "@/lib/types";
import { CameraCapture } from "@/components/CameraCapture";

export default function ExpedienteAfiliadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: afiliadosResponse, loading } = useSharedData("afiliados", async () => await api.getAfiliados());
  
  const afiliado: Afiliado | undefined = Array.isArray(afiliadosResponse?.datos) 
    ? afiliadosResponse.datos.find((a: Afiliado) => a.id?.toString() === id || a.ci?.toString() === id) 
    : undefined;

  const [saving, setSaving] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  if (loading) return <div className="p-8 text-center"><Clock className="animate-spin inline-block mr-2" /> Cargando expediente...</div>;
  if (!afiliado) return <div className="p-8 text-center text-red-500">Afiliado no encontrado.</div>;

  const handleUpdatePhoto = async (newPhoto: string) => {
    setSaving(true);
    try {
      const updatedAfiliado = { ...afiliado, fotografia: newPhoto };
      if (afiliadosResponse?.datos) {
        mutateData("afiliados", {
          ...afiliadosResponse,
          datos: afiliadosResponse.datos.map((a: Afiliado) => a.id === afiliado.id ? updatedAfiliado : a)
        });
      }
    } finally {
      setSaving(false);
      setCameraActive(false);
    }
  };

  const handleUpdateDocStatus = async (docKey: "cedula" | "croquis_empresa" | "croquis_domicilio" | "servicio_basico", newStatus: "PRESENTADO" | "OBSERVADO") => {
    setSaving(true);
    try {
      const updatedDocs = { 
        ...afiliado.documentos, 
        [docKey]: { ...(afiliado.documentos as any)?.[docKey], estado: newStatus } 
      };
      
      const todosPresentados = Object.values(updatedDocs).every((d: any) => d?.estado === "PRESENTADO");
      
      const updatedAfiliado = { 
        ...afiliado, 
        documentos: updatedDocs as any,
        estado_expediente: todosPresentados && afiliado.estado_expediente !== 'APROBADO' ? "EN_REVISION" : afiliado.estado_expediente
      };
      
      await api.actualizarAfiliado(String(afiliado.id), updatedAfiliado);
      
      if (afiliadosResponse?.datos) {
        mutateData("afiliados", {
          ...afiliadosResponse,
          datos: afiliadosResponse.datos.map((a: Afiliado) => a.id === afiliado.id ? updatedAfiliado : a)
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAprobarExpediente = async () => {
    setSaving(true);
    try {
      const updatedAfiliado = { ...afiliado, estado_afiliacion: "APROBADO" as const, estado_expediente: "APROBADO" as const, estado_carnet: "LISTO" as const };
      await api.actualizarAfiliado(String(afiliado.id), updatedAfiliado);
      
      if (afiliadosResponse?.datos) {
        mutateData("afiliados", {
          ...afiliadosResponse,
          datos: afiliadosResponse.datos.map((a: Afiliado) => a.id === afiliado.id ? updatedAfiliado : a)
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const isAprobado = afiliado.estado_afiliacion === 'APROBADO';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      {cameraActive && (
        <CameraCapture 
          onConfirm={handleUpdatePhoto} 
          onCancel={() => setCameraActive(false)} 
        />
      )}

      <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/afiliados" className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50"><ArrowLeft size={20}/></Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Expediente Digital</h1>
            <p className="text-sm text-slate-500">{afiliado.nombres} {afiliado.apellidos}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`px-4 py-1 rounded-full text-xs font-bold ${isAprobado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {isAprobado ? 'EXPEDIENTE APROBADO' : afiliado.estado_expediente || 'INCOMPLETO'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RESUMEN PERFIL */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-1 space-y-4">
          <div className="w-24 h-24 rounded-full mx-auto bg-slate-100 border-4 border-slate-50 overflow-hidden flex items-center justify-center relative group">
            {afiliado.fotografia && afiliado.fotografia.length > 10 ? (
              <img src={afiliado.fotografia} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <Search className="text-slate-300" size={32} />
            )}
            <button onClick={() => setCameraActive(true)} className="absolute inset-0 bg-slate-900/40 text-white flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
              <Camera size={20} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cambiar</span>
            </button>
          </div>
          <div className="text-center">
            <h2 className="font-bold text-slate-800">{afiliado.nombres} {afiliado.apellidos}</h2>
            <p className="text-sm text-slate-500">CI: {afiliado.ci}</p>
            <p className="text-sm text-slate-500">{afiliado.cargo} - {afiliado.especialidad}</p>
          </div>
          <hr className="border-slate-100" />
          <div className="text-sm">
            <p className="font-bold text-slate-700">Contacto</p>
            <p className="text-slate-600">{afiliado.telefono || 'Sin teléfono'}</p>
          </div>
          <div className="text-sm">
            <p className="font-bold text-slate-700">Ubicación</p>
            <p className="text-slate-600 truncate">{afiliado.direccion || 'Sin dirección'}</p>
            {afiliado.coordenadas_domicilio && (
              <a href={`https://www.google.com/maps?q=${afiliado.coordenadas_domicilio.lat},${afiliado.coordenadas_domicilio.lng}`} target="_blank" className="text-blue-500 text-xs flex items-center gap-1 mt-1"><MapPin size={12}/> Ver en Mapa</a>
            )}
          </div>
        </div>

        {/* DOCUMENTOS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <h3 className="font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">Requisitos y Documentación</h3>
          <div className="space-y-4">
            {['cedula', 'croquis_empresa', 'croquis_domicilio', 'servicio_basico'].map((docKey) => {
              const doc = (afiliado.documentos as any)?.[docKey] || { estado: 'PENDIENTE' };
              const isPresentado = doc.estado === 'PRESENTADO';
              const isPendiente = doc.estado === 'PENDIENTE';
              return (
                <div key={docKey} className={`p-4 rounded-xl border flex justify-between items-center ${isPresentado ? 'bg-emerald-50 border-emerald-100' : isPendiente ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                  <div className="flex items-center gap-3">
                    <FileText className={isPresentado ? "text-emerald-500" : isPendiente ? "text-slate-400" : "text-rose-500"} size={24} />
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{docKey.replace('_', ' ').toUpperCase()}</p>
                      <p className={`text-xs font-bold ${isPresentado ? 'text-emerald-600' : isPendiente ? 'text-slate-500' : 'text-rose-600'}`}>{doc.estado}</p>
                    </div>
                  </div>
                  {!isAprobado && (
                    <div className="flex gap-2">
                      {!isPresentado && (
                        <button onClick={() => handleUpdateDocStatus(docKey as any, "PRESENTADO")} disabled={saving} className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600">Presentar</button>
                      )}
                      {isPresentado && (
                        <button onClick={() => handleUpdateDocStatus(docKey as any, "OBSERVADO")} disabled={saving} className="px-3 py-1.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-200">Observar</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            {isAprobado ? (
              <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2"><CheckCircle2/> <span className="font-bold">Expediente Aprobado</span></div>
                <Link href="/carnets" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm">Generar Carnet</Link>
              </div>
            ) : (
              <button 
                onClick={handleAprobarExpediente} 
                disabled={saving || !['EN_REVISION', 'COMPLETO'].includes(afiliado.estado_expediente || '')}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Aprobar Afiliación y Expediente
              </button>
            )}
            {!isAprobado && !['EN_REVISION', 'COMPLETO'].includes(afiliado.estado_expediente || '') && (
              <p className="text-xs text-center text-slate-500 mt-2">Debe presentar todos los documentos para poder aprobar.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
