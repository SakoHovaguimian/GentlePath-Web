import { z } from 'zod';
import { BlogImageUrlSchema } from './blogContentUrl';

export const BlogCoverPresetSchema = z.enum([
  'family',
  'community',
  'journal',
  'growth',
  'folder',
  'path',
]);
export const BlogCoverSchema = z.union([
  BlogCoverPresetSchema,
  BlogImageUrlSchema,
]);
export type BlogCover = z.infer<typeof BlogCoverSchema>;
export const blogCoverAssets: Record<
  z.infer<typeof BlogCoverPresetSchema>,
  string
> = {
  family: '/gentlepath/parent-and-child.png',
  community: '/gentlepath/caregiver-community.png',
  journal: '/gentlepath/care-notes.png',
  growth: '/gentlepath/growing-together.png',
  folder: '/gentlepath/care-folder.png',
  path: '/gentlepath/winding-path.png',
};
export function blogCoverSource(cover: string) {
  const preset = BlogCoverPresetSchema.safeParse(cover);
  return preset.success ? blogCoverAssets[preset.data] : cover;
}
