import { STORAGE_KEYS } from '../constants/storageKeys';
import { readJsonStorageItem, writeJsonStorageItem } from './localStorage';

export function readStoredSettings<T>(): T | null {
  return readJsonStorageItem<T>(STORAGE_KEYS.SETTINGS);
}

export function saveStoredSettings(settings: unknown): void {
  writeJsonStorageItem(STORAGE_KEYS.SETTINGS, settings);
}
