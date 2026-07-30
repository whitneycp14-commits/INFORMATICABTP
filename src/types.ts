export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  description: string;
  email: string;
  dineInUrl?: string; // Optional links from the original markup
  imageUrl: string;
}

export interface LibraryResource {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'ZIP' | 'XLSX';
  size: string;
  area: string;
  date: string;
}

export interface Subject {
  id: string;
  name: string;
  area: string;
  semester: string;
  description: string;
  icon: string;
  imageUrl: string;
  resources: LibraryResource[];
}

export interface SuccessStory {
  id: string;
  name: string;
  title: string;
  role: string;
  story: string;
  imageUrl: string;
  category: string;
  approved: boolean;
  submittedBy?: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Laboratorios' | 'Mantenimiento' | 'Redes' | 'Desarrollo Web' | 'Producciones Digitales' | 'Eventos';
  date: string;
  description: string;
  imageUrl: string;
}

export interface HonorStudent {
  id: string;
  name: string;
  grade: string;
  average: number;
  avatarUrl: string;
  rank: number;
}

export interface PartnerCompany {
  id: string;
  name: string;
  icon: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  targetAudience: 'Todos' | 'Docentes' | 'Estudiantes' | 'Graduados';
  sentBy: string;
}

export interface PortalStats {
  studentsCount: number;
  teachersCount: number;
  awardsCount: number;
  laboratoriesCount: number;
}

export interface UserSession {
  username: string;
  email: string;
  role: 'admin' | 'student' | 'guest';
}

// Lab type used in the LandingPage / portal UI
export interface Lab {
  id: string;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
}
