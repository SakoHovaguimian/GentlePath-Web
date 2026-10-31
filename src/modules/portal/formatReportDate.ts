export function formatReportDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' });
}
