import React from 'react';
import { 
  Star, 
  ArrowRight, 
  Plus, 
  CheckCircle, 
  Send, 
  X, 
  AlertCircle, 
  Sparkles, 
  Save, 
  Check, 
  ThumbsUp,
  Award
} from 'lucide-react';
import { SuccessStory } from '../types';
import AdminEditOverlay, { QuickEditText } from './AdminEditOverlay';
import { cleanImageUrl } from '../utils';
import ImageUploadInput from './ImageUploadInput';

interface AlumniPageProps {
  stories: SuccessStory[];
  onUpdateStories: (stories: SuccessStory[]) => void;
  isAdminEditing: boolean;
  currentUserRole: 'admin' | 'editor' | 'guest';
  currentUsername: string;
}

export default function AlumniPage({
  stories,
  onUpdateStories,
  isAdminEditing,
  currentUserRole,
  currentUsername
}: AlumniPageProps) {
  const [showApplyModal, setShowApplyModal] = React.useState(false);
  const [editingStory, setEditingStory] = React.useState<SuccessStory | null>(null);

  // Editable title and subtitle state
  const [pageTitle, setPageTitle] = React.useState(() => {
    return localStorage.getItem('alumni_page_title') || 'Casos de Éxito de Egresados';
  });
  const [pageSubtitle, setPageSubtitle] = React.useState(() => {
    return localStorage.getItem('alumni_page_subtitle') || 'Nuestros graduados del Bachillerato Técnico Profesional en Informática están transformando el panorama tecnológico local y global. Conoce las historias de quienes un día fueron estudiantes y hoy son líderes en la industria.';
  });

  const saveText = (key: string, setter: (val: string) => void, val: string) => {
    localStorage.setItem(key, val);
    setter(val);
  };

  // Form states
  const [formName, setFormName] = React.useState('');
  const [formTitle, setFormTitle] = React.useState('');
  const [formRole, setFormRole] = React.useState('');
  const [formStory, setFormStory] = React.useState('');
  const [formImageUrl, setFormImageUrl] = React.useState('');
  const [formCategory, setFormCategory] = React.useState('Emprendimiento');

  // Notification feedbacks
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);

  // Filter public (approved) stories
  const publicStories = stories.filter(s => s.approved);
  // Filter pending (not approved) stories
  const pendingStories = stories.filter(s => !s.approved);

  const startSubmitStory = () => {
    setShowApplyModal(true);
    setFormName(currentUserRole !== 'guest' ? currentUsername : '');
    setFormTitle('');
    setFormRole('');
    setFormStory('');
    setFormImageUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400');
    setFormCategory('Emprendimiento');
  };

  const startEditStory = (story: SuccessStory) => {
    setEditingStory(story);
    setFormName(story.name);
    setFormTitle(story.title);
    setFormRole(story.role);
    setFormStory(story.story);
    setFormImageUrl(story.imageUrl);
    setFormCategory(story.category);
  };

  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formRole || !formStory || !formTitle) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    // Auto-approve if user is admin
    const autoApprove = currentUserRole !== 'guest';

    const newStory: SuccessStory = {
      id: `ss_${Date.now()}`,
      name: formName,
      title: formTitle,
      role: formRole,
      story: formStory,
      imageUrl: cleanImageUrl(formImageUrl) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      category: formCategory,
      approved: autoApprove,
      date: new Date().toISOString().split('T')[0],
      submittedBy: currentUsername
    };

    onUpdateStories([newStory, ...stories]);
    setShowApplyModal(false);
    
    if (autoApprove) {
      alert('Caso de éxito publicado inmediatamente.');
    } else {
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 5000);
    }
  };

  const handleSaveEdit = () => {
    if (!editingStory) return;
    const updated = stories.map(s => s.id === editingStory.id ? {
      ...s,
      name: formName,
      title: formTitle,
      role: formRole,
      story: formStory,
      imageUrl: cleanImageUrl(formImageUrl),
      category: formCategory
    } : s);
    onUpdateStories(updated);
    setEditingStory(null);
  };

  const handleApprove = (id: string) => {
    const updated = stories.map(s => s.id === id ? { ...s, approved: true } : s);
    onUpdateStories(updated);
  };

  const handleDeleteStory = (id: string) => {
    const updated = stories.filter(s => s.id !== id);
    onUpdateStories(updated);
  };

  return (
    <div className="flex-1 w-full relative">
      {/* Header section */}
      <header className="bg-white border-b border-outline-variant/60 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3.5 py-1 bg-secondary text-white font-mono font-bold text-xs rounded-full">Exalumnos Destacados</span>
            <div className="h-[1px] flex-1 bg-outline-variant/50"></div>
          </div>
          <h2 className="font-display font-extrabold text-3xl text-primary mb-4">
            <QuickEditText
              isAdminEditing={isAdminEditing}
              value={pageTitle}
              label="Título de la Página"
              onSave={(val) => saveText('alumni_page_title', setPageTitle, val)}
            />
          </h2>
          <p className="font-sans text-base text-on-surface-variant max-w-3xl leading-relaxed">
            <QuickEditText
              isAdminEditing={isAdminEditing}
              value={pageSubtitle}
              label="Subtítulo de la Página"
              multiline={true}
              onSave={(val) => saveText('alumni_page_subtitle', setPageSubtitle, val)}
            />
          </p>
        </div>
      </header>

      {/* Submission Success Toast */}
      {submissionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-green-500 animate-slide-up max-w-sm">
          <CheckCircle size={20} className="text-ochre" />
          <div>
            <p className="text-xs font-bold">¡Caso de Éxito Postulado!</p>
            <p className="text-[10px] text-white/80 leading-tight">Su historia fue guardada. Un administrador la validará pronto para su publicación oficial.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">
        
        {/* Pending Stories Section for Administrators */}
        {currentUserRole !== 'guest' && pendingStories.length > 0 && (
          <section className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-display font-bold text-lg text-red-900 mb-4 flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              Solicitudes Pendientes de Aprobación ({pendingStories.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingStories.map((story) => (
                <div key={story.id} className="bg-white rounded-lg p-5 border border-red-200 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={cleanImageUrl(story.imageUrl)} alt={story.name} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <h4 className="font-display font-bold text-sm text-primary">{story.name}</h4>
                        <p className="text-[10px] font-mono text-secondary font-bold uppercase">{story.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono font-bold mb-1">Empresa: {story.title}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4 font-sans italic">"{story.story}"</p>
                  </div>
                  
                  <div className="mt-5 pt-3 border-t border-outline-variant/40 flex justify-end gap-2">
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="px-3 py-1.5 border border-red-300 text-red-600 rounded text-xs font-bold hover:bg-red-50 flex items-center gap-1"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleApprove(story.id)}
                      className="px-3.5 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-xs"
                    >
                      <Check size={14} />
                      Aprobar y Publicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Public Stories Grid */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-outline-variant/40 pb-3">
            <h3 className="font-display font-bold text-xl text-primary flex items-center gap-2">
              <Award className="text-secondary" size={20} />
              Historias Públicas
            </h3>
            {isAdminEditing && (
              <span className="text-[11px] font-mono font-bold bg-secondary text-white py-1 px-3 rounded-full">
                Modo Edición Rápida Activo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {publicStories.map((story) => (
              <AdminEditOverlay
                key={story.id}
                isAdminEditing={isAdminEditing}
                onEdit={() => startEditStory(story)}
                onDelete={() => handleDeleteStory(story.id)}
                className="group relative bg-white border border-outline-variant/60 rounded-xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden relative bg-surface-container">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={story.name} 
                    src={cleanImageUrl(story.imageUrl)}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-mono font-bold text-xs flex items-center gap-2">
                      <CheckCircle size={14} className="text-ochre" />
                      {story.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lg text-primary mb-1">{story.name}</h3>
                  <p className="font-mono text-xs text-secondary font-bold mb-4">{story.title}</p>
                  
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-6 flex-1 italic">
                    "{story.story}"
                  </p>
                  
                  <span className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1 self-start">
                    Egresado • {story.date.split('-')[0]}
                  </span>
                </div>
              </AdminEditOverlay>
            ))}
          </div>
        </section>

        {/* CTA - Postulate case */}
        <section className="bg-primary text-white rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="relative z-10 max-w-xl space-y-3">
            <h2 className="font-display font-bold text-2xl">¿Eres egresado y quieres compartir tu historia?</h2>
            <p className="font-sans text-sm text-white/80 leading-relaxed">
              Tu experiencia inspira a las nuevas generaciones de informáticos. Comparte tus logros y forma parte de nuestra prestigiosa red de mentores del CEMG Álvaro Contreras.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-wrap gap-4 flex-shrink-0">
            <button 
              onClick={startSubmitStory}
              className="bg-ochre hover:bg-ochre/90 text-primary px-6 py-3.5 rounded-lg font-display font-bold text-xs shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Postular mi Caso
            </button>
          </div>
          
          {/* Decorative circular element */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </section>
      </div>

      {/* Postulate Story Modal Form */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveSubmission}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-outline-variant"
          >
            <div className="bg-primary text-white p-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Send size={18} className="text-ochre" />
                Postular mi Caso de Éxito
              </h3>
              <p className="text-xs text-white/70 mt-1">Comparta su historia académica o laboral para inspirar a otros.</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Nombre Completo *</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Elena Rodríguez"
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Año de Graduación / Promo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Promo 2018"
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Puesto Actual *</label>
                  <input 
                    type="text" 
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Ej. Senior Cloud Engineer"
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Empresa / Proyecto *</label>
                  <input 
                    type="text" 
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej. TechNova Corp"
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Categoría del Caso *</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Emprendimiento">Emprendimiento Tecnológico</option>
                  <option value="Ingeniería Cloud">Ingeniería / Desarrollo</option>
                  <option value="Ciberseguridad">Ciberseguridad & Infraestructura</option>
                  <option value="Academico">Investigación Académica</option>
                </select>
              </div>

              <div>
                <ImageUploadInput
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  label="Foto de Perfil (Opcional)"
                  placeholder="Pegue un enlace o suba un archivo..."
                  helpText="Se recomienda una foto de perfil redonda/cuadrada."
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Su Historia de Éxito *</label>
                <textarea 
                  required
                  value={formStory}
                  onChange={(e) => setFormStory(e.target.value)}
                  placeholder="Cuéntanos: ¿cómo influyó tu formación en el Álvaro Contreras para tu éxito laboral? ¿Qué consejos darías a los estudiantes actuales?"
                  rows={4}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-surface-container-low p-4 border-t border-outline-variant flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-secondary text-white px-5 py-2 text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send size={14} />
                Enviar Solicitud
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Public Story Modal (For Admins) */}
      {editingStory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-outline-variant">
            <div className="bg-primary text-white p-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Sparkles size={20} className="text-ochre" />
                Editar Caso de Éxito Publicado
              </h3>
              <p className="text-xs text-white/70 mt-1">Realice ajustes a la biografía o al texto de testimonio del exalumno.</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Puesto Actual *</label>
                  <input 
                    type="text" 
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Subtítulo / Empresa *</label>
                  <input 
                    type="text" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Categoría *</label>
                <input 
                  type="text" 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <ImageUploadInput
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  label="Foto de Perfil *"
                  placeholder="Pegue un enlace o suba un archivo..."
                  helpText="Foto pública para la biografía del exalumno."
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Testimonio / Historia *</label>
                <textarea 
                  value={formStory}
                  onChange={(e) => setFormStory(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-surface-container-low p-4 border-t border-outline-variant flex justify-end gap-3">
              <button 
                onClick={() => setEditingStory(null)}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveEdit}
                className="bg-secondary text-white px-5 py-2 text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save size={14} />
                Guardar Ajustes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
