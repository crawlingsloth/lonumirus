import { getUserByEmail } from './db';
import type { User, UserRole } from '../types';

const CURRENT_USER_KEY = 'lonumirus-current-user';

export async function login(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);

  if (!user || !user.active) {
    return null;
  }

  // Simple password check (plain text for demo)
  if (user.passwordHash !== password) {
    return null;
  }

  // Store in sessionStorage
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

  return user;
}

export function logout(): void {
  sessionStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): User | null {
  const stored = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function switchRole(role: UserRole): void {
  const user = getCurrentUser();
  if (user) {
    user.role = role;
    setCurrentUser(user);
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
