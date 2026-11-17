import React from 'react';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  Plus, 
  Sparkles,
  Save,
  Trash2,
  X
} from 'lucide-react';
import { Subject } from '../types';
import AdminEditOverlay, { QuickEditText } from './AdminEditOverlay';
import { cleanImageUrl } from '../utils';
import ImageUploadInput from './ImageUploadInput';

interface SubjectsPageProps {
  subjects: Subject[];
  onUpdateSubjects: (subjects: Subject[]) => void;
  isAdminEditing: boolean;
  currentUserRole: 'admin' | 'editor' | 'guest';
}

export default function SubjectsPage({
  subjects,
  onUpdateSubjects,
  isAdminEditing,
  currentUserRole
}: SubjectsPageProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSemester, setSelectedSemester] = React.useState('Todos los Semestres');
  const [selectedArea, setSelectedArea] = React.useState('Todas las Áreas');

  // Editable page title and subtitle state
  const [pageTitle, setPageTitle] = React.useState(() => {
    return localStorage.getItem('subjects_page_title') || 'Oferta Académica y Plan de Estudios';
  });
  const [pageSubtitle, setPageSubtitle] = React.useState(() => {
    return localStorage.getItem('subjects_page_subtitle') || 'Explora las asignaturas curriculares clave del Bachillerato Técnico Profesional en Informática diseñadas para formar la próxima generación de líderes en tecnología.';
  });

  const saveText = (key: string, setter: (val: string) => void, val: string) => {
    localStorage.setItem(key, val);
    setter(val);
  };
  
  // Subject Edit/Add States
  const [editingSubject, setEditingSubject] = React.useState<Subject | null>(null);
  const [isAddingSubject, setIsAddingSubject] = React.useState(false);

  // Form states for adding/editing a subject
  const [formName, setFormName] = React.useState('');
  const [formArea, setFormArea] = React.useState('Programación');
  const [formSemester, setFormSemester] = React.useState('I Semestre');
  const [formDescription, setFormDescription] = React.useState('');
  const [formIcon, setFormIcon] = React.useState('terminal');
  const [formImageUrl, setFormImageUrl] = React.useState('');

  // Semester & Area options
  const semesters = ['Todos los Semestres', 'I Semestre', 'II Semestre'];
  const areas = ['Todas las Áreas', 'Programación', 'Redes', 'Hardware', 'Diseño Gráfico', 'Gestión'];

  // Filter logic
  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = selectedSemester === 'Todos los Semestres' || sub.semester === selectedSemester;
    const matchesArea = selectedArea === 'Todas las Áreas' || sub.area === selectedArea;
    return matchesSearch && matchesSemester && matchesArea;
  });

  const startEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setFormName(sub.name);
    setFormArea(sub.area);
    setFormSemester(sub.semester);
    setFormDescription(sub.description);
    setFormIcon(sub.icon);
    setFormImageUrl(sub.imageUrl);
  };

  const startAddSubject = () => {
    setIsAddingSubject(true);
    setFormName('');
    setFormArea('Programación');
    setFormSemester('I Semestre');
    setFormDescription('');
    setFormIcon('terminal');
    setFormImageUrl('https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600');
  };

  const handleSaveSubject = () => {
    if (!formName || !formDescription) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    if (editingSubject) {
      const updated = subjects.map(sub => sub.id === editingSubject.id ? {
        ...sub,
        name: formName,
        area: formArea,
        semester: formSemester,
        description: formDescription,
        icon: formIcon,
        imageUrl: cleanImageUrl(formImageUrl),
        resources: sub.resources || []
      } : sub);
      onUpdateSubjects(updated);
      setEditingSubject(null);
    } else {
      const newSub: Subject = {
        id: `s_${Date.now()}`,
        name: formName,
        area: formArea,
        semester: formSemester,
        description: formDescription,
        icon: formIcon,
        imageUrl: cleanImageUrl(formImageUrl) || 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600',
        resources: []
      };
      onUpdateSubjects([...subjects, newSub]);
      setIsAddingSubject(false);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta asignatura del plan de estudios?')) {
      const updated = subjects.filter(sub => sub.id !== subjectId);
      onUpdateSubjects(updated);
    }
  };

  return (
    <div className="flex-1 w-full relative">
      {/* Header stage */}
      <header className="bg-primary text-white py-16 px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200')" }}></div>
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-block bg-secondary text-white font-mono font-bold text-xs px-3.5 py-1.5 rounded-full mb-4 border border-secondary/25 uppercase tracking-wider">
              Estructura Curricular 2026
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl leading-tight max-w-3xl mb-4">
              <QuickEditText
                isAdminEditing={isAdminEditing}
                value={pageTitle}
                label="Título de la Página"
                onSave={(val) => saveText('subjects_page_title', setPageTitle, val)}
              />
            </h2>
            <p className="font-sans text-sm text-white/80 max-w-2xl leading-relaxed">
              <QuickEditText
                isAdminEditing={isAdminEditing}
                value={pageSubtitle}
                label="Subtítulo de la Página"
                multiline={true}
                onSave={(val) => saveText('subjects_page_subtitle', setPageSubtitle, val)}
              />
            </p>
          </div>
          
          {(currentUserRole !== 'guest' || isAdminEditing) && (
            <button 
              onClick={startAddSubject}
              className="bg-secondary hover:bg-secondary/90 text-white font-display font-bold py-3.5 px-6 rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-md hover:-translate-y-0.5"
            >
              <Plus size={16} />
              Agregar Asignatura
            </button>
          )}
        </div>
      </header>

      {/* Search and Filters & Grid Layout */}
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Search bar & filter dropdowns */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-xl border border-outline-variant/60 shadow-sm items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar asignatura o tema..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent rounded-lg text-xs font-sans p-2.5 bg-white cursor-pointer"
            >
              {semesters.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent rounded-lg text-xs font-sans p-2.5 bg-white cursor-pointer"
            >
              {areas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subjects Grid */}
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-outline-variant/70 p-6">
            <p className="text-sm font-bold text-primary mb-1">No se encontraron asignaturas</p>
            <p className="text-xs text-on-surface-variant">Pruebe modificando los términos de búsqueda o los selectores de filtros superiores.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((sub) => (
              <AdminEditOverlay
                key={sub.id}
                isAdminEditing={isAdminEditing}
                onEdit={() => startEditSubject(sub)}
                onDelete={() => handleDeleteSubject(sub.id)}
                className="bg-white border border-outline-variant/60 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col hover:-translate-y-1 group"
              >
                <div className="h-44 bg-surface-container relative overflow-hidden">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    alt={sub.name} 
                    src={cleanImageUrl(sub.imageUrl)}
                  />
                  <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">
                    {sub.area}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 text-primary text-[9px] font-mono font-bold px-2.5 py-1 rounded shadow-sm">
                    {sub.semester}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="font-display font-bold text-base text-primary group-hover:text-secondary transition-colors">
                        {sub.name}
                      </h3>
                      <span className="p-1.5 bg-primary/5 text-primary rounded-lg">
                        <Terminal size={14} />
                      </span>
                    </div>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-4">
                      {sub.description}
                    </p>
                  </div>
                </div>
              </AdminEditOverlay>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Subject dialog */}
      {(isAddingSubject || editingSubject) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-outline-variant">
            <div className="bg-primary text-white p-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Sparkles size={20} className="text-ochre" />
                {editingSubject ? 'Editar Asignatura' : 'Agregar Nueva Asignatura Académica'}
              </h3>
              <p className="text-xs text-white/70 mt-1">Configure los parámetros curriculares de la asignatura.</p>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Nombre de la Asignatura *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Redes Informáticas III"
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Área Académica *</label>
                  <select 
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat"
                  >
                    {areas.filter(a => a !== 'Todas las Áreas').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Semestre *</label>
                  <select 
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-no-repeat"
                  >
                    <option value="I Semestre">I Semestre</option>
                    <option value="II Semestre">II Semestre</option>
                  </select>
                </div>
              </div>

              <div>
                <ImageUploadInput
                  value={formImageUrl}
                  onChange={setFormImageUrl}
                  label="Imagen Ilustrativa de la Asignatura *"
                  placeholder="Pegue un enlace o suba un archivo..."
                  helpText="Se recomienda una imagen en formato horizontal aspect-video."
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase mb-1">Descripción Curricular *</label>
                <textarea 
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describa los conocimientos, marcos de trabajo o prácticas de taller correspondientes..."
                  rows={4}
                  className="w-full p-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="bg-surface-container-low p-4 border-t border-outline-variant flex justify-end gap-3">
              <button 
                onClick={() => {
                  setEditingSubject(null);
                  setIsAddingSubject(false);
                }}
                className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveSubject}
                className="bg-secondary text-white px-5 py-2 text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save size={14} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
