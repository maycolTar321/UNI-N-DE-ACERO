"use client";

import { useState } from "react";
import { CreditCard, Search, QrCode, Download, Printer } from "lucide-react";

export default function CarnetsPage() {
  const [carnetGenerado, setCarnetGenerado] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Emisión de Carnets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Genera y valida carnets digitales de afiliación con código QR.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Buscador de Afiliado */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
            <Search className="text-slate-400" size={18} /> Buscar Afiliado
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ingresa el CI o Código de Afiliado</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Ej. 12345678 o UA-2026-..." 
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
                <button 
                  onClick={() => setCarnetGenerado(true)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition-colors">
                  Buscar
                </button>
              </div>
            </div>
            
            {carnetGenerado && (
              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex flex-col gap-2">
                <p className="font-bold">Afiliado encontrado y verificado como ACTIVO.</p>
                <p>Puedes previsualizar el carnet a la derecha y emitirlo.</p>
              </div>
            )}
          </div>
        </div>

        {/* Previsualización del Carnet */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] bg-slate-50/50">
          
          {!carnetGenerado ? (
            <div className="text-center flex flex-col items-center opacity-50">
              <CreditCard size={48} className="text-slate-400 mb-4" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Previsualización</p>
              <p className="text-xs text-slate-400 mt-2">Busca un afiliado para generar su carnet.</p>
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 text-white animate-in zoom-in duration-300">
                <div className="p-5 bg-gradient-to-r from-[#10B981] to-[#059669] flex justify-between items-center border-b border-white/10">
                  <span className="font-black tracking-widest text-xs">UNIÓN DE ACERO</span>
                  <span className="text-[10px] bg-slate-900/30 px-2 py-0.5 rounded-full font-bold">2026</span>
                </div>
                
                <div className="p-6 flex gap-4 items-start">
                  <div className="w-20 h-24 bg-slate-700 rounded border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                    <span className="text-xs text-slate-500 font-bold">FOTO</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Nombres</p>
                      <p className="font-bold text-sm leading-tight">Juan Carlos Pérez</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">CI</p>
                      <p className="font-mono text-sm leading-tight">12345678</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Empresa</p>
                      <p className="text-sm leading-tight truncate">Metalúrgica ABC</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-slate-900/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Código Afiliado</span>
                    <span className="font-mono font-bold text-[#10B981]">UA-2026-000001</span>
                  </div>
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-black">
                    <QrCode size={36} />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 justify-center">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-xs font-bold transition-colors">
                  <Printer size={14} /> Imprimir
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20">
                  <Download size={14} /> Descargar PDF
                </button>
              </div>
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
}

