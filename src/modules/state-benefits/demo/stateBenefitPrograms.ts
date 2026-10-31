import 'server-only';
import {
  addressCountries,
  gentlePathStateBenefitsStrings as copy,
} from '@/strings';
import {
  USStateCodeSchema,
  type USStateCode,
} from '@/modules/onboarding/models/usStateCode';
import type { StateBenefitProgram } from '../models/stateBenefitProgram';

/** Mirrors the API-owned sample template/configuration contract for isolated demo mode. */
export function getDemoStateBenefitPrograms(
  stateCode: USStateCode,
): StateBenefitProgram[] {
  const stateName =
    addressCountries
      .find((country) => country.code === 'US')
      ?.regions.find((state) => state.code === stateCode)?.name ?? stateCode;
  return copy.templates.map(({ key, title, ...template }) => ({
    ...template,
    benefits: [...template.benefits],
    qualifications: [...template.qualifications],
    id: `${stateCode.toLowerCase()}-${key}`,
    state_code: stateCode,
    name: copy.programName(stateName, title),
    image_url: null,
    is_mock: true,
  }));
}
export function getDemoStateBenefitProgramById(
  id: string,
): StateBenefitProgram | undefined {
  const parsed = USStateCodeSchema.safeParse(id.slice(0, 2).toUpperCase());
  return parsed.success
    ? getDemoStateBenefitPrograms(parsed.data).find(
        (program) => program.id === id,
      )
    : undefined;
}
