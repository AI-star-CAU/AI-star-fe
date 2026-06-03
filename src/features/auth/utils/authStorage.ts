import {
  clearAuthToken as clearStoredAuthToken,
  saveAuthToken as saveStoredAuthToken,
} from '../../../shared/storage/tokenStorage';
import {
  clearAuthUser,
  readAuthUser,
  saveAuthUser,
} from '../../../shared/storage/userStorage';
import type { User } from '../types';

export function readSavedUser(): User | null {
  return readAuthUser<User>();
}

export function saveUser(user: User): void {
  saveAuthUser(user);
}

export function clearSavedUser(): void {
  clearAuthUser();
}

export function saveAuthToken(token: string): void {
  saveStoredAuthToken(token);
}

export function clearAuthToken(): void {
  clearStoredAuthToken();
}
