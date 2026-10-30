export function documentRangeHeader(
  size: number,
  start?: number,
  end?: number,
): string {
  const range =
    start === undefined || end === undefined ? '*' : [start, end].join('-');
  return ['bytes', [range, size].join('/')].join(' ');
}
