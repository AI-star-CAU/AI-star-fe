export function readStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private mode or restricted iframe contexts.
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private mode or restricted iframe contexts.
  }
}

export function readJsonStorageItem<T>(key: string): T | null {
  const raw = readStorageItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    removeStorageItem(key);
    return null;
  }
}

export function writeJsonStorageItem(key: string, value: unknown): void {
  writeStorageItem(key, JSON.stringify(value));
}
