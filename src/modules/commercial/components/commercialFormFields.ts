import { gentlePathCommercialStrings as c } from '@/strings';
import type { CommercialEntity } from '../models/commercialEntity';
import type { CommercialFormField } from '../models/commercialFormField';
const sponsor: CommercialFormField = {
  key: 'sponsor_id',
  label: c.sponsor_id,
  kind: 'reference',
  reference: 'sponsors',
  createOnly: true,
};
const relationship: CommercialFormField = {
  key: 'commercial_relationship',
  label: c.commercial_relationship,
  kind: 'select',
  options: c.relationships,
};
const disclosure: CommercialFormField[] = [
  { key: 'disclosure_label', label: c.disclosure_label, max: 200 },
  {
    key: 'affiliate_disclosure',
    label: c.affiliate_disclosure,
    kind: 'textarea',
    optional: true,
    max: 2000,
  },
];
export const commercialFormFields: Record<
  CommercialEntity,
  CommercialFormField[]
> = {
  sponsors: [
    { key: 'name', label: c.name, max: 300 },
    { key: 'legal_name', label: c.legal_name, optional: true, max: 500 },
    { key: 'website_url', label: c.website_url, kind: 'url' },
    { key: 'logo_url', label: c.logo_url, kind: 'url', optional: true },
    {
      key: 'contact_email',
      label: c.contact_email,
      kind: 'email',
      optional: true,
      max: 320,
    },
  ],
  offers: [
    sponsor,
    { key: 'title', label: c.titleLabel, max: 500 },
    {
      key: 'description',
      label: c.descriptionLabel,
      kind: 'textarea',
      max: 20000,
    },
    {
      key: 'category',
      label: c.category,
      kind: 'select',
      options: c.categories,
    },
    relationship,
    { key: 'discount_label', label: c.discount_label, max: 300 },
    { key: 'code', label: c.code, optional: true, max: 300 },
    { key: 'landing_url', label: c.landing_url, kind: 'url' },
    { key: 'terms_text', label: c.terms_text, kind: 'textarea', max: 20000 },
    ...disclosure,
    { key: 'starts_at', label: c.starts_at, kind: 'datetime' },
    { key: 'expires_at', label: c.expires_at, kind: 'datetime' },
  ],
  campaigns: [
    sponsor,
    { key: 'name', label: c.name, max: 300 },
    relationship,
    { key: 'starts_at', label: c.starts_at, kind: 'datetime' },
    { key: 'ends_at', label: c.ends_at, kind: 'datetime', optional: true },
  ],
  creatives: [
    {
      key: 'campaign_id',
      label: c.campaign_id,
      kind: 'reference',
      reference: 'campaigns',
      createOnly: true,
    },
    {
      key: 'discount_offer_id',
      label: c.discount_offer_id,
      kind: 'reference',
      reference: 'offers',
      optional: true,
    },
    { key: 'title', label: c.titleLabel, max: 120 },
    { key: 'subtitle', label: c.subtitle, optional: true, max: 240 },
    ...disclosure,
    { key: 'image_url', label: c.image_url, kind: 'url', optional: true },
    {
      key: 'image_alt_text',
      label: c.image_alt_text,
      kind: 'textarea',
      optional: true,
      max: 1000,
    },
    { key: 'layout', label: c.layout, kind: 'select', options: c.layouts },
    {
      key: 'image_fit',
      label: c.image_fit,
      kind: 'select',
      options: c.imageFits,
    },
    ...(
      [
        'background_color',
        'tint_color',
        'title_color',
        'subtitle_color',
        'button_tint_color',
        'button_text_color',
      ] as const
    ).map((key) => ({ key, label: c[key], optional: true, max: 9 })),
    { key: 'action_title', label: c.action_title, max: 60 },
    {
      key: 'action_type',
      label: c.action_type,
      kind: 'select',
      options: c.actionTypes,
    },
    { key: 'action_value', label: c.action_value, optional: true, max: 1000 },
    { key: 'locale', label: c.locale, max: 64 },
    {
      key: 'supported_platforms',
      label: c.supported_platforms,
      kind: 'platforms',
    },
  ],
  placements: [
    {
      key: 'key',
      label: c.key,
      kind: 'select',
      options: c.placementKeys,
      createOnly: true,
    },
    { key: 'name', label: c.name, max: 300 },
    { key: 'is_enabled', label: c.is_enabled, kind: 'boolean', editOnly: true },
    { key: 'max_items', label: c.max_items, kind: 'number', min: 1, max: 10 },
    {
      key: 'auto_advance_seconds',
      label: c.auto_advance_seconds,
      kind: 'number',
      optional: true,
      min: 3,
      max: 60,
    },
    { key: 'show_pagination', label: c.show_pagination, kind: 'boolean' },
  ],
};
export function commercialName(record: {
  name?: string;
  title?: string;
  id: string;
}) {
  return record.name ?? record.title ?? record.id;
}
export function localDateTime(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export function isoDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
