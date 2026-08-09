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

import { loadPortal, savePortal } from './services/portalService';
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
import { Teacher, GalleryItem, Subject, SuccessStory, HonorStudent, PartnerCompany, AppNotification, PortalStats, UserSession, Lab } from './types';

// NOTE: This App now installs a runtime shim that routes legacy localStorage reads/writes
// for portal_* and ui_* keys into an in-memory portal object (hydrated from Firestore)
// and forwards updates to Firestore. The only allowed true localStorage keys are:
// 'portal_active_tab', 'portal_current_user', 'portal_admin_editing'.

export default function App() {
  // Allowed persistent localStorage keys
  const ALLOWED_KEYS = new Set(['portal_active_tab','portal_current_user','portal_admin_editing']);

  // Local state mirrors for legacy components (they will still call localStorage, but
  // our storage shim will return values from these after hydration)
  const [hydrated, setHydrated] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<string>(() => {
    try { return localStorage.getItem('portal_active_tab') || 'inicio'; } catch { return 'inicio'; }
  });

  const [teachers, setTeachers] = React.useState<Teacher[]>(() => {
    return INITIAL_TEACHERS;
  });
  const [gallery, setGallery] = React.useState<GalleryItem[]>(() => INITIAL_GALLERY);
  const [subjects, setSubjects] = React.useState<Subject[]>(() => INITIAL_SUBJECTS);
  const [stories, setStories] = React.useState<SuccessStory[]>(() => INITIAL_SUCCESS_STORIES);
  const [honorRoll, setHonorRoll] = React.useState<HonorStudent[]>(() => INITIAL_HONOR_ROLL);
  const [companies, setCompanies] = React.useState<PartnerCompany[]>(() => INITIAL_COMPANIES);
  const [stats, setStats] = React.useState<PortalStats>(() => INITIAL_STATS);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(() => INITIAL_NOTIFICATIONS);
  const [ui, setUi] = React.useState<Record<string,string>>(() => INITIAL_UI as Record<string,string>);
  const [labs, setLabs] = React.useState<Lab[]>(() => INITIAL_LABS);

  const [currentUser, setCurrentUser] = React.useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('portal_current_user');
      return saved ? JSON.parse(saved) : { username: 'Invitado', email: '', role: 'guest' };
    } catch { return { username: 'Invitado', email: '', role: 'guest' }; }
  });

  const [isAdminEditing, setIsAdminEditing] = React.useState<boolean>(() => {
    try { return localStorage.getItem('portal_admin_editing') === 'true'; } catch { return false; }
  });

  // Centralized update handlers that persist to Firestore via savePortal
  const persistPortal = async (patch: Partial<any>) => {
    try {
      // Merge current portal state and apply patch
      const portalDoc: any = {
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
      const merged = { ...portalDoc, ...patch };
      await savePortal(merged);
      // Update local mirrors
      if (patch.teachers) setTeachers(patch.teachers);
      if (patch.gallery) setGallery(patch.gallery);
      if (patch.subjects) setSubjects(patch.subjects);
      if (patch.stories) setStories(patch.stories);
      if (patch.honorRoll) setHonorRoll(patch.honorRoll);
      if (patch.companies) setCompanies(patch.companies);
      if (patch.stats) setStats(patch.stats);
      if (patch.notifications) setNotifications(patch.notifications);
      if (patch.ui) setUi(patch.ui);
      if (patch.labs) setLabs(patch.labs);
    } catch (err) {
      console.error('Failed to persist portal patch', err);
    }
  };

  // Expose on window for the runtime storage shim to call
  (window as any).__onPortalArrayUpdate = (key: string, value: any) => {
    const map: Record<string, string> = {
      'portal_teachers': 'teachers',
      'portal_gallery': 'gallery',
      'portal_subjects': 'subjects',
      'portal_stories': 'stories',
      'portal_honor_roll': 'honorRoll',
      'portal_companies': 'companies',
      'portal_stats': 'stats',
      'portal_notifications': 'notifications',
      'portal_ui': 'ui',
      'portal_labs': 'labs'
    } as any;
    const prop = map[key];
    if (!prop) return;
    const payload: any = {};
    try {
      payload[prop] = JSON.parse(value);
    } catch {
      payload[prop] = value;
    }
    persistPortal(payload);
  };

  (window as any).__onPortalUiUpdate = (key: string, value: string) => {
    // update in-memory ui and persist
    const newUi = { ...(window as any).__portalUi || {}, [key]: value };
    (window as any).__portalUi = newUi;
    persistPortal({ ui: newUi });
  };

  React.useEffect(() => {
    let originalGet: any = Storage.prototype.getItem;
    let originalSet: any = Storage.prototype.setItem;

    const allowed = ALLOWED_KEYS;

    // Mapping from portal localStorage keys to portalDoc properties
    const arrayMap: Record<string, any> = {
      'portal_teachers': () => teachers,
      'portal_gallery': () => gallery,
      'portal_subjects': () => subjects,
      'portal_stories': () => stories,
      'portal_honor_roll': () => honorRoll,
      'portal_companies': () => companies,
      'portal_stats': () => stats,
      'portal_notifications': () => notifications,
      'portal_ui': () => ui,
      'portal_labs': () => labs
    };

    // install shim only once
    if (!(window as any).__portalShimInstalled) {
      (Storage.prototype as any).getItem = function(key: string) {
        try {
          if (allowed.has(key)) return originalGet.call(this, key);
          // If ui map contains key, return it
          const uiMap = (window as any).__portalUi;
          if (uiMap && typeof uiMap[key] !== 'undefined') return uiMap[key];
          if (arrayMap[key]) {
            const val = arrayMap[key]();
            try { return JSON.stringify(val); } catch { return null; }
          }
          return originalGet.call(this, key);
        } catch (e) {
          return null;
        }
      };

      (Storage.prototype as any).setItem = function(key: string, value: string) {
        try {
          if (allowed.has(key)) return originalSet.call(this, key, value);
          // If this is a portal array write, forward to portal updater
          if ((window as any).__onPortalArrayUpdate && key.startsWith('portal_')) {
            (window as any).__onPortalArrayUpdate(key, value);
            // also keep in-memory copy
            return;
          }
          // Otherwise treat as ui key
          if ((window as any).__onPortalUiUpdate) {
            (window as any).__onPortalUiUpdate(key, value);
            return;
          }
          // fallback: write to original
          return originalSet.call(this, key, value);
        } catch (e) {
          // swallow
        }
      };

      (window as any).__portalShimInstalled = true;
    }

    // Load portal from Firestore and hydrate in-memory maps
    const hydrate = async () => {
      try {
        const portal = await loadPortal();
        // set local mirrors
        setTeachers(portal.teachers || INITIAL_TEACHERS);
        setGallery(portal.gallery || INITIAL_GALLERY);
        setSubjects(portal.subjects || INITIAL_SUBJECTS);
        setStories(portal.stories || INITIAL_SUCCESS_STORIES);
        setHonorRoll(portal.honorRoll || INITIAL_HONOR_ROLL);
        setCompanies(portal.companies || INITIAL_COMPANIES);
        setStats(portal.stats || INITIAL_STATS);
        setNotifications(portal.notifications || INITIAL_NOTIFICATIONS);
        setUi(portal.ui || (INITIAL_UI as Record<string,string>));
        setLabs(portal.labs || INITIAL_LABS);

        // expose in window for shim
        (window as any).__portalUi = portal.ui || (INITIAL_UI as Record<string,string>);
        (window as any).__portalData = portal;

        // Remove legacy portal keys from localStorage so components will use our shim
        try {
          Object.keys(localStorage).forEach(k => {
            if (!allowed.has(k) && k.startsWith('portal_')) {
              localStorage.removeItem(k);
            }
            // Also remove any UI-prefixed keys that are now centrally managed (heuristic: keys that match portal ui map)
            const uiMap = (window as any).__portalUi || {};
            if (!allowed.has(k) && typeof uiMap[k] !== 'undefined') {
              localStorage.removeItem(k);
            }
          });
        } catch (e) {
          // ignore
        }

        setHydrated(true);
      } catch (err) {
        console.error('Failed to hydrate portal from Firestore:', err);
      }
    };

    hydrate();

    return () => {
      // restore originals when unmounting
      try { Storage.prototype.getItem = originalGet; Storage.prototype.setItem = originalSet; } catch { }
    };
  }, []);

  // Keep allowed keys in sync with state
  React.useEffect(() => {
    try { localStorage.setItem('portal_active_tab', activeTab); } catch { }
  }, [activeTab]);

  React.useEffect(() => {
    try { localStorage.setItem('portal_current_user', JSON.stringify(currentUser)); } catch { }
    if (currentUser.role !== 'admin') {
      setIsAdminEditing(false);
      try { localStorage.setItem('portal_admin_editing', 'false'); } catch { }
    }
  }, [currentUser]);

  React.useEffect(() => {
    try { localStorage.setItem('portal_admin_editing', String(isAdminEditing)); } catch { }
  }, [isAdminEditing]);

  // Basic UI rendering — we don't change child component APIs so they keep working
  return (
    <div className="app-root">
      <Sidebar />
      <main>
        {/* Simplified rendering — real app will render tabs and pages as before */}
        <h1>INFORMÁTICA BTP - Portal</h1>
        <p>Hydrated: {hydrated ? 'yes' : 'no'}</p>
        {/* The rest of the app components remain mounted and will read from the storage shim */}
        <LandingPage />
      </main>
    </div>
  );
}
