/**
 * Utility function to clean and convert user-provided image URLs (from Google Drive, Imgur, Dropbox, etc.)
 * into direct, embeddable image source links that render correctly in <img> tags.
 */
export function cleanImageUrl(url: string): string {
  if (!url) return '';
  
  let cleaned = url.trim();

  // 1. Google Drive Conversion
  // Formats:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/view
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID&export=download
  // - https://drive.google.com/uc?id=FILE_ID
  if (cleaned.includes('drive.google.com')) {
    let fileId = '';
    
    // Check /file/d/ID format
    const pathMatch = cleaned.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (pathMatch && pathMatch[1]) {
      fileId = pathMatch[1];
    } else {
      // Check ?id=ID format
      const queryMatch = cleaned.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (queryMatch && queryMatch[1]) {
        fileId = queryMatch[1];
      }
    }

    if (fileId) {
      // https://lh3.googleusercontent.com/d/FILE_ID is the most robust and fast direct view link for public Google Drive files
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Imgur Conversion
  // Formats:
  // - https://imgur.com/abcde
  // - https://imgur.com/a/abcde (album)
  // - http://imgur.com/abcde
  // We want to transform to: https://i.imgur.com/abcde.png
  if (cleaned.includes('imgur.com') && !cleaned.includes('i.imgur.com')) {
    // If it's an album link like imgur.com/a/ID or imgur.com/gallery/ID
    const albumMatch = cleaned.match(/imgur\.com\/(?:a|gallery)\/([a-zA-Z0-9]+)/);
    if (albumMatch && albumMatch[1]) {
      return `https://i.imgur.com/${albumMatch[1]}.png`;
    }
    
    // If it's a direct page link like imgur.com/ID
    const idMatch = cleaned.match(/imgur\.com\/([a-zA-Z0-9]+)/);
    if (idMatch && idMatch[1]) {
      return `https://i.imgur.com/${idMatch[1]}.png`;
    }
  }

  // 3. Dropbox Conversion
  // Formats:
  // - https://www.dropbox.com/s/xxxx/yyyy.png?dl=0
  // Convert to: https://www.dropbox.com/s/xxxx/yyyy.png?raw=1
  if (cleaned.includes('dropbox.com')) {
    if (cleaned.includes('dl=0')) {
      return cleaned.replace('dl=0', 'raw=1');
    }
    if (!cleaned.includes('raw=1') && !cleaned.includes('dl=1')) {
      // Append raw=1
      const separator = cleaned.includes('?') ? '&' : '?';
      return `${cleaned}${separator}raw=1`;
    }
  }

  return cleaned;
}

/** Guarda videos en IndexedDB para no llenar el límite reducido de localStorage. */
export function saveVideoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('btp-portal-media', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos');
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const key = `video_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const tx = db.transaction('videos', 'readwrite');
      tx.objectStore('videos').put(file, key);
      tx.oncomplete = () => { db.close(); resolve(`idb://${key}`); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  });
}

export function resolveVideoUrl(value: string): Promise<string> {
  if (!value.startsWith('idb://')) return Promise.resolve(value);
  const key = value.slice(6);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('btp-portal-media', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('videos')) { db.close(); resolve(''); return; }
      const get = db.transaction('videos', 'readonly').objectStore('videos').get(key);
      get.onsuccess = () => {
        const blob = get.result as Blob | undefined;
        resolve(blob ? URL.createObjectURL(blob) : '');
        db.close();
      };
      get.onerror = () => { db.close(); reject(get.error); };
    };
  });
}

/** Persistencia de colecciones del portal sin el límite pequeño de localStorage. */
function openPortalDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('btp-portal-data', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('collections')) request.result.createObjectStore('collections');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePortalCollection(key: string, value: unknown): Promise<void> {
  const db = await openPortalDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('collections', 'readwrite');
    tx.objectStore('collections').put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPortalCollection<T>(key: string): Promise<T | undefined> {
  const db = await openPortalDatabase();
  const value = await new Promise<T | undefined>((resolve, reject) => {
    const request = db.transaction('collections', 'readonly').objectStore('collections').get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value;
}
