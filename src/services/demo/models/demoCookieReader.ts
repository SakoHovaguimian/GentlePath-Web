export interface DemoCookieReader {
  get(name: string): { value: string } | undefined;
}
