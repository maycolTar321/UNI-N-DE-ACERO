"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Loader2, AlertCircle, Camera, Upload, MapPin, FileText, CheckCircle2, Circle, Clock } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CameraCapture } from "@/components/CameraCapture";
import { useRouter } from "next/navigation";
import { mutateData, getCachedData } from "@/lib/useSharedData";
import { Afiliado } from "@/lib/types";

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

  const [fotografia, setFotografia] = useState<string>("");
  const [coordenadas, setCoordenadas] = useState<{lat: number, lng: number} | null>(null);
  const [docs, setDocs] = useState({
    cedula: "PENDIENTE" as "PRESENTADO" | "PENDIENTE" | "OMITIDO",
    croquis_empresa: "PENDIENTE" as "PRESENTADO" | "PENDIENTE" | "OMITIDO",
    croquis_domicilio: "PENDIENTE" as "PRESENTADO" | "PENDIENTE" | "OMITIDO",
    servicio_basico: "PENDIENTE" as "PRESENTADO" | "PENDIENTE" | "OMITIDO"
  });

  const [cameraActive, setCameraActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotografia(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

    if (!formData.ci || !formData.nombres || !formData.apellidos) {
      setError("CI, Nombres y Apellidos son campos obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const docsFormateados = {
        cedula: { estado: docs.cedula === "OMITIDO" ? "PENDIENTE" : docs.cedula },
        croquis_domicilio: { estado: docs.croquis_domicilio === "OMITIDO" ? "PENDIENTE" : docs.croquis_domicilio },
        croquis_empresa: { estado: docs.croquis_empresa === "OMITIDO" ? "PENDIENTE" : docs.croquis_empresa },
        servicio_basico: { estado: docs.servicio_basico === "OMITIDO" ? "PENDIENTE" : docs.servicio_basico }
      };

      const todosPresentados = Object.values(docsFormateados).every(d => d.estado === "PRESENTADO");

      const nuevoAfiliado = {
        ...formData,
        id: `temp-${Date.now()}`,
        codigo_afiliado: `UA-TEMP-${Date.now()}`,
        estado: "PENDIENTE" as const,
        fotografia: fotografia,
        coordenadas_domicilio: coordenadas || undefined,
        estado_expediente: (todosPresentados ? "EN_REVISION" : "INCOMPLETO") as "EN_REVISION" | "INCOMPLETO",
        estado_carnet: "PENDIENTE" as "PENDIENTE",
        documentos: docsFormateados as any,
        registrado_por: "Administrador"
      };

      const res = await api.registrarAfiliado(nuevoAfiliado);

      if (res.exito) {
        setSuccess(true);
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
        <p className="text-slate-500 mb-6">El expediente se guardó. Redirigiendo...</p>
        <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const renderDocToggle = (key: keyof typeof docs, label: string) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${docs[key] === 'PRESENTADO' ? 'bg-emerald-100 text-emerald-600' : docs[key] === 'OMITIDO' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
          <FileText size={20} />
        </div>
        <div>
          <div className="font-bold text-slate-800 text-sm">{label}</div>
          <div className="text-xs text-slate-500">
            {docs[key] === 'PRESENTADO' ? 'Documento adjunto' : docs[key] === 'OMITIDO' ? 'Omitido temporalmente' : 'Requisito obligatorio'}
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button type="button" onClick={() => setDocs(p => ({...p, [key]: 'PRESENTADO'}))} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${docs[key] === 'PRESENTADO' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
          Presentado
        </button>
        <button type="button" onClick={() => setDocs(p => ({...p, [key]: 'OMITIDO'}))} className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${docs[key] === 'OMITIDO' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
          Omitir
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/afiliados" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Expediente de Afiliación</h1>
          <p className="text-sm text-slate-500 mt-1">Ingresa los datos. Puedes omitir documentos y completarlos luego.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 text-rose-700 items-start">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {cameraActive && (
          <CameraCapture 
            onConfirm={(img) => { setFotografia(img); setCameraActive(false); }} 
            onCancel={() => setCameraActive(false)} 
          />
        )}

        {/* FOTOGRAFIA */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Camera size={16} /> Fotografía para Carnet
          </h2>
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-32 h-40 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shrink-0 relative">
              {fotografia ? (
                <img src={fotografia} alt="Foto Carnet" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400 flex flex-col items-center">
                  <Camera size={32} className="mb-2" />
                  <span className="text-[10px] font-bold text-center">Sin foto<br/>(Requerida)</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setCameraActive(true)} className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-800/20 hover:bg-slate-700 transition-colors">
                  <Camera size={18} /> {fotografia ? 'Volver a Tomar Fotografía' : 'Tomar Fotografía'}
                </button>
                <label className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer">
                  <Upload size={18} /> Subir Archivo
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                {fotografia && <button type="button" onClick={() => setFotografia("")} className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors">Quitar Foto</button>}
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                El sistema usará esta fotografía automáticamente para el carnet sindical. 
                <br/><b>Sin foto el expediente se guardará como PENDIENTE.</b>
              </p>
            </div>
          </div>
        </div>

        {/* DATOS PERSONALES */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Circle size={16} /> Datos Personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Cédula de Identidad (CI) *</label>
              <input type="text" name="ci" value={formData.ci} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Ej. 12345678" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nombres *</label>
              <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Apellidos *</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Fecha Nacimiento</label>
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono / Celular</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
          </div>
        </div>

        {/* DOMICILIO Y MAPA */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <MapPin size={16} /> Domicilio y Ubicación
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Dirección Escrita</label>
              <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="Zona, Calle, Número..." />
            </div>
            <div className="bg-slate-100 rounded-xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
              <MapPin className="text-slate-400 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-600 mb-1">Coordenadas GPS (Opcional)</p>
              <p className="text-xs text-slate-500 mb-4 text-center">Permite guardar la latitud y longitud exacta para facilitar notificaciones.</p>
              {coordenadas ? (
                <div className="flex gap-2 items-center bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold">
                  <CheckCircle2 size={16} /> {coordenadas.lat.toFixed(4)}, {coordenadas.lng.toFixed(4)}
                  <button type="button" onClick={() => setCoordenadas(null)} className="ml-2 underline text-xs">Borrar</button>
                </div>
              ) : (
                <button type="button" onClick={() => {
                  if(navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setCoordenadas({lat: pos.coords.latitude, lng: pos.coords.longitude});
                    }, () => alert("No se pudo obtener la ubicación."));
                  }
                }} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Obtener mi ubicación actual
                </button>
              )}
            </div>
          </div>
        </div>

        {/* REQUISITOS DOCUMENTALES */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Clock size={16} /> Expediente y Requisitos
          </h2>
          <p className="text-sm text-slate-600 mb-6">Selecciona los documentos que estás adjuntando físicamente o digitalmente ahora mismo. Si falta alguno, puedes "Omitir" y el expediente quedará PENDIENTE.</p>
          
          <div className="space-y-3">
            {renderDocToggle('cedula', 'Copia de Cédula de Identidad')}
            {renderDocToggle('croquis_empresa', 'Croquis del Lugar de Trabajo')}
            {renderDocToggle('croquis_domicilio', 'Croquis de Domicilio')}
            {renderDocToggle('servicio_basico', 'Fotocopia de Servicio Básico (Luz/Agua/Gas)')}
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex justify-end gap-4 pt-4 sticky bottom-4 bg-slate-50/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 shadow-2xl">
          <Link href="/afiliados" className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-[#10B981] hover:bg-[#059669] transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {loading ? "Guardando..." : "Guardar Expediente"}
          </button>
        </div>
      </form>
    </div>
  );
}

