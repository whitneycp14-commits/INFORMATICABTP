import React from 'react';
import { 
  Home, 
  Image as ImageIcon, 
  BookOpen, 
  Star, 
  Heart, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  Key
} from 'lucide-react';
import { UserSession } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession;
  onLogout: () => void;
  isAdminEditing: boolean;
  setIsAdminEditing: (editing: boolean) => void;
}

// Custom BTP Informática White SVG Logo (No background, matches physical topology)
const Logo = ({ size = 40 }: { size?: number }) => (
  <div 
    className="text-white shrink-0 hover:scale-105 transition-transform duration-300 font-mono font-black select-none flex items-center justify-center bg-secondary border border-white/10 rounded-lg shadow-md"
    style={{ width: size, height: size, fontSize: size * 0.45 }}
  >
    {'{/}'}
  </div>
);

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isAdminEditing,
  setIsAdminEditing
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'galeria', label: 'Galería', icon: ImageIcon },
    { id: 'oferta', label: 'Asignaturas', icon: BookOpen },
    { id: 'casos', label: 'Casos de Éxito', icon: Star },
    { id: 'agradecimientos', label: 'Agradecimientos', icon: Heart },
  ];

  return (
    <>
      {/* Mobile top bar (Elegant Dark Theme) */}
      <div className="md:hidden sticky top-0 z-50 bg-[#0a0f1d] border-b border-white/10 text-white h-16 px-4 flex items-center justify-between shadow-md">
        <div 
          onClick={() => {
            setActiveTab('inicio');
            setIsOpen(false);
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Logo />
          <span className="font-display font-black text-sm tracking-wider text-white uppercase">BTP INFORMÁTICA</span>
        </div>
        
        <div className="flex items-center gap-3">
          {currentUser.role !== 'guest' && (
            <button
              onClick={() => setIsAdminEditing(!isAdminEditing)}
              className={`p-1.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
                isAdminEditing ? 'bg-secondary text-white animate-pulse' : 'bg-white/10 text-ochre'
              }`}
            >
              <ShieldAlert size={12} />
              {isAdminEditing ? 'Editor' : 'Admin'}
            </button>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:text-ochre text-white/80 rounded hover:bg-white/5">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Slide-out mobile menu drawer (Matching Dark Theme) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setIsOpen(false)}>
          <div 
            className="w-[280px] h-full bg-[#0a0f1d] flex flex-col p-6 shadow-2xl relative border-r border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 pb-4 border-b border-white/10 flex items-center gap-2.5">
              <Logo />
              <div>
                <h2 className="font-display font-black text-base text-white uppercase tracking-wider">BTP INFORMÁTICA</h2>
                <p className="font-mono text-[9px] text-ochre font-bold tracking-wider uppercase">Álvaro Contreras</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-secondary text-white shadow-md' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-white/60'} />
                    {item.label}
                  </button>
                );
              })}

              {currentUser.role !== 'guest' && (
                <button
                  onClick={() => {
                    setActiveTab('acceso');
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'acceso'
                      ? 'bg-secondary text-white shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LogIn size={16} className={activeTab === 'acceso' ? 'text-white' : 'text-white/60'} />
                  Mi Portal Académico
                </button>
              )}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
              {currentUser.role !== 'guest' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-white font-black text-sm uppercase">
                      {currentUser.username[0]}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-white truncate leading-tight">{currentUser.username}</p>
                      <p className="text-[9px] text-white/50 capitalize mt-0.5">{currentUser.role === 'admin' ? 'Administrador' : 'Editor'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-xs py-2.5 border border-white/20 text-white hover:bg-white/10 rounded-lg font-bold transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-secondary rounded-lg border border-white/10">
                    <p className="text-[10px] font-mono font-bold text-white mb-0.5 uppercase tracking-wider">Admisiones Abiertas</p>
                    <p className="text-[9px] text-white/90 leading-normal">Pre-matrícula abierta para el ingreso actual.</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[9px] text-white/40 font-mono">© 2026 Álvaro Contreras</span>
                    <button
                      onClick={() => {
                        setActiveTab('acceso');
                        setIsOpen(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                      title="Acceder"
                    >
                      <Key size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Top Navbar (Premium Dark Theme) */}
      <header className="sticky top-0 z-40 w-full bg-[#0a0f1d] border-b border-white/10 hidden md:flex items-center justify-between px-8 h-20 shadow-md text-white">
        <div 
          onClick={() => setActiveTab('inicio')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Logo />
          <div>
            <h1 className="font-display font-black text-lg text-white leading-none tracking-wider uppercase">BTP INFORMÁTICA</h1>
          </div>
        </div>

        {/* Center navigation links */}
        <nav className="flex items-center gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-secondary text-white shadow-md' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {currentUser.role !== 'guest' && (
            <button
              onClick={() => setActiveTab('acceso')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'acceso'
                  ? 'bg-secondary text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LogIn size={14} />
              <span>Mi Portal</span>
            </button>
          )}
        </nav>

        {/* Right side controls / user info */}
        <div className="flex items-center gap-4">
          {currentUser.role !== 'guest' && (
            <div className="flex items-center gap-2.5 bg-secondary border border-white/20 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] font-bold text-white flex items-center gap-1">
                <ShieldAlert size={12} />
                Modo Editor
              </span>
              <button
                onClick={() => setIsAdminEditing(!isAdminEditing)}
                className={`text-[10px] font-bold py-1 px-2.5 rounded transition-all cursor-pointer ${
                  isAdminEditing 
                    ? 'bg-white text-secondary shadow-sm font-black' 
                    : 'bg-white/15 text-white hover:bg-white/30'
                }`}
              >
                {isAdminEditing ? 'Apagar Editor' : 'Editar Portal'}
              </button>
            </div>
          )}

          {currentUser.role !== 'guest' ? (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-black text-xs uppercase border border-white/10">
                  {currentUser.username[0]}
                </div>
                <div className="max-w-[120px] truncate leading-none">
                  <p className="font-bold text-xs text-white truncate">{currentUser.username}</p>
                  <p className="text-[9px] text-white/50 font-mono uppercase mt-0.5">{currentUser.role === 'admin' ? 'Administrador' : 'Editor'}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-white/70 hover:text-secondary hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden lg:block bg-secondary border border-white/10 px-3 py-1 rounded-lg">
                <span className="text-[9px] font-mono font-bold text-white uppercase">Admisiones Abiertas</span>
              </div>
              <button
                onClick={() => setActiveTab('acceso')}
                title="Acceder al Portal"
                className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer border border-white/10"
              >
                <Key size={15} />
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
