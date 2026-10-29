import { gentlePathBlogStrings as copy } from '@/strings';
import {
  BlogArticleSchema,
  type BlogArticle,
} from '@/modules/blog/models/blogArticle';
import type { BlogCategory } from '@/modules/blog/models/blogCategory';
import type { BlogCover } from '@/modules/blog/models/blogCover';

const slugs = [
  'your-familys-own-path',
  'finding-community',
  'preparing-for-an-appointment',
  'moments-that-matter',
  'making-a-routine-your-own',
  'asking-for-help',
  'a-place-for-the-paperwork',
  'a-note-for-uncertain-days',
];
const categories: BlogCategory[] = [
  'family',
  'community',
  'practical',
  'stories',
  'family',
  'stories',
  'practical',
  'stories',
];
const covers: BlogCover[] = [
  'family',
  'community',
  'folder',
  'journal',
  'growth',
  'path',
  'folder',
  'journal',
];
export function createDemoBlogArticles(): BlogArticle[] {
  return copy.fixtures.map((fixture, index) => {
    const date = new Date(Date.UTC(2026, 9, 22 - index * 3, 12)).toISOString();
    return BlogArticleSchema.parse({
      ...fixture,
      id: `b1000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      slug: slugs[index],
      category: categories[index],
      cover: covers[index],
      status: index === 7 ? 'draft' : 'published',
      createdAt: date,
      updatedAt: date,
      publishedAt: index === 7 ? null : date,
      revision: 1,
    });
  });
}
