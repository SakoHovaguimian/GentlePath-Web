import {
  DashboardModelMetaSchema,
  DashboardModelSummarySchema,
  DashboardOverviewSchema,
  FeatureRequestSchema,
  UserMutationInputSchema,
  UserSchema,
  type DashboardModelMeta,
  type DashboardModelSummary,
  type DashboardOverview,
  type FeatureRequest,
  type FeatureRequestMutationInput,
  type User,
  type UserMutationInput,
} from '@/models';
import type {
  DashboardModelMetaTransport,
  DashboardModelSummaryTransport,
  DashboardOverviewTransport,
  FeatureRequestMutationTransport,
  FeatureRequestTransport,
  UserMutationTransport,
  UserTransport,
} from './models';
import { mapUserRoleTransport } from './mapUserRoleTransport';

export function mapUserTransportToDomain(transport: UserTransport): User {
  return UserSchema.parse({
    id: transport.id,
    externalId: transport.external_id,
    firstName: transport.first_name,
    lastName: transport.last_name,
    email: transport.email,
    role: mapUserRoleTransport(transport.role),
    phoneNumber: transport.phone_number ?? null,
    dateOfBirth: transport.date_of_birth ?? null,
    createdAt: transport.created_at,
    updatedAt: transport.updated_at,
    deleted: transport.deleted,
  });
}

export function mapUserMutationToTransport(
  input: UserMutationInput,
): UserMutationTransport {
  const parsed = UserMutationInputSchema.parse(input);
  return {
    first_name: parsed.firstName,
    last_name: parsed.lastName,
    email: parsed.email,
    phone_number: parsed.phoneNumber,
    date_of_birth: parsed.dateOfBirth,
  };
}

export function mapFeatureRequestTransportToDomain(
  transport: FeatureRequestTransport,
): FeatureRequest {
  return FeatureRequestSchema.parse({
    id: transport.id,
    userId: transport.user_id,
    message: transport.message,
    createdAt: transport.created_at,
    updatedAt: transport.updated_at,
    deleted: transport.deleted,
    user: transport.user ? mapUserTransportToDomain(transport.user) : null,
  });
}

export function mapFeatureRequestMutationToTransport(
  input: FeatureRequestMutationInput,
): FeatureRequestMutationTransport {
  return {
    message: input.message,
  };
}

export function mapDashboardOverviewTransportToDomain(
  transport: DashboardOverviewTransport,
): DashboardOverview {
  return DashboardOverviewSchema.parse({
    models: transport.models.map((item) => ({
      model: item.model,
      displayName: item.display_name,
      totalCount: item.total_count,
      periodCount: item.period_count,
      growthPercent: item.growth_percent ?? null,
    })),
    dateRange: {
      from: transport.date_range.from,
      to: transport.date_range.to,
    },
  });
}

export function mapDashboardModelSummaryTransportToDomain(
  transport: DashboardModelSummaryTransport,
): DashboardModelSummary {
  return DashboardModelSummarySchema.parse({
    key: transport.key,
    displayName: transport.display_name,
    fieldCount: transport.field_count,
    recordCount: transport.record_count,
  });
}

export function mapDashboardModelMetaTransportToDomain(
  transport: DashboardModelMetaTransport,
): DashboardModelMeta {
  return DashboardModelMetaSchema.parse({
    key: transport.key,
    displayName: transport.display_name,
    displayNameSingular: transport.display_name_singular,
    totalRecords: transport.total_records,
    dateField: transport.date_field,
    labelField: transport.label_field,
    fields: transport.fields.map((field) => ({
      name: field.name,
      type: field.type,
      displayName: field.display_name,
      displayable: field.displayable,
      filterable: field.filterable,
      searchable: field.searchable,
      sensitive: field.sensitive,
      sortable: field.sortable,
      aggregatable: field.aggregatable,
    })),
    relations: transport.relations.map((relation) => ({
      name: relation.name,
      model: relation.model,
      type: relation.type,
      foreignKey: relation.foreign_key,
      displayField: relation.display_field,
    })),
  });
}
