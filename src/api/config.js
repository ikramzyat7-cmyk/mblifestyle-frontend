export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Retire le /api final pour construire l'URL des fichiers stockés
const STORAGE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export function storageUrl(path) {
  if (!path) return null;
  return `${STORAGE_BASE_URL}/storage/${path}`;
}