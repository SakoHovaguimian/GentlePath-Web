export const accountToolsQueryKeys = {
  all: ['account-tools'] as const,
  devices: (query: object) => ['account-tools', 'devices', query] as const,
  deliveries: (query: object) =>
    ['account-tools', 'deliveries', query] as const,
  attempts: (id: string, paging: object) =>
    ['account-tools', 'attempts', id, paging] as const,
  legal: (context: string) => ['account-tools', 'legal', context] as const,
  faq: ['account-tools', 'faq'] as const,
};
