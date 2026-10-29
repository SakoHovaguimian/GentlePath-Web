import 'server-only';
import { cookies } from 'next/headers';
import { environment, getRuntimeConfig } from '@/config/environment';
import {
  DemoSettingsInputSchema,
  type DemoSettingsInput,
} from '@/models/demoSettings';
import { DemoContextSchema, type DemoContext } from '@/models/demoContext';
import type { DemoCookieReader } from './models/demoCookieReader';

export const demoSettingsCookieName = 'gentlepath_demo_preferences';

export function isDevSettingsAvailable() {
  return process.env.NODE_ENV === 'development' || environment.demoMode;
}

async function readPreferences(
  cookieStore?: DemoCookieReader,
): Promise<DemoSettingsInput | null> {
  if (!isDevSettingsAvailable()) return null;
  const raw = (cookieStore ?? (await cookies())).get(
    demoSettingsCookieName,
  )?.value;
  if (!raw) return null;
  try {
    const result = DemoSettingsInputSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function getEffectiveRuntime(cookieStore?: DemoCookieReader) {
  const preferences = await readPreferences(cookieStore);
  return {
    ...getRuntimeConfig(preferences?.demoMode ?? environment.demoMode),
    devSettingsEnabled: isDevSettingsAvailable(),
  };
}

export async function getDemoContext(
  cookieStore?: DemoCookieReader,
): Promise<DemoContext> {
  const preferences = await readPreferences(cookieStore);
  return DemoContextSchema.parse(preferences ?? {});
}

export async function writeDemoSettings(input: DemoSettingsInput) {
  (await cookies()).set(
    demoSettingsCookieName,
    JSON.stringify(DemoSettingsInputSchema.parse(input)),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    },
  );
}
