import { STORAGE_KEYS } from '../constants/storageKeys';
import {
  readJsonStorageItem,
  removeStorageItem,
  writeJsonStorageItem,
} from './localStorage';

export function readAuthUser<T>(): T | null {
  return readJsonStorageItem<T>(STORAGE_KEYS.AUTH_USER);
}

export function saveAuthUser(user: unknown): void {
  writeJsonStorageItem(STORAGE_KEYS.AUTH_USER, user);
}

export function clearAuthUser(): void {
  removeStorageItem(STORAGE_KEYS.AUTH_USER);
}
