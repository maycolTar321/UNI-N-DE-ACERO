"use client";
import { useState } from "react";
import { Crown, Medal, Briefcase, Landmark, ShieldAlert, Trophy, Flag, Mic, Edit2, X, Phone, MapPin, UserCircle2 } from "lucide-react";
import { usePersistentState } from "@/lib/usePersistentState";
const INITIAL_CARGOS = [
  { id: 1, titulo: "1er ejecutivo", nombre: "Yamil Yáñez", celular: "+591 ", domicilio: "", ocupado: true, icon: Crown },
  { id: 2, titulo: "2do ejecutivo", nombre: "Miguel Retamozo", celular: "+591 ", domicilio: "", ocupado: true, icon: Medal },
  { id: 3, titulo: "Strio Gral", nombre: "Alberto Barrios", celular: "+591 ", domicilio: "", ocupado: true, icon: Briefcase },
  { id: 4, titulo: "Strio de Hacienda", nombre: "Ruben Leon", celular: "+591 ", domicilio: "", ocupado: true, icon: Landmark },
  { id: 5, titulo: "Strio Conflictos", nombre: "Daniel Copa", celular: "+591 ", domicilio: "", ocupado: true, icon: ShieldAlert },
  { id: 6, titulo: "Strio Deportes", nombre: "Rodrigo Miranda", celular: "+591 ", domicilio: "", ocupado: true, icon: Trophy },
  { id: 7, titulo: "Delegado COD", nombre: "Oscar Quenta", celular: "+591 ", domicilio: "", ocupado: true, icon: Flag },
  { id: 8, titulo: "Delegado COD", nombre: "Juvenal Quispe", celular: "+591 ", domicilio: "", ocupado: true, icon: Flag },
  { id: 9, titulo: "Vocal", nombre: "Maycol Anghelo Avila Zenteno", celular: "+591 ", domicilio: "", ocupado: true, icon: Mic },
];

export default function DirectivaPage() {
  const [cargos, setCargos, isInitialized] = usePersistentState<any[]>("union_acero_directiva", INITIAL_CARGOS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nombre: "", celular: "", domicilio: "" });

  const openEdit = (cargo: any) => {
    setFormData({ nombre: cargo.nombre, celular: cargo.celular, domicilio: cargo.domicilio });
    setEditingId(cargo.id);
  };

  const handleSave = () => {
    setCargos(cargos.map(c => c.id === editingId ? { ...c, ...formData } : c));
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {editingId !== null && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">Editar Datos del Cargo</h3>
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Celular</label>
                <input type="text" value={formData.celular} onChange={e => setFormData({...formData, celular: e.target.value})} placeholder="+591 ..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Domicilio</label>
                <input type="text" value={formData.domicilio} onChange={e => setFormData({...formData, domicilio: e.target.value})} placeholder="Barrio, Calle..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#10B981] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:bg-[#059669] transition-colors">Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Directiva Sindical</h1>
          <p className="text-sm text-slate-500 mt-1">
            Mesa directiva y delegados de Unión de Acero Tarija.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cargos.map((cargo) => {
          const IconComponent = cargo.icon;
          return (
            <div key={cargo.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IconComponent size={16} />
                  </div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{cargo.titulo}</h3>
                </div>
                <button onClick={() => openEdit(cargo)} className="p-1.5 text-slate-400 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition-colors ">
                  <Edit2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-300">
                  <UserCircle2 size={40} strokeWidth={1} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-800 leading-tight">
                    {cargo.nombre || "No asignado"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-medium">{cargo.celular && cargo.celular !== "+591 " ? cargo.celular : "Sin teléfono"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="font-medium truncate">{cargo.domicilio || "Sin domicilio registrado"}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

