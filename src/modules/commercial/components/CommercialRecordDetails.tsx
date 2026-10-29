import { Badge, Card, DescriptionList, FormSection } from '@/components/ui';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type {
  CommercialEntity,
  CommercialRecord,
} from '../models/commercialEntity';
import { commercialFormFields } from './commercialFormFields';
export function CommercialRecordDetails({
  entity,
  record,
}: {
  entity: CommercialEntity;
  record: CommercialRecord;
}) {
  const fields = commercialFormFields[entity];
  return (
    <Card>
      <FormSection
        id="commercial-details"
        title={copy.contentTitle}
        description={copy.attributionHint}
      >
        <DescriptionList
          items={fields.map((field) => {
            const value = (record as Record<string, unknown>)[field.key];
            let display: React.ReactNode =
              value === null || value === undefined || value === ''
                ? copy.none
                : typeof value === 'boolean'
                  ? value
                    ? copy.statuses.enabled
                    : copy.statuses.disabled
                  : Array.isArray(value)
                    ? value
                        .map(
                          (platform) =>
                            copy.platforms[
                              platform as keyof typeof copy.platforms
                            ],
                        )
                        .join(', ')
                    : (field.options?.[String(value)] ?? String(value));
            if (field.kind === 'datetime' && value)
              display = new Date(String(value)).toLocaleString('en-US');
            if (field.kind === 'url' && value)
              display = (
                <a
                  className="text-brand-secondary underline underline-offset-4 hover:text-primary"
                  href={String(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {String(value)}
                </a>
              );
            if (
              field.key === 'sponsor_id' &&
              'sponsor' in record &&
              record.sponsor
            )
              display = record.sponsor.name;
            return {
              label: field.label,
              value: display,
              fullWidth: field.kind === 'textarea',
            };
          })}
        />
        {'review_notes' in record && record.review_notes && (
          <p className="m-0 whitespace-pre-wrap text-sm text-secondary">
            {record.review_notes}
          </p>
        )}
        {'verification_status' in record && (
          <Badge>{copy.statuses[record.verification_status]}</Badge>
        )}
      </FormSection>
    </Card>
  );
}
