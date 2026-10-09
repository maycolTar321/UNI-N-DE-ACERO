"use client";

import { useState, useEffect } from "react";
import { Settings, Save, ShieldAlert, Database, Globe, CheckCircle2, Trash2, UserPlus, Loader2, Shield, User } from "lucide-react";
import { api, UsuarioSistema } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function ConfiguracionPage() {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const [activeTab, setActiveTab] = useState("institucional");
  const [saved, setSaved] = useState(false);

  // ===== Usuarios del sistema =====
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPin, setNuevoPin] = useState("");
  const [nuevoRol, setNuevoRol] = useState<"ADMIN" | "USER">("USER");
  const [guardandoUsuario, setGuardandoUsuario] = useState(false);
  const [mensajeUsuario, setMensajeUsuario] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  const cargarUsuarios = async () => {
    setCargandoUsuarios(true);
    const res = await api.listarUsuarios();
    if (res.exito && Array.isArray(res.datos)) {
      setUsuarios(res.datos);
    } else {
      setMensajeUsuario({ tipo: "error", texto: "No se pudo cargar la lista. Verifica que actualizaste el Apps Script." });
    }
    setCargandoUsuarios(false);
  };

  useEffect(() => {
    if (activeTab === "roles" && isAdmin) {
      cargarUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin]);

  const handleCrearUsuario = async () => {
    setMensajeUsuario(null);
    if (!nuevoNombre.trim()) return setMensajeUsuario({ tipo: "error", texto: "Escribe el nombre de la persona." });
    if (!/^\d{4}$/.test(nuevoPin)) return setMensajeUsuario({ tipo: "error", texto: "El PIN debe tener exactamente 4 números." });
    if (nuevoPin === "5230" || nuevoPin === "0000") return setMensajeUsuario({ tipo: "error", texto: "Ese PIN está reservado. Elige otro." });

    setGuardandoUsuario(true);
    const res = await api.crearUsuario(nuevoNombre.trim(), nuevoPin, nuevoRol);
    setGuardandoUsuario(false);
    if (res.exito) {
      setMensajeUsuario({ tipo: "ok", texto: `Acceso creado para ${nuevoNombre.trim()}.` });
      setNuevoNombre("");
      setNuevoPin("");
      setNuevoRol("USER");
      setShowForm(false);
      cargarUsuarios();
    } else {
      setMensajeUsuario({ tipo: "error", texto: res.mensaje || "No se pudo crear el acceso." });
    }
  };

  const handleEliminarUsuario = async (u: UsuarioSistema) => {
    if (!confirm(`¿Quitar el acceso de ${u.nombre}? Ya no podrá ingresar al sistema.`)) return;
    const res = await api.eliminarUsuario(u.id);
    if (res.exito) {
      setUsuarios(prev => prev.filter(x => x.id !== u.id));
      setMensajeUsuario({ tipo: "ok", texto: `Acceso de ${u.nombre} eliminado.` });
    } else {
      setMensajeUsuario({ tipo: "error", texto: res.mensaje || "No se pudo eliminar." });
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 relative">
      
      {saved && (
        <div className="fixed top-24 right-8 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-10 z-50">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">Configuración guardada exitosamente</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Configuración</h1>
          <p className="text-sm text-slate-500 mt-1">
            Preferencias globales e información institucional del sistema.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Save size={18} />
          Guardar cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("institucional")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-left transition-colors ${activeTab === 'institucional' ? 'bg-white border border-[#10B981] text-[#10B981] shadow-sm' : 'bg-transparent hover:bg-slate-100 text-slate-600'}`}
          >
            <Globe size={18} /> Información institucional
          </button>
          <button 
            onClick={() => setActiveTab("roles")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-left transition-colors ${activeTab === 'roles' ? 'bg-white border border-[#10B981] text-[#10B981] shadow-sm' : 'bg-transparent hover:bg-slate-100 text-slate-600'}`}
          >
            <ShieldAlert size={18} /> Roles y permisos
          </button>
          <button 
            onClick={() => setActiveTab("conexion")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-left transition-colors ${activeTab === 'conexion' ? 'bg-white border border-[#10B981] text-[#10B981] shadow-sm' : 'bg-transparent hover:bg-slate-100 text-slate-600'}`}
          >
            <Database size={18} /> Conexión y estado
          </button>
        </div>

        {/* Content Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === "institucional" && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
              <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Globe className="text-slate-400" size={18} /> Detalles de la Institución
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Institucional</label>
                  <input type="text" defaultValue="Unión de Acero" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Slogan o Descripción</label>
                  <input type="text" defaultValue="Plataforma Sindical" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">País</label>
                    <input type="text" defaultValue="Bolivia"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Moneda base</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]">
                      <option>BOB - Boliviano</option>
                      <option>USD - Dólar</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
              <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <ShieldAlert className="text-slate-400" size={18} /> Roles de Usuario
              </h2>

              {!isAdmin ? (
                <p className="text-sm text-slate-500">Solo el Administrador puede gestionar los accesos al sistema.</p>
              ) : (
                <div className="space-y-5">

                  {/* Explicación de los tipos de acceso */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                      <div className="flex items-center gap-2 font-black text-emerald-800 text-sm mb-1"><Shield size={16} /> Administrador</div>
                      <p className="text-xs text-emerald-700">Acceso total: ver, registrar, editar y eliminar en todo el sistema.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-2 font-black text-blue-800 text-sm mb-1"><User size={16} /> Operador</div>
                      <p className="text-xs text-blue-700">Puede ver y registrar. No puede editar ni eliminar.</p>
                    </div>
                  </div>

                  {mensajeUsuario && (
                    <div className={`px-4 py-3 rounded-xl text-sm font-bold ${mensajeUsuario.tipo === "ok" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                      {mensajeUsuario.texto}
                    </div>
                  )}

                  {/* Lista de accesos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800">Administrador principal</p>
                        <p className="text-xs text-slate-500">PIN maestro · no se puede eliminar</p>
                      </div>
                      <span className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-100 text-emerald-700">ADMINISTRADOR</span>
                    </div>

                    {cargandoUsuarios ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 p-3"><Loader2 size={16} className="animate-spin" /> Cargando accesos...</div>
                    ) : usuarios.length === 0 ? (
                      <p className="text-sm text-slate-500 p-3">Aún no has dado acceso a otras personas.</p>
                    ) : (
                      usuarios.map(u => (
                        <div key={u.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-800 truncate">{u.nombre}</p>
                            <p className="text-xs text-slate-500">PIN: ••••</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${u.rol === "ADMIN" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                              {u.rol === "ADMIN" ? "ADMINISTRADOR" : "OPERADOR"}
                            </span>
                            <button
                              onClick={() => handleEliminarUsuario(u)}
                              className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                              title="Quitar acceso"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Formulario nuevo acceso */}
                  {showForm ? (
                    <div className="p-4 md:p-5 rounded-xl border-2 border-dashed border-slate-200 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Nombre de la persona</label>
                        <input
                          type="text"
                          value={nuevoNombre}
                          onChange={e => setNuevoNombre(e.target.value)}
                          placeholder="Ej. Juan Pérez"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">PIN de ingreso (4 números)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={nuevoPin}
                            onChange={e => setNuevoPin(e.target.value.replace(/\D/g, ""))}
                            placeholder="Ej. 4821"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2">Tipo de acceso</label>
                          <select
                            value={nuevoRol}
                            onChange={e => setNuevoRol(e.target.value as "ADMIN" | "USER")}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]"
                          >
                            <option value="USER">Operador (ver y registrar)</option>
                            <option value="ADMIN">Administrador (acceso total)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                        <button
                          onClick={() => { setShowForm(false); setMensajeUsuario(null); }}
                          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 text-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleCrearUsuario}
                          disabled={guardandoUsuario}
                          className="flex-1 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {guardandoUsuario ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : "Dar acceso"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowForm(true); setMensajeUsuario(null); }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      <UserPlus size={16} /> Dar acceso a una persona
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "conexion" && (
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
              <h2 className="text-sm font-black text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <Database className="text-slate-400" size={18} /> API y Conexión (Google Apps Script)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">URL Base (Webhook)</label>
                  <input type="text" defaultValue="https://script.google.com/macros/s/AKfycbyGDnWz_znUwnCmpUtDDczRIIgjdSGonDnBFOpaZ2iqtSrPHAnbUR96Vc9Izkfs0wM-Xg/exec" disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-mono text-xs" />
                  <p className="text-xs text-slate-500 mt-2">Esta URL está configurada desde el backend y gestiona las funciones del sistema sindical.</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

