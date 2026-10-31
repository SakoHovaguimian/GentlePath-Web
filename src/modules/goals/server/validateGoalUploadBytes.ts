import 'server-only';
import { ValidationError } from '@/errors/domainErrors';
import { gentlePathGoalStrings as copy } from '@/strings';
import { detectDocumentMimeType } from '@/modules/documents/services/documentFileValidation';
import { GoalUploadInput } from '../models/goalUploadInput';

export function validateGoalUploadBytes(
  bytes: Buffer,
  input: GoalUploadInput,
): void {
  if (bytes.length !== input.size_bytes)
    throw new ValidationError(copy.invalidFile);
  if (!input.mime_type.startsWith('video/')) {
    if (detectDocumentMimeType(bytes) !== input.mime_type)
      throw new ValidationError(copy.invalidFile);
    return;
  }
  let offset = 0;
  let format = false;
  let movie = false;
  let data = false;
  while (offset < bytes.length) {
    if (bytes.length - offset < 8) throw new ValidationError(copy.invalidFile);
    const length = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    let size = length || bytes.length - offset;
    let header = 8;
    if (length === 1) {
      if (
        bytes.length - offset < 16 ||
        bytes.readBigUInt64BE(offset + 8) > BigInt(bytes.length)
      )
        throw new ValidationError(copy.invalidFile);
      size = Number(bytes.readBigUInt64BE(offset + 8));
      header = 16;
    }
    if (size < header || offset + size > bytes.length)
      throw new ValidationError(copy.invalidFile);
    if (type === 'ftyp') {
      if (size < header + 8) throw new ValidationError(copy.invalidFile);
      const accepted =
        input.mime_type === 'video/quicktime'
          ? ['qt  ']
          : [
              'isom',
              'iso2',
              'iso3',
              'iso4',
              'iso5',
              'iso6',
              'mp41',
              'mp42',
              'avc1',
              'M4V ',
              'MSNV',
              'dash',
            ];
      const brands = [
        bytes.subarray(offset + header, offset + header + 4).toString('ascii'),
      ];
      for (let pos = offset + header + 8; pos + 4 <= offset + size; pos += 4)
        brands.push(bytes.subarray(pos, pos + 4).toString('ascii'));
      format = brands.some((brand) => accepted.includes(brand));
    }
    movie ||= type === 'moov' && size > header;
    data ||= type === 'mdat' && size > header;
    offset += size;
  }
  if (!format || !movie || !data) throw new ValidationError(copy.invalidFile);
}
