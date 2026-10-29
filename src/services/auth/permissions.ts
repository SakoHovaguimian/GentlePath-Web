import type { UserRole } from '@/models/userRole';

export function canManageContent(role: UserRole) { return role === 'admin' || role === 'superadmin'; }
export function canManagePlatform(role: UserRole) { return role === 'superadmin'; }
