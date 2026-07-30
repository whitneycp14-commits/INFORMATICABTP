import React, { useEffect, useState, useCallback } from 'react';
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
import { loadPortal, savePortal } from './services/portalService';

// Simple debounce hook
function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay = 1000) {
  const timer = React.useRef<number | undefined>(undefined);
  return useCallback((...args: Parameters<T>) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      fn(...args);
    }, delay) as unknown as number;
  }, [fn, delay]);
}

export default function App() {
  // State management
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('portal_active_tab') || 'inicio';
  });

  // Portal data (Firestore is the single source of truth)
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [honorRoll, setHonorRoll] = useState<HonorStudent[]>([]);
  const [companies, setCompanies] = useState<PartnerCompany[]>([]);
  const [stats, setStats] = useState<PortalStats>(INITIAL_STATS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Session (explicit only)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isAdminEditing, setIsAdminEditing] = useState<boolean>(false);

  // Footer/local UI states (non-portal editable texts). These could be migrated to Firestore later.
  const [footerHistory, setFooterHistory] = useState<string>(() => INSTITUTIONAL_INFO.history);
  const [footerAddress, setFooterAddress] = useState<string>(() => INSTITUTIONAL_INFO.address);
  const [footerPhone, setFooterPhone] = useState<string>(() => INSTITUTIONAL_INFO.phone);
  const [footerEmail, setFooterEmail] = useState<string>(() => INSTITUTIONAL_INFO.email);

  const saveFooterText = (key: string, setter: (val: string) => void, val: string) => {
    // Currently kept local (not portal data). In a later step migrate to Firestore.
    localStorage.setItem(key, val);
    setter(val);
  };

  // Hydration guard: prevent writing to Firestore until after initial load from Firestore completes
  const hasHydratedFromFirestoreRef = React.useRef(false);

  // Load portal from Firestore on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const portal = await loadPortal();
        if (!mounted) return;
        setTeachers(portal.teachers);
        setGallery(portal.gallery);
        setSubjects(portal.subjects);
        setStories(portal.stories);
        setHonorRoll(portal.honorRoll);
        setCompanies(portal.companies);
        setStats(portal.stats);
        setNotifications(portal.notifications);
      } catch (err) {
        console.error('Error loading portal from Firestore', err);
        // fallback to initial constants
        setTeachers(INITIAL_TEACHERS);
        setGallery(INITIAL_GALLERY);
        setSubjects(INITIAL_SUBJECTS);
        setStories(INITIAL_SUCCESS_STORIES);
        setHonorRoll(INITIAL_HONOR_ROLL);
        setCompanies(INITIAL_COMPANIES);
        setStats(INITIAL_STATS);
        setNotifications(INITIAL_NOTIFICATIONS);
      } finally {
        hasHydratedFromFirestoreRef.current = true;
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Debounced save to Firestore (only after hydration)
  const debouncedSave = useDebouncedCallback(async (portal: any) => {
    try {
      await savePortal(portal);
    } catch (err) {
      console.error('Error saving portal to Firestore', err);
    }
  }, 1000);

  // Save to Firestore when main states change, but only after hydration
  useEffect(() => {
    if (!hasHydratedFromFirestoreRef.current) return;
    const portal = { teachers, gallery, subjects, stories, honorRoll, companies, stats, notifications };
    debouncedSave(portal);
  }, [teachers, gallery, subjects, stories, honorRoll, companies, stats, notifications, debouncedSave]);

  // Persist activeTab only (UI preference), but not portal content/session
  useEffect(() => {
    localStorage.setItem('portal_active_tab', activeTab);
  }, [activeTab]);

  // NOTE: we intentionally DO NOT persist currentUser or isAdminEditing automatically.

  // Helper guest fallback
  const GUEST_USER: UserSession = { username: 'Invitado', email: '', role: 'guest' };

  // Session management (explicit only)
  const handleLogin = (username: string, role: 'admin' | 'student') => {
    // Replace with real auth when available
    const user: UserSession = {
      username,
      email: role === 'admin' ? 'admin@cemgalvarocontreras.edu.hn' : `${username.toLowerCase().replace(/\s+/g, '')}@cemgalvarocontreras.edu.hn`,
      role
    };
    setCurrentUser(user);
    setActiveTab('inicio');
  };

  const handleLogout = () => {
    if (confirm('¿Está seguro de que desea cerrar sesión en el portal?')) {
      setCurrentUser(null);
      setIsAdminEditing(false);
      setActiveTab('inicio');
    }
  };

  // Reset to defaults and persist to Firestore
  const handleResetDefaults = async () => {
    if (!confirm('¿Está seguro de que desea restablecer todos los textos e imágenes del portal a su estado original? Sus cambios inline se perderán.')) return;
    const initial = {
      teachers: INITIAL_TEACHERS,
      gallery: INITIAL_GALLERY,
      subjects: INITIAL_SUBJECTS,
      stories: INITIAL_SUCCESS_STORIES,
      honorRoll: INITIAL_HONOR_ROLL,
      companies: INITIAL_COMPANIES,
      stats: INITIAL_STATS,
      notifications: INITIAL_NOTIFICATIONS
    };
    try {
      await savePortal(initial);
      setTeachers(initial.teachers);
      setGallery(initial.gallery);
      setSubjects(initial.subjects);
      setStories(initial.stories);
      setHonorRoll(initial.honorRoll);
      setCompanies(initial.companies);
      setStats(initial.stats);
      setNotifications(initial.notifications);
      setCurrentUser(null);
      setIsAdminEditing(false);
      setActiveTab('inicio');
      alert('Se han restaurado los valores del sistema.');
    } catch (err) {
      console.error('Error saving defaults to Firestore', err);
      alert('Error al restablecer valores.');
    }
  };

  // Export backup JSON (client-side)
  const handleExportData = () => {
    const dataSnapshot = { teachers, gallery, subjects, stories, honorRoll, stats, notifications };
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(dataSnapshot, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `CemgAlvaroContreras_PortalData_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Import JSON backup and save to Firestore (do not restore session keys)
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.teachers && parsed.gallery && parsed.subjects) {
            const portal = {
              teachers: parsed.teachers,
              gallery: parsed.gallery,
              subjects: parsed.subjects,
              stories: parsed.stories ?? [],
              honorRoll: parsed.honorRoll ?? [],
              companies: parsed.companies ?? [],
              stats: parsed.stats ?? INITIAL_STATS,
              notifications: parsed.notifications ?? []
            };
            try {
              await savePortal(portal);
            } catch (err) {
              console.error('Error saving imported portal to Firestore', err);
            }

            // Update local state
            setTeachers(portal.teachers);
            setGallery(portal.gallery);
            setSubjects(portal.subjects);
            setStories(portal.stories);
            setHonorRoll(portal.honorRoll);
            setCompanies(portal.companies);
            setStats(portal.stats);
            setNotifications(portal.notifications);

            // Do NOT restore session/admin flags from imported localStorageData
            // Restore only non-sensitive UI keys if absolutely needed (e.g., footer text)
            if (parsed.localStorageData) {
              Object.entries(parsed.localStorageData).forEach(([key, value]) => {
                if (key.startsWith('footer_') || key.startsWith('career_') || key.startsWith('profile_') || key.startsWith('field_') || key.startsWith('vision_')) {
                  localStorage.setItem(key, value as string);
                }
              });
            }

            alert('¡Copia de seguridad del Portal restaurada con éxito!');
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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser ?? GUEST_USER}
        onLogout={handleLogout}
        isAdminEditing={isAdminEditing}
        setIsAdminEditing={setIsAdminEditing}
      />

      <div className="flex-1 flex flex-col">
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
                  currentUserRole={(currentUser ?? GUEST_USER).role}
                />
              )}

              {activeTab === 'oferta' && (
                <SubjectsPage
                  subjects={subjects}
                  onUpdateSubjects={setSubjects}
                  isAdminEditing={isAdminEditing}
                  currentUserRole={(currentUser ?? GUEST_USER).role}
                />
              )}

              {activeTab === 'casos' && (
                <AlumniPage
                  stories={stories}
                  onUpdateStories={setStories}
                  isAdminEditing={isAdminEditing}
                  currentUserRole={(currentUser ?? GUEST_USER).role}
                  currentUsername={currentUser?.username ?? ''}
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
                  currentUserRole={(currentUser ?? GUEST_USER).role}
                />
              )}

              {activeTab === 'acceso' && (
                <LoginPage
                  currentUser={currentUser ?? GUEST_USER}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

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
                  onClick={() => { setActiveTab('inicio'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-ochre hover:text-primary transition-all shadow-sm border border-white/10 text-white"
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
                {(currentUser?.role ?? 'guest') === 'admin' && (
                  <>
                    <button
                      onClick={handleExportData}
                      className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-white/10"
                    >
                      <Download size={12} className="text-ochre" />
                      Exportar Backup JSON
                    </button>

                    <label className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-white/10">
                      <Upload size={12} className="text-ochre" />
                      Importar Backup JSON
                      <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                    </label>

                    <button
                      onClick={handleResetDefaults}
                      className="flex items-center justify-center gap-1.5 bg-red-950/20 hover:bg-red-950/45 text-red-300 font-mono text-[10px] font-bold py-2 px-3 rounded-lg border border-red-500"
                    >
                      <Undo size={12} />
                      Restablecer Portal
                    </button>
                  </>
                )}
                {(currentUser?.role ?? 'guest') !== 'admin' && (
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
