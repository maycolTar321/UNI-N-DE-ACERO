"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, FileText, AlertCircle, MapPin, Search, Camera } from "lucide-react";
import Link from "next/link";
import { useSharedData, mutateData } from "@/lib/useSharedData";
import { api } from "@/lib/api";
import { Afiliado } from "@/lib/types";


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
          datos: (await api.getAfiliados()).datos
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
          datos: (await api.getAfiliados()).datos
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
          datos: (await api.getAfiliados()).datos
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const isAprobado = afiliado.estado_afiliacion === 'APROBADO';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      }
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
