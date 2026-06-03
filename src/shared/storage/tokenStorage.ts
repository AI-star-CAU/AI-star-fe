import { STORAGE_KEYS } from '../constants/storageKeys';
import { readStorageItem, removeStorageItem, writeStorageItem } from './localStorage';

export function readAuthToken(): string | null {
  return readStorageItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function saveAuthToken(token: string): void {
  writeStorageItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export function clearAuthToken(): void {
  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
}
