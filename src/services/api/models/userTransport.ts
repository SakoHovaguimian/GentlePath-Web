import type { UserRole } from '@/models/userRole';

export type UserTransport = {
  id: string;
  external_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: UserRole;
  disabled?: boolean;
  phone_number?: string | null;
  date_of_birth?: string | null;
  created_at: string;
  updated_at: string;
  deleted: boolean;
};
