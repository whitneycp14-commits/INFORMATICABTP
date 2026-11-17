import React from 'react';
import { School, Lock, User, KeyRound, ShieldCheck, LogOut, Eye, EyeOff } from 'lucide-react';
import { UserSession } from '../types';

interface LoginPageProps {
  currentUser: UserSession;
  onLogin: (username: string, role: 'admin' | 'editor') => void;
  onLogout: () => void;
}

export default function LoginPage({ currentUser, onLogin, onLogout }: LoginPageProps) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const user = username.trim().toLowerCase();
    const accounts: Record<string, { password: string; role: 'admin' | 'editor' }> = {
      admin: { password: 'admin123', role: 'admin' },
      editor: { password: 'editor123', role: 'editor' }
    };
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const account = accounts[user];
      if (!account || account.password !== password) {
        setError('Usuario o contraseña incorrectos.');
        return;
      }
      onLogin(user, account.role);
    }, 350);
  };

  return <div className="flex-1 min-h-[70vh] flex items-center justify-center p-5 sm:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
    <div className="absolute -top-24 -right-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl" />
    <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl" />
    <div className="relative w-full max-w-md">
      <div className="text-center mb-7">
        <div className="inline-flex p-4 rounded-2xl bg-[#09294d] text-white shadow-xl mb-4"><School size={38}/></div>
        <p className="text-xs font-bold tracking-[.22em] uppercase text-rose-800">Portal académico</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">CEMG Álvaro Contreras</h1>
        <p className="text-sm text-slate-500 mt-2">Bachillerato Técnico Profesional en Informática</p>
      </div>
      {currentUser.role !== 'guest' ? <div className="bg-white/95 border border-slate-200 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center mx-auto"><ShieldCheck size={32}/></div>
        <h2 className="text-xl font-bold text-slate-900 mt-4">Sesión iniciada</h2>
        <p className="text-sm text-slate-600 mt-2">{currentUser.username} · {currentUser.role === 'admin' ? 'Administrador' : 'Editor'}</p>
        <p className="text-xs text-slate-500 mt-3">Tu cuenta tiene permisos para administrar el contenido del portal.</p>
        <button onClick={onLogout} className="mt-7 w-full rounded-xl bg-slate-900 text-white py-3 font-semibold hover:bg-slate-700 flex justify-center items-center gap-2"><LogOut size={16}/> Cerrar sesión</button>
      </div> : <form onSubmit={submit} className="bg-white/95 backdrop-blur border border-white rounded-3xl p-7 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100"><div className="p-2.5 rounded-xl bg-blue-50 text-blue-900"><Lock size={20}/></div><div><h2 className="font-bold text-slate-900">Acceso de personal</h2><p className="text-xs text-slate-500">Solo administrador y editor</p></div></div>
        <label className="block"><span className="text-xs font-semibold text-slate-600">Usuario</span><span className="relative block mt-1.5"><User className="absolute left-3 top-3 text-slate-400" size={17}/><input required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900" placeholder="Ingrese su usuario"/></span></label>
        <label className="block"><span className="text-xs font-semibold text-slate-600">Contraseña</span><span className="relative block mt-1.5"><KeyRound className="absolute left-3 top-3 text-slate-400" size={17}/><input required autoComplete="current-password" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900" placeholder="Ingrese su contraseña"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>
        {error && <p role="alert" className="rounded-xl bg-rose-50 text-rose-700 text-sm p-3">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-[#09294d] text-white py-3.5 font-bold shadow-lg hover:bg-blue-950 disabled:opacity-60">{busy?'Verificando…':'Iniciar sesión'}</button>
        <p className="text-center text-xs leading-relaxed text-slate-400">El portal público puede consultarse libremente. No necesitas iniciar sesión para navegar.</p>
      </form>}
    </div>
  </div>;
}
