import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_TEACHERS, 
  INITIAL_GALLERY, 
  INITIAL_SUBJECTS, 
  INITIAL_SUCCESS_STORIES, 
  INITIAL_HONOR_ROLL, 
  INITIAL_STATS, 
  INITIAL_COMPANIES, 
  INITIAL_NOTIFICATIONS,
  INSTITUTIONAL_INFO
} from './data';
import { 
  Teacher, 
  GalleryItem, 
  Subject, 
  SuccessStory, 
  HonorStudent, 
  PartnerCompany, 
  AppNotification, 
  PortalStats, 
  UserSession 
} from './types';
import Sidebar from './components/Sidebar';
import { QuickEditText } from './components/AdminEditOverlay';
import LandingPage from './components/LandingPage';
import GalleryPage from './components/GalleryPage';
import SubjectsPage from './components/SubjectsPage';
import AlumniPage from './components/AlumniPage';
import ThanksPage from './components/ThanksPage';
import LoginPage from './components/LoginPage';
import { 
  Download, 
  Upload, 
  Info, 
  Heart, 
  ShieldAlert,
  Save,
  Undo,
  Home
} from 'lucide-react';

export default function App() {
  // State management populated with localStorage persistence
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    return localStorage.getItem('portal_active_tab') || 'inicio';
  });

  const [teachers, setTeachers] = React.useState<Teacher[]>(() => {
    const saved = localStorage.getItem('portal_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  const [gallery, setGallery] = React.useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('portal_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  const [subjects, setSubjects] = React.useState<Subject[]>(() => {
    const saved = localStorage.getItem('portal_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [stories, setStories] = React.useState<SuccessStory[]>(() => {
    const saved = localStorage.getItem('portal_stories');
    return saved ? JSON.parse(saved) : INITIAL_SUCCESS_STORIES;
  });

  const [honorRoll, setHonorRoll] = React.useState<HonorStudent[]>(() => {
    const saved = localStorage.getItem('portal_honor_roll');
    return saved ? JSON.parse(saved) : INITIAL_HONOR_ROLL;
  });

  const [companies, setCompanies] = React.useState<PartnerCompany[]>(() => {
    const saved = localStorage.getItem('portal_companies');
    return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
  });

  const [stats, setStats] = React.useState<PortalStats>(() => {
    const saved = localStorage.getItem('portal_stats');
    return saved ? JSON.parse(saved) : INITIAL_STATS;
  });

  const [notifications, setNotifications] = React.useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('portal_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [currentUser, setCurrentUser] = React.useState<UserSession>(() => {
    const saved = localStorage.getItem('portal_current_user');
    return saved ? JSON.parse(saved) : { username: 'Invitado', email: '', role: 'guest' };
  });

  const [isAdminEditing, setIsAdminEditing] = React.useState<boolean>(() => {
    return localStorage.getItem('portal_admin_editing') === 'true';
  });

  // Editable Footer states
  const [footerHistory, setFooterHistory] = React.useState<string>(() => {
    return localStorage.getItem('footer_history') || INSTITUTIONAL_INFO.history;
  });
  const [footerAddress, setFooterAddress] = React.useState<string>(() => {
    return localStorage.getItem('footer_address') || INSTITUTIONAL_INFO.address;
  });
  const [footerPhone, setFooterPhone] = React.useState<string>(() => {
    return localStorage.getItem('footer_phone') || INSTITUTIONAL_INFO.phone;
  });
  const [footerEmail, setFooterEmail] = React.useState<string>(() => {
    return localStorage.getItem('footer_email') || INSTITUTIONAL_INFO.email;
  });

  const saveFooterText = (key: string, setter: (val: string) => void, val: string) => {
    localStorage.setItem(key, val);
    setter(val);
  };
  // Cargar automáticamente backup.json al iniciar
React.useEffect(() => {
  const loadBackup = async () => {
    try {
      const response = await fetch('/backups/backup.json');

      if (!response.ok) {
        console.log('No existe backup automático');
        return;
      }

      const backup = await response.json();

      if (backup.teachers) {
        setTeachers(backup.teachers);
      }

      if (backup.gallery) {
        setGallery(backup.gallery);
      }

      if (backup.subjects) {
        setSubjects(backup.subjects);
      }

      if (backup.stories) {
        setStories(backup.stories);
      }

      if (backup.honorRoll) {
        setHonorRoll(backup.honorRoll);
      }

      if (backup.stats) {
        setStats(backup.stats);
      }

      if (backup.notifications) {
        setNotifications(backup.notifications);
      }

      if (backup.localStorageData) {
        Object.entries(backup.localStorageData).forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });
      }

      console.log('Backup cargado correctamente');

    } catch (error) {
      console.error('Error cargando backup:', error);
    }
  };

  loadBackup();
}, []);

  // Save changes to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem('portal_active_tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    localStorage.setItem('portal_teachers', JSON.stringify(teachers));
  }, [teachers]);

  React.useEffect(() => {
    localStorage.setItem('portal_gallery', JSON.stringify(gallery));
  }, [gallery]);

  React.useEffect(() => {
    localStorage.setItem('portal_subjects', JSON.stringify(subjects));
  }, [subjects]);

  React.useEffect(() => {
    localStorage.setItem('portal_stories', JSON.stringify(stories));
  }, [stories]);

  React.useEffect(() => {
    localStorage.setItem('portal_honor_roll', JSON.stringify(honorRoll));
  }, [honorRoll]);

  React.useEffect(() => {
    localStorage.setItem('portal_companies', JSON.stringify(companies));
  }, [companies]);

  React.useEffect(() => {
    localStorage.setItem('portal_stats', JSON.stringify(stats));
  }, [stats]);

  React.useEffect(() => {
    localStorage.setItem('portal_notifications', JSON.stringify(notifications));
  }, [notifications]);

  React.useEffect(() => {
    localStorage.setItem('portal_current_user', JSON.stringify(currentUser));
    // Disable editing if user is logged out or not admin
    if (currentUser.role !== 'admin') {
      setIsAdminEditing(false);
      localStorage.setItem('portal_admin_editing', 'false');
    }
  }, [currentUser]);

  React.useEffect(() => {
    localStorage.setItem('portal_admin_editing', String(isAdminEditing));
  }, [isAdminEditing]);

  const handleLogin = (username: string, role: 'admin' | 'student') => {
    setCurrentUser({
      username,
      email: role === 'admin' ? 'admin@cemgalvarocontreras.edu.hn' : `${username.toLowerCase().replace(/\s+/g, '')}@cemgalvarocontreras.edu.hn`,
      role
    });
    // Redirect to home upon successful validation
    setActiveTab('inicio');
  };

  const handleLogout = () => {
    if (confirm('¿Está seguro de que desea cerrar sesión en el portal?')) {
      setCurrentUser({ username: 'Invitado', email: '', role: 'guest' });
      setIsAdminEditing(false);
      setActiveTab('inicio');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('¿Está seguro de que desea restablecer todos los textos e imágenes del portal a su estado original? Sus cambios inline se perderán.')) {
      localStorage.clear();
      setTeachers(INITIAL_TEACHERS);
      setGallery(INITIAL_GALLERY);
      setSubjects(INITIAL_SUBJECTS);
      setStories(INITIAL_SUCCESS_STORIES);
      setHonorRoll(INITIAL_HONOR_ROLL);
      setCompanies(INITIAL_COMPANIES);
      setStats(INITIAL_STATS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setCurrentUser({ username: 'Invitado', email: '', role: 'guest' });
      setIsAdminEditing(false);
      setFooterHistory(INSTITUTIONAL_INFO.history);
      setFooterAddress(INSTITUTIONAL_INFO.address);
      setFooterPhone(INSTITUTIONAL_INFO.phone);
      setFooterEmail(INSTITUTIONAL_INFO.email);
      setActiveTab('inicio');
      alert('Se han restaurado los valores del sistema.');
    }
  };

  // Export full JSON snapshot of portal data including all local customizations
  const handleExportData = () => {
    const localStorageData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('portal_') || 
        key.startsWith('hero_') || 
        key.startsWith('vision_') || 
        key.startsWith('career_') || 
        key.startsWith('profile_') || 
        key.startsWith('field_') || 
        key.startsWith('software_') || 
        key.startsWith('networks_') || 
        key.startsWith('tech_') || 
        key.startsWith('innov_') || 
        key.startsWith('lider_') || 
        key.startsWith('footer_')
      )) {
        localStorageData[key] = localStorage.getItem(key) || '';
      }
    }

    const dataSnapshot = {
      teachers,
      gallery,
      subjects,
      stories,
      honorRoll,
      stats,
      notifications,
      localStorageData
    };
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(dataSnapshot, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `CemgAlvaroContreras_PortalData_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Import JSON backup file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.teachers && parsed.gallery && parsed.subjects) {
            setTeachers(parsed.teachers);
            setGallery(parsed.gallery);
            setSubjects(parsed.subjects);
            if (parsed.stories) setStories(parsed.stories);
            if (parsed.honorRoll) setHonorRoll(parsed.honorRoll);
            if (parsed.stats) setStats(parsed.stats);
            if (parsed.notifications) setNotifications(parsed.notifications);
            
            // Restore all custom local storage keys
            if (parsed.localStorageData) {
              Object.entries(parsed.localStorageData).forEach(([key, value]) => {
                localStorage.setItem(key, value as string);
              });
            }
            
            alert('¡Copia de seguridad del Portal restaurada con éxito! La página se recargará para aplicar todos los cambios.');
            window.location.reload();
          } else {
            alert('Estructura de archivo JSON no válida.');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON.');
        }
      };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      
      {/* Sidebar navigation component */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isAdminEditing={isAdminEditing}
        setIsAdminEditing={setIsAdminEditing}
      />

      {/* Main Page Content Stage */}
      <div className="flex-1 flex flex-col">
        
        {/* Render pages dynamically with beautiful fade-in transitions */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 flex flex-col"
            >
              {activeTab === 'inicio' && (
                <LandingPage 
                  teachers={teachers}
                  onUpdateTeachers={setTeachers}
                  isAdminEditing={isAdminEditing}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'galeria' && (
                <GalleryPage 
                  gallery={gallery}
                  onUpdateGallery={setGallery}
                  isAdminEditing={isAdminEditing}
                  currentUserRole={currentUser.role}
                />
              )}

              {activeTab === 'oferta' && (
                <SubjectsPage 
                  subjects={subjects}
                  onUpdateSubjects={setSubjects}
                  isAdminEditing={isAdminEditing}
                  currentUserRole={currentUser.role}
                />
              )}

              {activeTab === 'casos' && (
                <AlumniPage 
                  stories={stories}
                  onUpdateStories={setStories}
                  isAdminEditing={isAdminEditing}
                  currentUserRole={currentUser.role}
                  currentUsername={currentUser.username}
                />
              )}

              {activeTab === 'agradecimientos' && (
                <ThanksPage 
                  stats={stats}
                  onUpdateStats={setStats}
                  honorRoll={honorRoll}
                  onUpdateHonorRoll={setHonorRoll}
                  companies={companies}
                  onUpdateCompanies={setCompanies}
                  notifications={notifications}
                  onUpdateNotifications={setNotifications}
                  isAdminEditing={isAdminEditing}
                  currentUserRole={currentUser.role}
                />
              )}

              {activeTab === 'acceso' && (
                <LoginPage 
                  currentUser={currentUser}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Persistent Footer (Unified Aesthetic) */}
        <footer className="bg-[#0a0f1d] text-white border-t border-white/10 py-14 px-8 mt-auto relative z-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            
            <div className="md:col-span-2 space-y-5">
              <h3 className="font-display font-extrabold text-2xl text-white">CEMG Álvaro Contreras</h3>
              <div className="font-sans text-sm text-white/70 max-w-md leading-relaxed">
                <QuickEditText
                  isAdminEditing={isAdminEditing}
                  value={footerHistory}
                  label="Historia / Reseña en Footer"
                  multiline={true}
                  onSave={(val) => saveFooterText('footer_history', setFooterHistory, val)}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setActiveTab('inicio');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-ochre hover:text-primary transition-all shadow-sm border border-white/10 text-white cursor-pointer"
                  title="Regresar a Inicio"
                >
                  <Home size={18} />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold text-base text-ochre mb-5">Canales de Contacto</h4>
              <ul className="space-y-4 text-xs font-mono text-white/80">
                <li className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-ochre text-sm mt-0.5">location_on</span>
                  <div className="flex-1">
                    <QuickEditText
                      isAdminEditing={isAdminEditing}
                      value={footerAddress}
                      label="Dirección del Centro"
                      multiline={true}
                      onSave={(val) => saveFooterText('footer_address', setFooterAddress, val)}
                    />
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-ochre text-sm">phone</span>
                  <div className="flex-1">
                    <QuickEditText
                      isAdminEditing={isAdminEditing}
                      value={footerPhone}
                      label="Teléfono del Centro"
                      onSave={(val) => saveFooterText('footer_phone', setFooterPhone, val)}
                    />
                  </div>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-ochre text-sm">mail</span>
                  <div className="flex-1">
                    <QuickEditText
                      isAdminEditing={isAdminEditing}
                      value={footerEmail}
                      label="Correo Electrónico"
                      onSave={(val) => saveFooterText('footer_email', setFooterEmail, val)}
                    />
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="font-display font-bold text-base text-ochre mb-3">Administración del Portal</h4>
              <p className="text-[11px] text-white/60 leading-relaxed font-sans">Gestione la información, descargue copias de seguridad o restablezca los datos predeterminados sin tocar el código.</p>
              
              <div className="flex flex-col gap-2">
                {currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={handleExportData}
                      className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-white/10 transition-all cursor-pointer shadow-xs"
                    >
                      <Download size={12} className="text-ochre" />
                      Exportar Backup JSON
                    </button>
                    
                    <label className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-white/10 transition-all cursor-pointer shadow-xs">
                      <Upload size={12} className="text-ochre" />
                      Importar Backup JSON
                      <input 
                        type="file" 
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden" 
                      />
                    </label>

                    <button
                      onClick={handleResetDefaults}
                      className="flex items-center justify-center gap-1.5 bg-red-950/20 hover:bg-red-950/45 text-red-300 font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-red-500/20 transition-all cursor-pointer shadow-xs"
                    >
                      <Undo size={12} />
                      Restablecer Portal
                    </button>
                  </>
                )}
                {currentUser.role !== 'admin' && (
                  <p className="text-[10px] text-white/45 italic leading-tight">Inicie sesión como administrador para acceder a las opciones de copia de seguridad y restauración del portal.</p>
                )}
              </div>
            </div>

          </div>

          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 font-mono">
            <p>© 2026 Portal de Gestión - Bachillerato Técnico Profesional en Informática.</p>
            <p className="mt-2 md:mt-0 flex items-center gap-1">
              Desarrollado con <Heart size={12} className="text-secondary animate-pulse" /> para el CEMG Álvaro Contreras
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
