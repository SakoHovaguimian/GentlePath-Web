'use client';

import { strings } from '@/strings';
import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  DataTable,
  MetricCard,
  ErrorState,
  PageHeader,
} from '@/components/ui';
import {
  useDashboardOverview,
  useDashboardModels,
  useDashboardRecords,
  useDashboardModelDetail,
} from './hooks';
import { useDashboardChromeStore } from '../../stores/dashboardChromeStore';

const comparisonMonths = [
  strings.ui.dashboardScreen.dec20,
  strings.ui.dashboardScreen.jan21,
  strings.ui.dashboardScreen.feb21,
  strings.ui.dashboardScreen.mar21,
  strings.ui.dashboardScreen.apr21,
  strings.ui.dashboardScreen.may21,
];
const directRevenue = [700, 3900, 3200, 5100, 2100, 1800];
const indirectRevenue = [1600, 2600, 1900, 3800, 4700, 3900];
const avgOrderValueCurrent = [52, 24, 18, 28, 20, 25, 17, 31, 19, 23, 21, 26];
const avgOrderValuePrevious = [34, 12, 38, 10, 27, 15, 23, 19, 17, 29, 13, 16];
const salesOverTimeCurrent = [180, 260, 340, 420, 390, 560, 610, 720, 860, 940];
const salesOverTimePrevious = [
  420, 360, 330, 300, 350, 390, 410, 430, 470, 520,
];
const salesOverTimeForecast = [
  120, 140, 180, 160, 210, 240, 220, 260, 300, 340,
];
const salesVsRefundsSales = [5600, 7200, 6100, 6800, 5300, 7000];
const salesVsRefundsRefunds = [-1800, -1200, -2500, -1700, -3200, -1400];

const topChannels = [
  {
    source: strings.ui.dashboardScreen.githubCom,
    visitors: strings.ui.dashboardScreen.value24k2,
    revenue: strings.ui.dashboardScreen.value3877,
    sales: strings.ui.dashboardScreen.value267,
    conversion: strings.ui.dashboardScreen.value47,
  },
  {
    source: strings.ui.dashboardScreen.facebook,
    visitors: strings.ui.dashboardScreen.value22k,
    revenue: strings.ui.dashboardScreen.value3426,
    sales: strings.ui.dashboardScreen.value249,
    conversion: strings.ui.dashboardScreen.value44,
  },
  {
    source: strings.ui.dashboardScreen.googleOrganic,
    visitors: strings.ui.dashboardScreen.value20k,
    revenue: strings.ui.dashboardScreen.value2444,
    sales: strings.ui.dashboardScreen.value224,
    conversion: strings.ui.dashboardScreen.value42,
  },
  {
    source: strings.ui.dashboardScreen.vimeoCom,
    visitors: strings.ui.dashboardScreen.value19k,
    revenue: strings.ui.dashboardScreen.value2236,
    sales: strings.ui.dashboardScreen.value220,
    conversion: strings.ui.dashboardScreen.value42,
  },
  {
    source: strings.ui.dashboardScreen.indiehackersCom,
    visitors: strings.ui.dashboardScreen.value17k2,
    revenue: strings.ui.dashboardScreen.value2034,
    sales: strings.ui.dashboardScreen.value204,
    conversion: strings.ui.dashboardScreen.value39,
  },
] as const;

