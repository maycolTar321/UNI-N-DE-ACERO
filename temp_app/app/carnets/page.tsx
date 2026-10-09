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
  const [vigencia, setVigencia] = useState("Diciembre 2027");
  const [showRenovar, setShowRenovar] = useState(false);
  const [nuevaVigencia, setNuevaVigencia] = useState("");
  const [renovando, setRenovando] = useState(false);

  const handleSearch = async () => {
    if (!searchCi) return;
    setLoading(true);
    setError("");
    setAfiliado(null);
    try {
      const res = await api.getAfiliados();
      if (res.exito && res.datos) {
        const found = res.datos.find((a: Afiliado) => a.ci?.toString() === searchCi.trim() || a.codigo_afiliado === searchCi.trim());
        if (found) {
          setAfiliado(found);
          setVigencia((found as any).vigencia_carnet || "Diciembre 2027");
        } else {
          setError("No se encontró ningún afiliado con esa cédula.");
        }
      } else {
        throw new Error("Error al obtener la lista de afiliados.");
      }
    } catch (err) {
      setError("Error de conexión al buscar el afiliado.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenovar = async () => {
    if (!afiliado || !nuevaVigencia) return;
    setRenovando(true);
    try {
      await api.actualizarVigencia(afiliado.ci.toString(), nuevaVigencia);
      setVigencia(nuevaVigencia);
      setShowRenovar(false);
      setNuevaVigencia("");
    } catch(e) {
      console.error(e);
    } finally {
      setRenovando(false);
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:block">
        
        {/* Buscador de Afiliado */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col print:hidden">
          <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Search className="text-slate-400" size={18} /> Buscar Afiliado
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-2">Ingresa el Cédula de Identidad (CI)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ej. 12345678" 
                    value={searchCi}
                    onChange={(e) => setSearchCi(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" />
                  <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Buscar'}
                  </button>
                </div>
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
                {afiliado.estado_expediente === 'APROBADO' ? (
                  <p className="text-blue-700">Puedes previsualizar el diseño a la derecha y emitir el carnet físico.</p>
                ) : (
                  <div className="bg-amber-100 text-amber-800 p-3 rounded-lg mt-2">
                    <p className="font-bold">⚠️ Expediente NO aprobado</p>
                    <p className="mb-2">Debes revisar y aprobar los documentos antes de emitir el carnet.</p>
                    <a href={`/afiliados/${afiliado.ci}`} className="underline font-bold">Ir a Revisión de Expediente</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Previsualización del Carnet */}
        <div className={`bg-slate-100/50 p-2 sm:p-6 md:p-8 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-start min-h-[400px] overflow-x-auto print:border-none print:bg-white print:p-0 print:min-h-0 ${!afiliado ? 'print:hidden' : 'print:flex print:items-start'}`}>
          {!afiliado ? (
            <div className="text-center text-slate-400 print:hidden mt-12">
              <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">El carnet aparecerá aquí</p>
              <p className="text-sm">Busca un afiliado para visualizar su credencial.</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500 transform scale-[0.85] md:scale-100 origin-top print:scale-100">
              
              {/* DISEÑO DEL CARNET (Formato Tarjeta de Crédito 85.60 × 53.98 mm) */}
              <div id="carnet-node" className="relative w-[340px] shrink-0 h-[215px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-black print:border-[1px] print:w-[85.6mm] print:h-[54mm] print:break-inside-avoid">
                
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
                <div className="absolute top-16 left-0 w-full bottom-0 bg-white px-4 py-2 flex">
                  
                  {/* Foto Placeholder */}
                  <div className="w-20 h-24 mt-1 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative">
                    {afiliado.fotografia && afiliado.fotografia.length > 10 ? (
                      <img src={afiliado.fotografia} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute bottom-0 w-full h-1/3 bg-slate-200 rounded-t-full opacity-50"></div>
                        <div className="absolute top-4 w-10 h-10 bg-slate-200 rounded-full opacity-50"></div>
                      </>
                    )}
                  </div>
                  
                  {/* Datos Afiliado */}
                  <div className="ml-4 flex-1 flex flex-col justify-start pt-1">
                    <div className="mb-0.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0">Apellidos y Nombres</p>
                      <p className="text-[10px] font-black text-slate-800 leading-tight uppercase">{afiliado.nombres} {afiliado.apellidos}</p>
                    </div>
                    
                    <div className="mb-0.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0">Cédula de Identidad</p>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight">{afiliado.ci}</p>
                    </div>
                    
                    <div className="mb-0.5">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0">Especialidad</p>
                      <p className="text-[10px] font-bold text-slate-700 leading-tight">{afiliado.especialidad}</p>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0">Vigencia</p>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">{vigencia}</p>
                      </div>
                      
                      <div className="w-8 h-8 bg-slate-50 p-1 rounded-md border border-slate-200 flex items-center justify-center">
                        <QrCode className="text-slate-800" size={32} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Banda de color inferior */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1e3b20] to-[#10B981]"></div>
              </div>

              {/* REVERSO DEL CARNET */}
              <div className="relative w-[340px] shrink-0 h-[215px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 print:shadow-none print:border-black print:border-[1px] print:w-[85.6mm] print:h-[54mm] print:break-inside-avoid flex flex-col">
                <div className="bg-[#1e3b20] h-8 w-full shrink-0 flex items-center justify-center">
                   <p className="text-white/80 text-[8px] tracking-widest uppercase font-bold">Válido en todo el territorio nacional</p>
                </div>
                <div className="p-4 flex-1 flex flex-col relative bg-slate-50/30">
                  <div className="text-[7px] text-center text-slate-500 font-bold mb-4 uppercase leading-relaxed">
                    Este documento es personal e intransferible.<br/>
                    Acredita a su portador como afiliado activo del<br/>
                    Sindicato de Trabajadores &quot;Unión de Acero&quot;.<br/>
                    En caso de extravío, devolver a la directiva.
                  </div>

                  <div className="flex-1 flex items-end justify-between px-2 pb-2">
                    <div className="flex flex-col items-center">
                      <div className="w-24 border-b border-slate-800 mb-1"></div>
                      <span className="text-[6px] font-black uppercase text-slate-600">Firma del Titular</span>
                    </div>

                    {/* Espacio para Sello */}
                    <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center opacity-60 absolute left-1/2 -translate-x-1/2 bottom-8">
                      <span className="text-[7px] font-black text-slate-400 text-center uppercase leading-none">Sello<br/>Sindicato</span>
                    </div>

                    <div className="flex flex-col items-center z-10">
                      <div className="w-24 border-b border-slate-800 mb-1"></div>
                      <span className="text-[6px] font-black uppercase text-slate-600">Sec. Ejecutivo</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1e3b20] to-[#10B981]"></div>
              </div>

              {/* Botones de Acción (No imprimibles) */}
              <div className="flex flex-col sm:flex-row gap-2 w-[340px] print:hidden">
                <button disabled={afiliado.estado_expediente !== 'APROBADO'} onClick={() => setShowRenovar(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50">
                  Renovar Vigencia
                </button>
                <button disabled={afiliado.estado_expediente !== 'APROBADO'} onClick={async () => {
                  if (afiliado.estado_expediente !== 'APROBADO') return;
                  await api.actualizarVigencia(afiliado.ci, vigencia); // Usando API update as example
                  handlePrint();
                }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Printer size={18} />
                  Imprimir Carnet
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {showRenovar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">Renovar Vigencia</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nueva Fecha de Vigencia</label>
                <input 
                  type="text" 
                  placeholder="Ej. Diciembre 2028"
                  value={nuevaVigencia}
                  onChange={(e) => setNuevaVigencia(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setShowRenovar(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleRenovar}
                  disabled={renovando || !nuevaVigencia}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {renovando ? <Loader2 size={16} className="animate-spin" /> : 'Guardar y Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
