import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
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
  INITIAL_LABS
} from "../data";

import { Teacher, GalleryItem, Subject, SuccessStory, HonorStudent, PartnerCompany, AppNotification, PortalStats, Lab } from "../types";

export type PortalDoc = {
  teachers: Teacher[];
  gallery: GalleryItem[];
  subjects: Subject[];
  stories: SuccessStory[];
  honorRoll: HonorStudent[];
  companies: PartnerCompany[];
  stats: PortalStats;
  notifications: AppNotification[];
  ui: Record<string, string>;
  labs: Lab[];
};

const COLLECTION = "portal";
const DOC = "principal";

export async function loadPortal(): Promise<PortalDoc> {
  const ref = doc(db, COLLECTION, DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const initial = {
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
    await setDoc(ref, initial);
    return initial;
  }
  const data = snap.data() as Partial<PortalDoc>;
  const merged: PortalDoc = {
    teachers: data.teachers ?? INITIAL_TEACHERS,
    gallery: data.gallery ?? INITIAL_GALLERY,
    subjects: data.subjects ?? INITIAL_SUBJECTS,
    stories: data.stories ?? INITIAL_SUCCESS_STORIES,
    honorRoll: data.honorRoll ?? INITIAL_HONOR_ROLL,
    companies: data.companies ?? INITIAL_COMPANIES,
    stats: data.stats ?? INITIAL_STATS,
    notifications: data.notifications ?? INITIAL_NOTIFICATIONS,
    ui: data.ui ?? INITIAL_UI,
    labs: data.labs ?? INITIAL_LABS
  };

  // If data is empty object, set initial
  if (!data || Object.keys(data).length === 0) {
    await setDoc(ref, merged);
  }

  return merged;
}

export async function savePortal(portal: PortalDoc): Promise<void> {
  const ref = doc(db, COLLECTION, DOC);
  await setDoc(ref, portal);
}
