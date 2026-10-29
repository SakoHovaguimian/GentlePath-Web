import 'server-only';
import { gentlePathDocumentStrings as copy } from '@/strings';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import type { DocumentType } from '../models/documentType';
import type { DemoDocumentVaultState } from './demoDocumentVaultState';

const globalDocuments = globalThis as typeof globalThis & {
  gentlePathDocumentVaultState?: DemoDocumentVaultState;
};

function samplePdf(): Buffer {
  const escape = (value: string) => value.replace(/[\\()]/g, '\\$&');
  const lines = copy.demo.documentBody.match(/.{1,75}(?:\s|$)/g) ?? [
    copy.demo.documentBody,
  ];
  const program = {
    code: `BT /F1 18 Tf 50 730 Td (${escape(copy.demo.documentHeading)}) Tj /F1 11 Tf 0 -34 Td ${lines.map((line) => ({ code: `(${escape(line.trim())}) Tj 0 -18 Td` }).code).join(' ')} ET`,
  };
  const content = program.code;
  const objects = [
    { code: '<< /Type /Catalog /Pages 2 0 R >>' },
    { code: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
    {
      code: '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    },
    { code: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' },
    {
      code: `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    },
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    const objectProgram = {
      code: `${index + 1} 0 obj\n${object.code}\nendobj\n`,
    };
    pdf += objectProgram.code;
  });
  const start = Buffer.byteLength(pdf);
  const crossReferenceProgram = {
    code: `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
      .join(
        '',
      )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`,
  };
  pdf += crossReferenceProgram.code;
  return Buffer.from(pdf);
}

function createState(): DemoDocumentVaultState {
  const contents = samplePdf();
  const documentTypes: DocumentType[] = ['IEP', 'CARE_PLAN', 'OTHER'];
  return {
    documents: getDemoState().users.flatMap((user) => {
      const child = getDemoPortalState().children.find(
        (item) => item.userId === user.id,
      );
      return copy.demo.samples.map((sample, index) => {
        const date = new Date(
          Date.now() - (index + 1) * 86400000,
        ).toISOString();
        return {
          metadata: {
            id: crypto.randomUUID(),
            userId: user.id,
            childId: index < 2 ? (child?.id ?? null) : null,
            title: sample.title,
            fileName: sample.fileName,
            documentType: documentTypes[index],
            mimeType: 'application/pdf' as const,
            sizeBytes: contents.length,
            createdAt: date,
            updatedAt: date,
          },
          contentBase64: contents.toString('base64'),
        };
      });
    }),
    uploads: new Map(),
  };
}

export function getDemoDocumentVaultState(): DemoDocumentVaultState {
  return (globalDocuments.gentlePathDocumentVaultState ??= createState());
}

export function resetDocumentVaultDemoState(): void {
  delete globalDocuments.gentlePathDocumentVaultState;
}
