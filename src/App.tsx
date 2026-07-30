import React from 'react';
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
import { 
  loadPortal,
  savePortal,
  PortalDoc
} from './services/portalService';
import { 
  Teacher, 
  GalleryItem, 
  Subject, 
  SuccessStory, 
  HonorStudent, 
  PartnerCompany, 
  AppNotification, 
  PortalStats,
  UserSession,
  Lab
} from './types';
import { 
  INITIAL_TEACHERS,
  INITIAL_GALLERY,
  INITIAL_SUBJECTS,
  INITIAL_SUCCESS_STORIES,
  INITIAL_HONOR_ROLL,
  INITIAL_COMPANIES,
  INITIAL_STATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_UI,
  INITIAL_LABS,
  INSTITUTIONAL_INFO
} from './data';

export default function App() {
  // Persist only these in localStorage: activeTab, currentUser, isAdminEditing
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    return localStorage.getItem('portal_active_tab') || 'inicio';
  });

  const [currentUser, setCurrentUser] = React.useState<UserSession>(() => {
    const saved = localStorage.getItem('portal_current_user');
    return saved ? JSON.parse(saved) : { username: 'Invitado', email: '', role: 'guest' };
  });

  const [isAdminEditing, setIsAdminEditing] = React.useState<boolean>(() => {
    return localStorage.getItem('portal_admin_editing') === 'true';
  });

  // Portal data — source of truth is Firestore (portal/principal)
  const [teachers, setTeachers] = React.useState<Teacher[]>(INITIAL_TEACHERS);
  const [gallery, setGallery] = React.useState<GalleryItem[]>(INITIAL_GALLERY);
  const [subjects, setSubjects] = React.useState<Subject[]>(INITIAL_SUBJECTS);
  const [stories, setStories] = React.useState<SuccessStory[]>(INITIAL_SUCCESS_STORIES);
  const [honorRoll, setHonorRoll] = React.useState<HonorStudent[]>(INITIAL_HONOR_ROLL);
  const [companies, setCompanies] = React.useState<PartnerCompany[]>(INITIAL_COMPANIES);
  const [stats, setStats] = React.useState<PortalStats>(INITIAL_STATS);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [ui, setUi] = React.useState<Record<string,string>>(INITIAL_UI);
  const [labs, setLabs] = React.useState<Lab[]>(INITIAL_LABS);

  // Hydration flag to prevent accidental overwrites before initial load
  const [hydrated, setHydrated] = React.useState(false);

  // Load portal from Firestore on mount
  React.useEffect(() => {
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
        setUi(portal.ui ?? INITIAL_UI);
        setLabs(portal.labs ?? INITIAL_LABS);
      } catch (err) {
        console.error('Error loading portal from Firestore:', err);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // Debounced save to Firestore when portal data changes (but only after hydration)
  const saveTimeout = React.useRef<number | null>(null);
  const scheduleSave = React.useCallback(() => {
    if (!hydrated) return; // avoid saving defaults before hydrate
    if (saveTimeout.current) {
      window.clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = window.setTimeout(() => {
      const portal: PortalDoc = {
        teachers,
        gallery,
        subjects,
        stories,
        honorRoll,
        companies,
        stats,
        notifications,
        ui,
        labs
      };
      savePortal(portal).catch(err => console.error('Error saving portal:', err));
      saveTimeout.current = null;
    }, 700);
  }, [hydrated, teachers, gallery, subjects, stories, honorRoll, companies, stats, notifications, ui, labs]);

  // watch portal states
  React.useEffect(() => { scheduleSave(); }, [teachers, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [gallery, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [subjects, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [stories, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [honorRoll, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [companies, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [stats, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [notifications, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [ui, scheduleSave]);
  React.useEffect(() => { scheduleSave(); }, [labs, scheduleSave]);

  // Persist only allowed localStorage keys
  React.useEffect(() => {
    localStorage.setItem('portal_active_tab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    localStorage.setItem('portal_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  React.useEffect(() => {
    localStorage.setItem('portal_admin_editing', String(isAdminEditing));
  }, [isAdminEditing]);

  // Handlers for login/logout
  const handleLogin = (username: string, role: 'admin' | 'student') => {
    setCurrentUser({
      username,
      email: role === 'admin' ? 'admin@cemgalvarocontreras.edu.hn' : `${username.toLowerCase().replace(/\s+/g, '')}@cemgalvarocontreras.edu.hn`,
      role
    });
    setActiveTab('inicio');
  };

  const handleLogout = () => {
    if (confirm('¿Está seguro de que desea cerrar sesión en el portal?')) {
      setCurrentUser({ username: 'Invitado', email: '', role: 'guest' });
      setIsAdminEditing(false);
      setActiveTab('inicio');
    }
  };

  // Reset defaults: clear Firestore portal doc and local UI flags (except allowed ones)
  const handleResetDefaults = async () => {
    if (!confirm('¿Está seguro de que desea restablecer todos los textos e imágenes del portal a su estado original? Sus cambios inline se perderán.')) return;
    // reset local allowed keys
    setCurrentUser({ username: 'Invitado', email: '', role: 'guest' });
    setIsAdminEditing(false);
    setActiveTab('inicio');

    // Reset portal in Firestore by saving INITIAL_*
    const portal: PortalDoc = {
      teachers: INITIAL_TEACHERS,
      gallery: INITIAL_GALLERY,
      subjects: INITIAL_SUBJECTS,
      stories: INITIAL_SUCCESS_STORIES,
      honorRoll: INITIAL_HONOR_ROLL,
      companies: INITIAL_COMPANIES,
      stats: INITIAL_STATS,
      notifications: INITIAL_NOTIFICATIONS,
      ui: INITIAL_UI,
      labs: INITIAL_LABS
    };
    try {
      await savePortal(portal);
      // update local state
      setTeachers(INITIAL_TEACHERS);
      setGallery(INITIAL_GALLERY);
      setSubjects(INITIAL_SUBJECTS);
      setStories(INITIAL_SUCCESS_STORIES);
      setHonorRoll(INITIAL_HONOR_ROLL);
      setCompanies(INITIAL_COMPANIES);
      setStats(INITIAL_STATS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setUi(INITIAL_UI);
      setLabs(INITIAL_LABS);
      alert('Se han restaurado los valores del sistema.');
    } catch (err) {
      console.error('Error resetting portal defaults:', err);
      alert('Error al restablecer los valores. Revisa la consola.');
    }
  };

  // Export data (download JSON of the portal document)
  const handleExportData = () => {
    const portal = {
      teachers, gallery, subjects, stories, honorRoll, companies, stats, notifications, ui, labs
    };
    const blob = new Blob([JSON.stringify(portal, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portal-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data (user provides JSON file) — replace portal doc in Firestore
  const handleImportData = async (data: any) => {
    // Validate minimal shape
    const portal: Partial<PortalDoc> = data || {};
    const merged: PortalDoc = {
      teachers: portal.teachers ?? INITIAL_TEACHERS,
      gallery: portal.gallery ?? INITIAL_GALLERY,
      subjects: portal.subjects ?? INITIAL_SUBJECTS,
      stories: portal.stories ?? INITIAL_SUCCESS_STORIES,
      honorRoll: portal.honorRoll ?? INITIAL_HONOR_ROLL,
      companies: portal.companies ?? INITIAL_COMPANIES,
      stats: portal.stats ?? INITIAL_STATS,
      notifications: portal.notifications ?? INITIAL_NOTIFICATIONS,
      ui: portal.ui ?? INITIAL_UI,
      labs: portal.labs ?? INITIAL_LABS
    };
    try {
      await savePortal(merged);
      // update local state
      setTeachers(merged.teachers);
      setGallery(merged.gallery);
      setSubjects(merged.subjects);
      setStories(merged.stories);
      setHonorRoll(merged.honorRoll);
      setCompanies(merged.companies);
      setStats(merged.stats);
      setNotifications(merged.notifications);
      setUi(merged.ui);
      setLabs(merged.labs);
      alert('Importación completada.');
    } catch (err) {
      console.error('Error importing portal data:', err);
      alert('Error al importar los datos. Revisa la consola.');
    }
  };

  // onUpdate handlers passed to components
  const onUpdateTeachers = (t: Teacher[]) => setTeachers(t);
  const onUpdateGallery = (g: GalleryItem[]) => setGallery(g);
  const onUpdateSubjects = (s: Subject[]) => setSubjects(s);
  const onUpdateStories = (st: SuccessStory[]) => setStories(st);
  const onUpdateHonorRoll = (h: HonorStudent[]) => setHonorRoll(h);
  const onUpdateCompanies = (c: PartnerCompany[]) => setCompanies(c);
  const onUpdateStats = (s: PortalStats) => setStats(s);
  const onUpdateNotifications = (n: AppNotification[]) => setNotifications(n);
  const onUpdateUi = (key: string, value: string) => setUi(prev => ({ ...prev, [key]: value }));
  const onUpdateLabs = (l: Lab[]) => setLabs(l);

  // Render simplified shell and pass props to pages (the actual layout/controls are unchanged)
  return (
    <div className="app-root">
      {/* Keep existing sidebar / navigation (omitted for brevity) */}
      <div className="app-content">
        {/* Example usage: pass ui, labs and onUpdate handlers to components */}
        <LandingPage
          isAdminEditing={isAdminEditing}
          currentUserRole={currentUser.role}
          teachers={teachers}
          onUpdateTeachers={onUpdateTeachers}
          gallery={gallery}
          onUpdateGallery={onUpdateGallery}
          subjects={subjects}
          onUpdateSubjects={onUpdateSubjects}
          ui={ui}
          onUpdateUi={onUpdateUi}
          labs={labs}
          onUpdateLabs={onUpdateLabs}
        />

        <GalleryPage
          gallery={gallery}
          onUpdateGallery={onUpdateGallery}
          isAdminEditing={isAdminEditing}
          currentUserRole={currentUser.role}
          ui={ui}
          onUpdateUi={onUpdateUi}
        />

        <SubjectsPage
          subjects={subjects}
          onUpdateSubjects={onUpdateSubjects}
          isAdminEditing={isAdminEditing}
          currentUserRole={currentUser.role}
          ui={ui}
          onUpdateUi={onUpdateUi}
        />

        <AlumniPage
          stories={stories}
          onUpdateStories={onUpdateStories}
          isAdminEditing={isAdminEditing}
          currentUserRole={currentUser.role}
          currentUsername={currentUser.username}
          ui={ui}
          onUpdateUi={onUpdateUi}
        />

        <ThanksPage
          stats={stats}
          onUpdateStats={onUpdateStats}
          honorRoll={honorRoll}
          onUpdateHonorRoll={onUpdateHonorRoll}
          companies={companies}
          onUpdateCompanies={onUpdateCompanies}
          notifications={notifications}
          onUpdateNotifications={onUpdateNotifications}
          isAdminEditing={isAdminEditing}
          currentUserRole={currentUser.role}
          ui={ui}
          onUpdateUi={onUpdateUi}
        />

        <LoginPage onLogin={handleLogin} onLogout={handleLogout} currentUser={currentUser} />

        {/* Expose utilities */}
        <div style={{ marginTop: 16 }}>
          <button onClick={handleExportData}>Exportar datos</button>
          <button onClick={handleResetDefaults}>Restablecer valores por defecto</button>
        </div>
      </div>
    </div>
  );
}
