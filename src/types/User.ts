export type UserRole = 'owner' | 'farmer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dairyId?: string;
  createdAt?: unknown;
}