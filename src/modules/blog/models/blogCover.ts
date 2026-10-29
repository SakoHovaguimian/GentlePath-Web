import { z } from 'zod';

export const BlogCoverSchema = z.enum([
  'family',
  'community',
  'journal',
  'growth',
  'folder',
  'path',
]);
export type BlogCover = z.infer<typeof BlogCoverSchema>;
export const blogCoverAssets: Record<BlogCover, string> = {
  family: '/gentlepath/parent-and-child.png',
  community: '/gentlepath/caregiver-community.png',
  journal: '/gentlepath/care-notes.png',
  growth: '/gentlepath/growing-together.png',
  folder: '/gentlepath/care-folder.png',
  path: '/gentlepath/winding-path.png',
};
