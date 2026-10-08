"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { mutateData, getCachedData } from "@/lib/useSharedData";

export default function NuevoAfiliadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    ci: "",
    nombres: "",
    apellidos: "",
    fecha_nacimiento: "",
    sexo: "MASCULINO",
    telefono: "",
    whatsapp: "",
    correo: "",
    direccion: "",
    empresa_id: "",
    cargo: "",
    especialidad: "",
    fecha_ingreso_laboral: "",
    fecha_afiliacion: "",
    tipo_afiliacion: "NUEVO",
    observaciones: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, fecha_afiliacion: new Date().toISOString().split('T')[0] }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validation
    if (!formData.ci || !formData.nombres || !formData.apellidos) {
      setError("CI, Nombres y Apellidos son campos obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const nuevoAfiliado = {
        ...formData,
        id: `temp-${Date.now()}`,
        codigo_afiliado: `UA-TEMP-${Date.now()}`,
        estado: "PENDIENTE" as "ACTIVO" | "PENDIENTE" | "RECHAZADO",
        fotografia: "",
        registrado_por: "Administrador"
      };

      const res = await api.registrarAfiliado(nuevoAfiliado);

      if (res.exito) {
        setSuccess(true);
        // Actualización optimista del caché
        const currentCache = getCachedData("afiliados");
        if (currentCache && currentCache.exito && Array.isArray(currentCache.datos)) {
          mutateData("afiliados", { ...currentCache, datos: [...currentCache.datos, nuevoAfiliado] });
        }
        
        setTimeout(() => {
          router.push("/afiliados");
        }, 1500);
      } else {
        setError(res.mensaje || "Error al registrar.");
      }
    } catch (err) {
      setError("No pudimos conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-2xl border border-emerald-200 shadow-sm text-center animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Save size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">¡Afiliado registrado correctamente!</h2>
        <p className="text-slate-500 mb-6">Redirigiendo a la lista de afiliados...</p>
        <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/afiliados" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Nuevo Afiliado
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa los datos para registrar un nuevo miembro en la plataforma.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-emerald-50 border border-red-200 rounded-xl p-4 flex gap-3 text-red-700 items-start">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección: Datos Personales */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 pb-4 border-b border-slate-100">
            Datos Personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Cédula de Identidad (CI) *</label>
              <input type="text" name="ci" value={formData.ci} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                placeholder="Ej. 12345678" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all">
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombres *</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                placeholder="Nombres completos" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Apellidos *</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                placeholder="Apellidos completos" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" />
            </div>
          </div>
        </div>

        {/* Sección: Contacto */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 pb-4 border-b border-slate-100">
            Datos de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp</label>
              <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Dirección</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" />
            </div>
          </div>
        </div>

        {/* Sección: Laboral */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 pb-4 border-b border-slate-100">
            Información Laboral
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Empresa</label>
              <input type="text" name="empresa_id" value={formData.empresa_id} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                placeholder="Nombre de la empresa" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Cargo</label>
              <input type="text" name="cargo" value={formData.cargo} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/afiliados" className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? "Registrando..." : "Guardar Afiliado"}
          </button>
        </div>
      </form>
    </div>
  );
}

