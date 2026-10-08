"use client";

import { useState } from "react";
import { Search, Download, FileText, ArrowUpCircle, ArrowDownCircle, Plus, Wallet, Edit2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";

import { usePersistentState } from "@/lib/usePersistentState";

type Movimiento = {
  id: string;
  fecha: string;
  concepto: string;
  tipo: "INGRESO" | "EGRESO";
  monto: number;
  responsable: string;
};

export default function CajaPage() {
  const [movimientos, setMovimientos, isInitialized] = usePersistentState<Movimiento[]>("union_acero_caja", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPrintMode, setIsPrintMode] = useState(false);
  const { role } = useAuth();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMov, setCurrentMov] = useState<Movimiento | null>(null);

  const handleOpenModal = (mov?: Movimiento, tipo?: "INGRESO" | "EGRESO") => {
    if (mov) {
      setCurrentMov(mov);
    } else {
      setCurrentMov({
        id: Date.now().toString(),
        fecha: new Date().toISOString().split('T')[0],
        concepto: "",
        tipo: tipo || "INGRESO",
        monto: 0,
        responsable: "Administrador"
      });
    }
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este movimiento?")) {
      setMovimientos(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSaveMovimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMov) return;
    
    setMovimientos(prev => {
      const exists = prev.find(m => m.id === currentMov.id);
      if (exists) {
        return prev.map(m => m.id === currentMov.id ? currentMov : m);
      } else {
        return [...prev, currentMov];
      }
    });
    setModalOpen(false);
  };

  const ingresos = movimientos.filter(m => m.tipo === "INGRESO").reduce((acc, curr) => acc + curr.monto, 0);
  const egresos = movimientos.filter(m => m.tipo === "EGRESO").reduce((acc, curr) => acc + curr.monto, 0);
  const saldo = ingresos - egresos;

  const filtered = movimientos.filter(m => m.concepto.toLowerCase().includes(searchTerm.toLowerCase()));

  const exportToExcel = () => {
    // Generar un archivo HTML con extensión .xls para que Excel lo abra conservando los estilos y colores
    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2 style="text-align: center; font-family: Arial; color: #333;">ESTADO DE SITUACIÓN FINANCIERA - CAJA</h2>
        <table border="1" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
          <thead>
            <tr style="background-color: #00B0F0; color: white; font-weight: bold;">
              <th style="padding: 8px;">Fecha</th>
              <th style="padding: 8px;">Concepto</th>
              <th style="padding: 8px;">Tipo</th>
              <th style="padding: 8px;">Monto (BOB)</th>
              <th style="padding: 8px;">Responsable</th>
            </tr>
          </thead>
          <tbody>
    `;

    filtered.forEach(m => {
      tableHTML += `
        <tr>
          <td style="padding: 5px;">${m.fecha}</td>
          <td style="padding: 5px;">${m.concepto}</td>
          <td style="padding: 5px; color: ${m.tipo === 'INGRESO' ? '#00B050' : '#FF0000'};">${m.tipo}</td>
          <td style="padding: 5px; text-align: right; font-weight: bold;">${m.monto}</td>
          <td style="padding: 5px;">${m.responsable}</td>
        </tr>
      `;
    });

    tableHTML += `
          </tbody>
          <tfoot>
            <tr style="background-color: #D9D9D9; font-weight: bold;">
              <td colspan="3" style="text-align: right; padding: 8px;">SALDO TOTAL:</td>
              <td colspan="2" style="padding: 8px;">Bs. ${saldo}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Financiero_UA.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${isPrintMode ? 'print-mode' : ''}`}>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      {modalOpen && currentMov && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in print:hidden">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800">{currentMov.concepto ? 'Editar' : 'Nuevo'} {currentMov.tipo}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <div className="p-6">
              <form id="movForm" onSubmit={handleSaveMovimiento} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Concepto</label>
                  <input required type="text" value={currentMov.concepto} onChange={e => setCurrentMov({...currentMov, concepto: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto (Bs)</label>
                    <input required type="number" step="0.01" value={currentMov.monto} onChange={e => setCurrentMov({...currentMov, monto: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                    <input required type="date" value={currentMov.fecha} onChange={e => setCurrentMov({...currentMov, fecha: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                    <select value={currentMov.tipo} onChange={e => setCurrentMov({...currentMov, tipo: e.target.value as "INGRESO"|"EGRESO"})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                      <option value="INGRESO">Ingreso</option>
                      <option value="EGRESO">Egreso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Responsable</label>
                    <input required type="text" value={currentMov.responsable} onChange={e => setCurrentMov({...currentMov, responsable: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl">Cancelar</button>
              <button type="submit" form="movForm" className="px-4 py-2 text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669] rounded-xl shadow-lg shadow-emerald-500/20">Guardar</button>
            </div>
          </div>
        </div>
      )}

      
      {/* HEADER VISIBLE SÓLO EN IMPRESIÓN (PDF) */}
      <div className="hidden print:block mb-10 pb-6 border-b-4 border-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Image src="/logo-union-acero.png" alt="Unión de Acero Logo" width={100} height={100} className="object-contain" priority />
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Sindicato Unión de Acero</h1>
              <h2 className="text-xl font-bold text-slate-600 mt-1 uppercase tracking-widest">Reporte Financiero de Caja</h2>
            </div>
          </div>
          <div className="text-right text-sm text-slate-800 font-medium">
            <p><span className="font-bold">Fecha de Emisión:</span> {new Date().toLocaleDateString()}</p>
            <p><span className="font-bold">Hora:</span> {new Date().toLocaleTimeString()}</p>
            <p><span className="font-bold">Generado por:</span> Administración</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
            <Wallet className="text-emerald-500" />
            Caja y Finanzas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de ingresos, egresos y reportes económicos.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => handleOpenModal(undefined, "INGRESO")} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20">
            <ArrowUpCircle size={18} />
            Ingreso
          </button>
          <button onClick={() => handleOpenModal(undefined, "EGRESO")} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-500/20">
            <ArrowDownCircle size={18} />
            Egreso
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen (Solo en pantalla) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Ingresos</p>
            <p className="text-2xl font-black text-emerald-600">Bs. {ingresos.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
            <ArrowUpCircle className="text-emerald-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Egresos</p>
            <p className="text-2xl font-black text-red-600">Bs. {egresos.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <ArrowDownCircle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo Actual</p>
            <p className="text-3xl font-black text-white">Bs. {saldo.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <Wallet className="text-emerald-400" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:border-0 print:shadow-none">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50 print:hidden">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar movimientos..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-colors">
              <Download size={18} />
              Excel
            </button>
            <button onClick={handlePrintPDF} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors">
              <FileText size={18} />
              PDF
            </button>
          </div>
        </div>

        {/* VISTA DE PANTALLA (NO IMPRESIÓN) */}
        <div className="overflow-x-auto print:hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Concepto</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                {role === 'ADMIN' && <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider print:hidden">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-slate-600">{m.fecha}</td>
                  <td className="py-3 px-4 text-sm font-bold text-slate-800">{m.concepto}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                      m.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {m.tipo === 'INGRESO' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-black ${m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {m.tipo === 'INGRESO' ? '+' : '-'} Bs. {m.monto.toLocaleString()}
                  </td>
                  {role === 'ADMIN' && (
                    <td className="py-3 px-4 text-right print:hidden">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(m)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                    No se encontraron movimientos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* VISTA DE IMPRESIÓN (PDF ESTILO PROFIT & LOSS) */}
        <div className="hidden print:block mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#1e3b20] text-white">
                <th className="text-left py-2 px-4 font-bold border border-[#1e3b20]">Estado de Resultados (Caja)</th>
                <th className="text-right py-2 px-4 font-bold border border-[#1e3b20]">Importe (BOB)</th>
              </tr>
            </thead>
            <tbody>
              {/* INGRESOS */}
              <tr>
                <td colSpan={2} className="py-2 px-4 font-black text-slate-800 bg-slate-100 border border-slate-300">INGRESOS</td>
              </tr>
              {filtered.filter(m => m.tipo === 'INGRESO').map((m) => (
                <tr key={m.id} className="border-b border-l border-r border-slate-200">
                  <td className="py-1.5 px-4 text-slate-700">{m.concepto} <span className="text-xs text-slate-400 ml-2">{m.fecha}</span></td>
                  <td className="py-1.5 px-4 text-right text-slate-700">{m.monto.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="border-b-2 border-l border-r border-[#1e3b20]">
                <td className="py-2 px-4 font-bold text-slate-900">Total Ingresos</td>
                <td className="py-2 px-4 text-right font-black text-slate-900">{ingresos.toLocaleString()}</td>
              </tr>

              {/* EGRESOS */}
              <tr>
                <td colSpan={2} className="py-2 px-4 font-black text-slate-800 bg-slate-100 border border-slate-300 mt-4">EGRESOS</td>
              </tr>
              {filtered.filter(m => m.tipo === 'EGRESO').map((m) => (
                <tr key={m.id} className="border-b border-l border-r border-slate-200">
                  <td className="py-1.5 px-4 text-slate-700">{m.concepto} <span className="text-xs text-slate-400 ml-2">{m.fecha}</span></td>
                  <td className="py-1.5 px-4 text-right text-slate-700">{m.monto.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="border-b-2 border-l border-r border-[#1e3b20]">
                <td className="py-2 px-4 font-bold text-slate-900">Total Egresos</td>
                <td className="py-2 px-4 text-right font-black text-slate-900">{egresos.toLocaleString()}</td>
              </tr>

              {/* SALDO NETO */}
              <tr className="bg-[#f4fcf5] border border-[#1e3b20]">
                <td className="py-3 px-4 font-black text-[#1e3b20] uppercase">Saldo Neto (Beneficio)</td>
                <td className="py-3 px-4 text-right font-black text-[#1e3b20] text-lg">{saldo.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER DE FIRMAS SÓLO EN IMPRESIÓN (PDF) */}
        <div className="hidden print:flex justify-around items-end mt-24 mb-4 pt-16">
          <div className="text-center">
            <div className="w-64 border-b border-slate-800 mb-2"></div>
            <p className="font-black text-slate-900 uppercase">YAMIL YAÑEZ</p>
            <p className="text-xs font-bold text-slate-600">Secretario Ejecutivo</p>
          </div>
          <div className="text-center">
            <div className="w-64 border-b border-slate-800 mb-2"></div>
            <p className="font-black text-slate-900 uppercase">RUBEN LEON</p>
            <p className="text-xs font-bold text-slate-600">Secretario de Hacienda / Finanzas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
