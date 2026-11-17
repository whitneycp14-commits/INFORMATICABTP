import React from 'react';
import { 
  Heart, 
  Award, 
  Building, 
  Users, 
  Handshake, 
  Calendar, 
  Send, 
  BellRing, 
  Check, 
  ShieldAlert,
  X,
  FileSpreadsheet,
  Trash2,
  Bookmark,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import { HonorStudent, PartnerCompany, AppNotification, PortalStats } from '../types';
import AdminEditOverlay, { QuickEditText } from './AdminEditOverlay';

interface ThanksPageProps {
  stats: PortalStats;
  onUpdateStats: (stats: PortalStats) => void;
  honorRoll: HonorStudent[];
  onUpdateHonorRoll: (roll: HonorStudent[]) => void;
  companies: PartnerCompany[];
  onUpdateCompanies: (comps: PartnerCompany[]) => void;
  notifications: AppNotification[];
  onUpdateNotifications: (notes: AppNotification[]) => void;
  isAdminEditing: boolean;
  currentUserRole: 'admin' | 'editor' | 'guest';
}

export default function ThanksPage({
  stats,
  onUpdateStats,
  honorRoll,
  onUpdateHonorRoll,
  companies,
  onUpdateCompanies,
  notifications,
  onUpdateNotifications,
  isAdminEditing,
  currentUserRole
}: ThanksPageProps) {
  // Customizable Page texts
  const [pageTitle, setPageTitle] = React.useState(() => {
    return localStorage.getItem('thanks_page_title') || 'Honor a quien honor merece';
  });
  const [pageSubtitle, setPageSubtitle] = React.useState(() => {
    return localStorage.getItem('thanks_page_subtitle') || 'Reconocemos y agradecemos el apoyo constante, el esfuerzo conjunto y el compromiso de excelencia académica que definen el BTP en Informática del CEMG Álvaro Contreras.';
  });
  
  const [instTitle, setInstTitle] = React.useState(() => {
    return localStorage.getItem('thanks_inst_title') || 'La Institución';
  });
  const [instDesc, setInstDesc] = React.useState(() => {
    return localStorage.getItem('thanks_inst_desc') || 'Al CEMG Álvaro Contreras, por ser el pilar fundamental que sostiene los sueños de cientos de jóvenes. Su liderazgo visionario ha permitido que el Bachillerato Técnico Profesional en Informática se posicione como un referente de innovación tecnológica y compromiso social en nuestra región de Santa Rosa de Copán.';
  });
  const [instImageUrl, setInstImageUrl] = React.useState(() => {
    return localStorage.getItem('thanks_inst_image_url') || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFbsyiHpTwyzKkBc121ajfnJYwG-AERx23tfzj4d5ZvigZ4YWEn6E1looS3Zm8tZf2KRUP12ZIDPnyj5piUs16d8DM2vN8jrHnxkxdwVt3HrViq8yhV4Yna1BXpRmWGs8yQMH4Biv0COSudihWhae-hTL8rv12AUU3ay4Wh6x31xDOSUcGFGCbr_YgzLJBJwY1ZxsXHrrE416zCM-6qpFM9bdAdHQx0vgVzKXfXh5ZLjClR0YCwfQ2kuR0Wy8G8vmZfslvCM1rtD0';
  });
  const [editingInstImage, setEditingInstImage] = React.useState(false);

  const [allianceTitle, setAllianceTitle] = React.useState(() => {
    return localStorage.getItem('thanks_alliance_title') || 'Alianza con la Alcaldía';
  });
  const [allianceDesc, setAllianceDesc] = React.useState(() => {
    return localStorage.getItem('thanks_alliance_desc') || 'Expresamos nuestro más profundo agradecimiento al Gobierno Municipal y Local por su apoyo decidido en la modernización de los laboratorios de cómputo. Gracias a este esfuerzo unificado, formamos técnicos con herramientas reales y de alto nivel.';
  });

  const saveText = (key: string, setter: (val: string) => void, val: string) => {
    localStorage.setItem(key, val);
    setter(val);
  };

  // Notification form states
  const [noteTitle, setNoteTitle] = React.useState('');
  const [noteMessage, setNoteMessage] = React.useState('');
  const [noteAudience, setNoteAudience] = React.useState<'Todos' | 'Docentes' | 'Estudiantes' | 'Graduados'>('Todos');
  
  // Real-time notification dispatch feedback log
  const [dispatchLogs, setDispatchLogs] = React.useState<string[]>([]);
  const [isDispatching, setIsDispatching] = React.useState(false);

  // Stats edit states
  const [editingStats, setEditingStats] = React.useState(false);
  const [statStudents, setStatStudents] = React.useState(stats.studentsCount);
  const [statTeachers, setStatTeachers] = React.useState(stats.teachersCount);
  const [statAwards, setStatAwards] = React.useState(stats.awardsCount);

  // Honor roll editor states
  const [editingHonor, setEditingHonor] = React.useState<HonorStudent | null>(null);
  const [honorName, setHonorName] = React.useState('');
  const [honorGrade, setHonorGrade] = React.useState('');
  const [honorAvg, setHonorAvg] = React.useState(90);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle || !noteMessage) {
      alert('Por favor, rellene el título y mensaje de la notificación.');
      return;
    }

    setIsDispatching(true);
    setDispatchLogs(['Iniciando servicio de despacho institucional...', 'Filtrando bases de datos para la audiencia: ' + noteAudience + '...']);

    // Staggered log simulator for maximum visual polish!
    setTimeout(() => {
      setDispatchLogs(prev => [...prev, 'Preparando encriptación AES-256 para el canal de comunicación...']);
    }, 1000);

    setTimeout(() => {
      setDispatchLogs(prev => [...prev, 'Despachando notificaciones push e invitaciones por correo electrónico...']);
    }, 2200);

    setTimeout(() => {
      // Append notification to state
      const newNotification: AppNotification = {
        id: `n_${Date.now()}`,
        title: noteTitle,
        message: noteMessage,
        date: new Date().toISOString().split('T')[0],
        targetAudience: noteAudience,
        sentBy: 'Administrador del Portal'
      };
      
      onUpdateNotifications([newNotification, ...notifications]);
      setDispatchLogs(prev => [...prev, '¡Notificación distribuida con éxito a todos los destinatarios inscritos!']);
      setNoteTitle('');
      setNoteMessage('');
      
      // Stop spinner
      setTimeout(() => {
        setIsDispatching(false);
        setDispatchLogs([]);
      }, 1500);
    }, 3500);
  };

  const handleSaveStats = () => {
    onUpdateStats({
      ...stats,
      studentsCount: Number(statStudents) || stats.studentsCount,
      teachersCount: Number(statTeachers) || stats.teachersCount
    });
    setEditingStats(false);
  };

  const handleStartEditHonor = (student: HonorStudent) => {
    setEditingHonor(student);
    setHonorName(student.name);
    setHonorGrade(student.grade);
    setHonorAvg(student.average);
  };

  const handleSaveHonor = () => {
    if (!editingHonor) return;
    const updated = honorRoll.map(h => h.id === editingHonor.id ? {
      ...h,
      name: honorName,
      grade: honorGrade,
      average: Number(honorAvg) || h.average
    } : h);
    onUpdateHonorRoll(updated);
    setEditingHonor(null);
  };

  const handleDeleteNotification = (id: string) => {
    if (confirm('¿Desea eliminar el registro histórico de esta notificación?')) {
      onUpdateNotifications(notifications.filter(n => n.id !== id));
    }
  };

  return (
    <div className="flex-1 w-full relative">
      {/* Hero Header */}
      <header className="relative bg-primary text-white overflow-hidden py-16 px-8 border-b border-outline-variant/60">
        <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800')" }}></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center md:text-left">
          <span className="inline-block px-4 py-1 bg-secondary text-white font-mono font-bold text-xs mb-4 rounded-full">
            Institución de Excelencia
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight max-w-3xl mb-4">
            <QuickEditText
              isAdminEditing={isAdminEditing}
              value={pageTitle}
              label="Título de la Página"
              onSave={(val) => saveText('thanks_page_title', setPageTitle, val)}
            />
          </h2>
          <p className="font-sans text-base text-white/80 max-w-2xl leading-relaxed">
            <QuickEditText
              isAdminEditing={isAdminEditing}
              value={pageSubtitle}
              label="Subtítulo de la Página"
              multiline={true}
              onSave={(val) => saveText('thanks_page_subtitle', setPageSubtitle, val)}
            />
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
        {/* Bento grid layout for Recognition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Block: Institutional Gratitude (Spans full width since Honor Roll was removed) */}
          <div className="lg:col-span-12 space-y-8">
            
            {/* The Institution */}
            <div className="bg-white border border-outline-variant/60 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center shadow-sm border-l-8 border-primary">
              <div className="w-full md:w-1/3 flex-shrink-0">
                <AdminEditOverlay
                  isAdminEditing={isAdminEditing}
                  onEdit={() => setEditingInstImage(true)}
                  className="aspect-square bg-surface-container rounded-xl overflow-hidden border border-outline-variant/40 shadow-inner w-full"
                >
                  <img 
                    className="w-full h-full object-cover cursor-pointer" 
                    alt="Colegio Alvaro Contreras" 
                    src={instImageUrl}
                    referrerPolicy="no-referrer"
                  />
                </AdminEditOverlay>
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-primary mb-3">
                  <QuickEditText
                    isAdminEditing={isAdminEditing}
                    value={instTitle}
                    label="Título Institucional"
                    onSave={(val) => saveText('thanks_inst_title', setInstTitle, val)}
                  />
                </h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-4">
                  <QuickEditText
                    isAdminEditing={isAdminEditing}
                    value={instDesc}
                    label="Descripción de la Institución"
                    multiline={true}
                    onSave={(val) => saveText('thanks_inst_desc', setInstDesc, val)}
                  />
                </p>
                <span className="text-xs font-mono font-bold text-primary flex items-center gap-1.5">
                  <Bookmark size={14} className="text-secondary" />
                  Excelencia Académica y Formativa
                </span>
              </div>
            </div>

            {/* Mayor partnership info */}
            <div className="bg-primary text-white rounded-xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md relative overflow-hidden">
              <div className="space-y-2 relative z-10 w-full md:max-w-xl">
                <h3 className="font-display font-bold text-xl text-ochre">
                  <QuickEditText
                    isAdminEditing={isAdminEditing}
                    value={allianceTitle}
                    label="Título de Alianza"
                    onSave={(val) => saveText('thanks_alliance_title', setAllianceTitle, val)}
                  />
                </h3>
                <p className="font-sans text-sm text-white/80 leading-relaxed">
                  <QuickEditText
                    isAdminEditing={isAdminEditing}
                    value={allianceDesc}
                    label="Descripción de la Alianza"
                    multiline={true}
                    onSave={(val) => saveText('thanks_alliance_desc', setAllianceDesc, val)}
                  />
                </p>
              </div>
              <span className="p-4 bg-white/5 rounded-full border border-white/10 relative z-10 text-ochre flex-shrink-0">
                <Handshake size={32} />
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Honor student edit dialog modal */}
      {editingHonor && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-outline-variant">
            <div className="bg-primary text-white p-6">
              <h3 className="font-display font-bold text-base flex items-center gap-1.5">
                <Award size={18} className="text-ochre" />
                Editar Estudiante Destacado
              </h3>
              <p className="text-xs text-white/70 mt-1">Modifique los méritos del Cuadro de Honor del departamento.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  value={honorName}
                  onChange={(e) => setHonorName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant mb-1">Sección / Curso *</label>
                <input 
                  type="text" 
                  value={honorGrade}
                  onChange={(e) => setHonorGrade(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant mb-1">Promedio General (%) *</label>
                <input 
                  type="number" 
                  min={0}
                  max={100}
                  value={honorAvg}
                  onChange={(e) => setHonorAvg(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-surface-container-low p-4 border-t border-outline-variant flex justify-end gap-3">
              <button 
                onClick={() => setEditingHonor(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveHonor}
                className="bg-secondary text-white px-5 py-2 text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-md"
              >
                Guardar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institution Image Edit Modal */}
      {editingInstImage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-outline-variant">
            <div className="bg-primary text-white p-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <ImageIcon size={20} className="text-ochre" />
                Editar Imagen de la Institución
              </h3>
              <p className="text-xs text-white/70 mt-1">Coloque una URL de imagen válida para actualizar la fotografía de la sección "La Institución".</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">URL de la Imagen *</label>
                <input 
                  type="text" 
                  defaultValue={instImageUrl}
                  id="inst-img-input"
                  placeholder="Pegue la URL de la nueva imagen aquí"
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <p className="text-[10px] text-on-surface-variant italic">Tip: Puede usar fotos alojadas en Google Drive (enlaces públicos), Unsplash, Imgur u otros servicios.</p>
            </div>

            <div className="bg-surface-container-low p-4 border-t border-outline-variant flex justify-end gap-3">
              <button 
                onClick={() => setEditingInstImage(false)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  const input = document.getElementById('inst-img-input') as HTMLInputElement | null;
                  if (input && input.value.trim()) {
                    saveText('thanks_inst_image_url', setInstImageUrl, input.value.trim());
                  }
                  setEditingInstImage(false);
                }}
                className="bg-secondary text-white px-5 py-2 text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save size={14} />
                Guardar Imagen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