const refundReasons = [
  {
    label: strings.ui.dashboardScreen.havingDifficultiesUsingTheProduct,
    value: 48.7,
    color: 'var(--color-brand-500)',
  },
  {
    label: strings.ui.dashboardScreen.missingFeaturesINeed,
    value: 24.9,
    color: 'var(--color-chart-tertiary)',
  },
  {
    label: strings.ui.dashboardScreen.notSatisfiedAboutTheQualityOfTheProduct,
    value: 19.3,
    color: 'var(--color-chart-secondary)',
  },
  {
    label: strings.ui.dashboardScreen.theProductDoesnTLookAsAdvertised,
    value: 9.6,
    color: 'var(--color-chart-success)',
  },
  {
    label: strings.ui.dashboardScreen.other,
    value: 9.3,
    color: 'var(--color-chart-neutral)',
  },
] as const;

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  padding = 10,
) {
  if (values.length === 0) {
    return '';
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  return values
    .map((value, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
      const y =
        height - padding - ((value - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function DashboardPanel({
  eyebrow,
  title,
  value,
  delta,
  children,
  legend,
}: {
  eyebrow: string;
  title: string;
  value?: string;
  delta?: string;
  children: ReactNode;
  legend?: ReactNode;
}) {
  return (
    <Card className="grid gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-base font-semibold text-primary">{title}</h3>
        </div>
        {legend}
      </div>
      {value ? (
        <div className="flex items-center gap-2">
          <div className="text-3xl font-semibold tracking-tight text-primary">
            {value}
          </div>
          {delta ? (
            <span className="inline-flex rounded-full bg-brand-primary px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
              {delta}
            </span>
          ) : null}
        </div>
      ) : null}
      {children}
    </Card>
  );
}

function LineChart({
  primary,
  secondary,
  tertiary,
}: {
  primary: number[];
  secondary?: number[];
  tertiary?: number[];
}) {
  return (
    <svg
      viewBox="0 0 320 150"
      className="h-44 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {[24, 62, 100, 138].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="320"
          y2={y}
          stroke="var(--color-border-tertiary)"
          strokeWidth="1"
        />
      ))}
      {secondary ? (
        <path
          d={buildLinePath(secondary, 320, 150, 12)}
          fill="none"
          stroke="var(--color-chart-previous)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
      {tertiary ? (
        <path
          d={buildLinePath(tertiary, 320, 150, 12)}
          fill="none"
          stroke="var(--color-chart-forecast)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
      <path
        d={buildLinePath(primary, 320, 150, 12)}
        fill="none"
        stroke="var(--color-brand-500)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ComparisonBars() {
  const maxValue = Math.max(...directRevenue, ...indirectRevenue);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="inline-flex items-center gap-2 text-primary">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-solid" />
          <strong>{strings.ui.dashboardScreen.value17k}</strong>{' '}
          {strings.ui.dashboardScreen.direct}
        </span>
        <span className="inline-flex items-center gap-2 text-primary">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-chart-secondary)]" />
          <strong>{strings.ui.dashboardScreen.value24k}</strong>{' '}
          {strings.ui.dashboardScreen.indirect}
        </span>
      </div>
      <div className="grid gap-3">
        <div className="flex h-40 items-end gap-4">
          {comparisonMonths.map((month, index) => (
            <div
              key={month}
              className="flex min-w-0 flex-1 items-end justify-center gap-1.5"
            >
              <span
                className="w-4 rounded-t-md bg-brand-solid/85"
                style={{
                  height: `${(directRevenue[index] / maxValue) * 100}%`,
                }}
              />
              <span
                className="w-4 rounded-t-md bg-[var(--color-chart-secondary)]"
                style={{
                  height: `${(indirectRevenue[index] / maxValue) * 100}%`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-4 text-center text-xs font-medium uppercase tracking-[0.12em] text-tertiary">
          {comparisonMonths.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CountriesDonut() {
  return (
    <div className="grid place-items-center gap-6 py-2">
      <div
        className="relative h-52 w-52 rounded-full"
        style={{
          background:
            'conic-gradient(var(--color-brand-500) 0 38%, var(--color-chart-secondary) 38% 66%, var(--color-chart-tertiary) 66% 100%)',
        }}
      >
        <div className="absolute inset-5 rounded-full bg-primary" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-secondary">
        {[
          [strings.ui.dashboardScreen.unitedStates, 'var(--color-brand-500)'],
          [strings.ui.dashboardScreen.italy, 'var(--color-chart-secondary)'],
          [strings.ui.dashboardScreen.other, 'var(--color-chart-tertiary)'],
        ].map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopChannelsTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-secondary bg-primary">
      <div className="grid grid-cols-[1.5fr_repeat(4,minmax(0,1fr))] gap-3 border-b border-secondary bg-secondary_subtle px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
        <span>{strings.ui.dashboardScreen.source}</span>
        <span>{strings.ui.dashboardScreen.visitors}</span>
        <span>{strings.ui.dashboardScreen.revenue}</span>
        <span>{strings.ui.dashboardScreen.sales}</span>
        <span>{strings.ui.dashboardScreen.conversion}</span>
      </div>
      <div className="divide-y divide-secondary">
        {topChannels.map((channel) => (
          <div
            key={channel.source}
            className="grid grid-cols-[1.5fr_repeat(4,minmax(0,1fr))] gap-3 px-4 py-3 text-sm text-secondary"
          >
            <span className="font-medium text-primary">{channel.source}</span>
            <span>{channel.visitors}</span>
            <span className="text-success-primary">{channel.revenue}</span>
            <span>{channel.sales}</span>
            <span className="text-[var(--color-chart-secondary)]">
              {channel.conversion}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesVsRefundsBars() {
  const maxValue = Math.max(
    ...salesVsRefundsSales,
    ...salesVsRefundsRefunds.map((value) => Math.abs(value)),
  );

  return (
    <div className="grid gap-4">
      <div className="flex h-44 items-center gap-4">
        {comparisonMonths.map((month, index) => (
          <div
            key={month}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1"
          >
            <div className="flex h-20 items-end">
              <span
                className="w-6 rounded-t-md bg-brand-solid/85"
                style={{
                  height: `${(salesVsRefundsSales[index] / maxValue) * 100}%`,
                }}
              />
            </div>
            <div className="flex h-20 items-start">
              <span
                className="w-6 rounded-b-md bg-[var(--color-chart-refunds)]"
                style={{
                  height: `${(Math.abs(salesVsRefundsRefunds[index]) / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-4 text-center text-xs font-medium uppercase tracking-[0.12em] text-tertiary">
        {comparisonMonths.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
}

function RefundReasonsCard() {
  return (
    <Card className="grid gap-5">
      <div>
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
          {strings.ui.dashboardScreen.breakdown}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-primary">
          {strings.ui.dashboardScreen.reasonForRefunds}
        </h3>
      </div>
      <div className="rounded-xl border border-secondary bg-secondary_subtle p-4">
        <div className="flex h-4 overflow-hidden rounded-full">
          {refundReasons.map((reason) => (
            <span
              key={reason.label}
              style={{
                width: `${reason.value}%`,
                backgroundColor: reason.color,
              }}
            />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {refundReasons.map((reason) => (
            <div
              key={reason.label}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="flex items-start gap-2 text-secondary">
                <span
                  className="mt-1 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: reason.color }}
                />
                <span>{reason.label}</span>
              </div>
              <span className="font-medium text-primary">
                {reason.value}
                {strings.ui.dashboardScreen.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function DashboardScreen() {
  const searchParams = useSearchParams();
  const { demoMode } = useRuntimeConfig();
  const model = searchParams.get('model') ?? 'featureRequest';
  const search = searchParams.get('search') ?? '';
  const overview = useDashboardOverview();
  const models = useDashboardModels();
  const records = useDashboardRecords(model, search);
  const modelDetail = useDashboardModelDetail(model);
  const { density, setDensity } = useDashboardChromeStore();

  const columns = useMemo(() => {
    const rows = records.data?.data ?? [];
    const keys = Object.keys(rows[0] ?? {}).slice(0, 4);
    return keys.map((key) => ({
      key,
      header:
        modelDetail.data?.fields.find((field) => field.name === key)
          ?.displayName || key,
      render: (row: Record<string, unknown>) => String(row[key] ?? ''),
    }));
  }, [records.data, modelDetail.data]);

  const visibleRows = records.data?.data.length ?? 0;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={strings.ui.dashboardScreen.dashboard}
        description={
          strings.ui.dashboardScreen
            .reviewYourWorkspaceActivityBrowseRecordsAndManageIncoming
        }
        meta={
          overview.data && (
            <span>
              {strings.ui.dashboardScreen.dateRange(
                new Date(overview.data.dateRange.from).toLocaleDateString(
                  'en-US',
                ),
                new Date(overview.data.dateRange.to).toLocaleDateString(
                  'en-US',
                ),
              )}
            </span>
          )
        }
        action={
          <Button asChild variant="secondary">
            <Link href="/dev-settings/components">
              {strings.designSystem.openLibrary}
            </Link>
          </Button>
        }
      />

      {(overview.isPending || models.isPending || records.isPending) && (
        <Card>{strings.ui.dashboardScreen.loadingWorkspaceData}</Card>
      )}
      {(overview.isError || models.isError || records.isError) && (
        <ErrorState
          title={strings.ui.dashboardScreen.workspaceDataUnavailable}
          description={
            strings.ui.dashboardScreen.pleaseTryLoadingYourWorkspaceAgain
          }
          onRetry={() => {
            void overview.refetch();
            void models.refetch();
            void records.refetch();
          }}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.data?.models.map((item) => (
          <MetricCard
            key={item.model}
            eyebrow={item.displayName}
            value={String(item.totalCount)}
            caption={strings.ui.dashboardScreen.newInRange(item.periodCount)}
          />
        ))}
      </div>

      <Card className="grid gap-4">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
            {strings.ui.dashboardScreen.density}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary">
            {strings.ui.dashboardScreen.modelExplorer}
          </h2>
          <p className="mt-2 text-sm leading-6 text-secondary">
            {strings.ui.dashboardScreen.chooseHowMuchSpaceToUseForEachRecord}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={density === 'comfortable' ? 'primary' : 'secondary'}
            onClick={() => setDensity('comfortable')}
          >
            {strings.ui.dashboardScreen.comfortable}
          </Button>
          <Button
            variant={density === 'compact' ? 'primary' : 'secondary'}
            onClick={() => setDensity('compact')}
          >
            {strings.ui.dashboardScreen.compact}
          </Button>
        </div>
        <div className="rounded-xl border border-secondary bg-secondary_subtle p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-tertiary">
            {strings.ui.dashboardScreen.selectedModel}
          </p>
          <p className="mt-2 text-sm font-semibold text-primary">
            {modelDetail.data?.displayName || model}
          </p>
          <p className="mt-1 text-sm text-secondary">
            {visibleRows}{' '}
            {strings.ui.dashboardScreen.visibleRecordsInTheCurrentQuery}
          </p>
        </div>
      </Card>

      {demoMode && (
        <>
          <p className="text-sm text-tertiary">
            {strings.ui.dashboardScreen.sampleAnalyticsDemoData}
          </p>
          <div className="grid gap-4 xl:grid-cols-2">
            <DashboardPanel
              eyebrow={strings.ui.dashboardScreen.sales}
              title={strings.ui.dashboardScreen.directVsIndirect}
              value={strings.ui.dashboardScreen.value17k3}
            >
              <ComparisonBars />
            </DashboardPanel>
            <DashboardPanel
              eyebrow={strings.ui.dashboardScreen.orderValue}
              title={strings.ui.dashboardScreen.avgOrderValue}
              value={strings.ui.dashboardScreen.value72}
              delta={strings.ui.dashboardScreen.value34}
              legend={
                <div className="flex items-center gap-4 text-xs font-medium text-tertiary">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-solid" />
                    {strings.ui.dashboardScreen.current}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-chart-neutral)]" />
                    {strings.ui.dashboardScreen.previous}
                  </span>
                </div>
              }
            >
              <LineChart
                primary={avgOrderValueCurrent}
                secondary={avgOrderValuePrevious}
              />
            </DashboardPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <DashboardPanel
              eyebrow={strings.ui.dashboardScreen.audience}
              title={strings.ui.dashboardScreen.topCountries}
            >
              <CountriesDonut />
            </DashboardPanel>
            <DashboardPanel
              eyebrow={strings.ui.dashboardScreen.acquisition}
              title={strings.ui.dashboardScreen.topChannels}
            >
              <TopChannelsTable />
            </DashboardPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <DashboardPanel
              eyebrow={strings.ui.dashboardScreen.stores}
              title={strings.ui.dashboardScreen.salesOverTime}
              value={strings.ui.dashboardScreen.value1482}
              delta={strings.ui.dashboardScreen.value22}
              legend={
                <div className="flex items-center gap-4 text-xs font-medium text-tertiary">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-solid" />
                    {strings.ui.dashboardScreen.current}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-chart-neutral)]" />
                    {strings.ui.dashboardScreen.previous}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-chart-forecast)]" />
                    {strings.ui.dashboardScreen.forecast}
                  </span>
                </div>
              }
            >
              <LineChart
                primary={salesOverTimeCurrent}
                secondary={salesOverTimePrevious}
                tertiary={salesOverTimeForecast}
              />
            </DashboardPanel>
            <DashboardPanel
              eyebrow={strings.ui.dashboardScreen.finance}
              title={strings.ui.dashboardScreen.salesVsRefunds}
              value={strings.ui.dashboardScreen.value6796}
              delta={strings.ui.dashboardScreen.value342}
            >
              <SalesVsRefundsBars />
            </DashboardPanel>
          </div>

          <RefundReasonsCard />
        </>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {strings.ui.dashboardScreen.records}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-primary">
                {strings.ui.dashboardScreen.primaryDataTable}
              </h3>
            </div>
            <span className="inline-flex rounded-full bg-secondary_subtle px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">
              {visibleRows} {strings.ui.dashboardScreen.rows}
            </span>
          </div>
          {columns.length > 0 ? (
            <DataTable columns={columns} rows={records.data?.data ?? []} />
          ) : (
            <p className="m-0 text-sm text-secondary">
              {strings.ui.dashboardScreen.noRecordsAvailable}
            </p>
          )}
        </Card>

        <Card className="grid gap-4">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
              {strings.ui.dashboardScreen.registry}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-primary">
              {strings.ui.dashboardScreen.registeredModels}
            </h3>
          </div>
          <div className="grid gap-3">
            {models.data?.map((entry) => (
              <div
                key={entry.key}
                className="rounded-xl border border-secondary bg-secondary_subtle p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    className="font-semibold text-primary underline"
                    href={`/dashboard?model=${encodeURIComponent(entry.key)}`}
                  >
                    {entry.displayName}
                  </Link>
                  <span className="inline-flex rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                    {entry.recordCount}
                  </span>
                </div>
                <div className="mt-2 text-sm text-secondary">
                  {
                    strings.ui.dashboardScreen
                      .recordsAvailableForOperationalViews
                  }
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
