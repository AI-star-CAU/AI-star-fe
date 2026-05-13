import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';
import type { User } from '../types';

export function readSavedUser(): User | null {
  const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as User;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
}

export function clearSavedUser(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}
