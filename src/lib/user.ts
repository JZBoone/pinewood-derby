import { User } from '@generated/client';

export const ROLES = ['user', 'admin'] as const;

export type UserRole = (typeof ROLES)[number];

export function isAdmin(role: User['role']) {
  const admin: UserRole = 'admin';
  return role === admin;
}
