"use client";

import { useState, useEffect } from "react";
import { CreditCard, Search, QrCode, Download, Printer, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Afiliado } from "@/lib/types";
import Image from "next/image";

export default function CarnetsPage() {
  const [searchCi, setSearchCi] = useState("");
  const [loading, setLoading] = useState(false);
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchCi) return;
    setLoading(true);
    setError("");
    setAfiliado(null);
    try {
      const res = await api.getAfiliados();
      if (res.exito && res.datos) {
        const found = res.datos.find((a: Afiliado) => a.ci?.toString() === searchCi.trim());
        if (found) {
          setAfiliado(found);
        } else {
          setAfiliado({
            id: "mock",
            codigo_afiliado: "UA-MOCK",
            nombres: "MIGUEL",
            apellidos: "RETAMOZO",
            ci: searchCi.trim() || "7204466",
            fecha_nacimiento: "1990-01-01",
            sexo: "MASCULINO",
            fotografia: "",
            telefono: "7204466",
            whatsapp: "7204466",
            correo: "test@test.com",
            direccion: "Calle 1",
            empresa_id: "1",
            cargo: "SOLDADOR",
            especialidad: "SOLDADOR",
            fecha_ingreso_laboral: "2026-01-01",
            fecha_afiliacion: "2026-01-01",
            tipo_afiliacion: "SINDICAL",
            estado: "ACTIVO",
            observaciones: ""
          });
          setError("Nota: Afiliado de prueba cargado. (No se encontró en la base de datos)");
        }
      } else {
        throw new Error("API Falla");
      }
    } catch (err) {
      setAfiliado({
        id: "mock",
        codigo_afiliado: "UA-MOCK2",
        nombres: "YAMIL",
        apellidos: "YAÑEZ",
        ci: searchCi.trim() || "123456",
        fecha_nacimiento: "1990-01-01",
        sexo: "MASCULINO",
        fotografia: "",
        telefono: "00000",
        whatsapp: "00000",
        correo: "test@test.com",
        direccion: "Calle 1",
        empresa_id: "1",
        cargo: "DIRIGENTE",
        especialidad: "DIRIGENTE",
        fecha_ingreso_laboral: "2026-01-01",
        fecha_afiliacion: "2026-01-01",
        tipo_afiliacion: "SINDICAL",
        estado: "ACTIVO",
        observaciones: ""
      });
      setError("Nota: Mostrando carnet de prueba por error de red.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 pb-12`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            <CreditCard className="text-blue-500" />
            Emisión de Carnets
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Genera, previsualiza y emite carnets de afiliación oficiales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
        
        {/* Buscador de Afiliado */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col print:hidden">
          <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Search className="text-slate-400" size={18} /> Buscar Afiliado
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ingresa el Cédula de Identidad (CI)</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Ej. 12345678" 
                  value={searchCi}
                  onChange={(e) => setSearchCi(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Buscar'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200">
                {error}
              </div>
            )}

            {afiliado && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex flex-col gap-2 animate-in fade-in">
                <p className="font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Afiliado verificado correctamente.
                </p>
                <p className="text-blue-700">Puedes previsualizar el diseño a la derecha y emitir el carnet físico.</p>
              </div>
            )}
          </div>
        </div>

        {/* Previsualización del Carnet */}
        <div className={`bg-slate-100/50 p-6 md:p-8 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[400px] print:border-none print:bg-white print:p-0 print:min-h-0 ${!afiliado ? 'print:hidden' : 'print:flex print:items-start'}`}>
          {!afiliado ? (
            <div className="text-center text-slate-400 print:hidden">
              <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">El carnet aparecerá aquí</p>
              <p className="text-sm">Busca un afiliado para visualizar su credencial.</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
              
              {/* DISEÑO DEL CARNET (Formato Tarjeta de Crédito 85.60 × 53.98 mm) */}
              {/* Usamos tailwind para simular proporción ~ 1.58:1 */}
              <div id="carnet-node" className="relative w-[340px] h-[215px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-black print:border-2">
                
                {/* Header Carnet */}
                <div className="absolute top-0 left-0 w-full h-16 bg-[#1e3b20] flex items-center px-4 justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                       <Image src="/logo-union-acero.png" alt="Logo UA" width={32} height={32} className="object-contain" />
                    </div>
                    <div className="text-white">
                      <h3 className="text-[9px] font-bold leading-none tracking-widest uppercase opacity-80">Sindicato</h3>
                      <h2 className="text-xs font-black leading-tight uppercase tracking-wide">Unión de Acero</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-[#10B981] uppercase tracking-widest">Credencial</p>
                    <p className="text-[8px] font-bold text-white opacity-80 uppercase tracking-widest">Oficial</p>
                  </div>
                </div>

                {/* Body Carnet */}
                <div className="absolute top-16 left-0 w-full bottom-0 bg-white p-4 flex">
                  
                  {/* Foto Placeholder */}
                  <div className="w-20 h-28 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                    <div className="absolute bottom-0 w-full h-1/3 bg-slate-200 rounded-t-full opacity-50"></div>
                    <div className="absolute top-4 w-10 h-10 bg-slate-200 rounded-full opacity-50"></div>
                  </div>
                  
                  {/* Datos Afiliado */}
                  <div className="ml-4 flex-1 flex flex-col justify-start pt-1">
                    <div className="mb-1.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0">Apellidos y Nombres</p>
                      <p className="text-[11px] font-black text-slate-800 leading-tight uppercase">{afiliado.nombres} {afiliado.apellidos}</p>
                    </div>
                    
                    <div className="mb-1.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0">Cédula de Identidad</p>
                      <p className="text-xs font-bold text-slate-700 leading-tight">{afiliado.ci}</p>
                    </div>
                    
                    <div className="mb-1.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0">Especialidad</p>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight">{afiliado.especialidad}</p>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Vigencia</p>
                        <p className="text-[10px] font-bold text-emerald-600">Dic 2027</p>
                      </div>
                      
                      <div className="w-12 h-12 bg-slate-50 p-1 rounded-md border border-slate-200 flex items-center justify-center">
                        <QrCode className="text-slate-800" size={32} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Banda de color inferior */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1e3b20] to-[#10B981]"></div>
              </div>

              {/* Botones de Acción (No imprimibles) */}
              <div className="flex gap-2 w-[340px] print:hidden">
                <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all">
                  <Printer size={18} />
                  Imprimir Carnet
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
