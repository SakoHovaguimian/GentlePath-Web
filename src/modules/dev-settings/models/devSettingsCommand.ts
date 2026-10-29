import type { DemoSettingsInput } from '@/models/demoSettings';
import type { UserRole } from '@/models/userRole';

export type DevSettingsCommand =
  | { kind: 'update'; input: DemoSettingsInput }
  | { kind: 'role'; role: UserRole }
  | { kind: 'reset' };
