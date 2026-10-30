import {
  gentlePathBlogStrings as copy,
  gentlePathBlogBuilderStrings as builderCopy,
} from '@/strings';
import {
  BlogArticleSchema,
  type BlogArticle,
} from '@/modules/blog/models/blogArticle';
import type { BlogCategory } from '@/modules/blog/models/blogCategory';
import type { BlogCover } from '@/modules/blog/models/blogCover';

const empty = '';
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
    const { body: markdown, ...fields } = fixture;
    const legacySection = {
      id: `b2000000-0000-4000-8000-${String(index + 10).padStart(12, '0')}`,
      contentType: 'section',
      metaData: { title: empty, body: markdown, format: 'markdown' },
    };
    return BlogArticleSchema.parse({
      ...fields,
      content:
        index === 0
          ? [
              {
                id: 'b2000000-0000-4000-8000-000000000001',
                contentType: 'header',
                metaData: { text: builderCopy.demo.heading },
              },
              {
                id: 'b2000000-0000-4000-8000-000000000002',
                contentType: 'section',
                metaData: {
                  title: empty,
                  body: builderCopy.demo.text,
                  format: 'plain',
                },
              },
              {
                id: 'b2000000-0000-4000-8000-000000000003',
                contentType: 'quote',
                metaData: {
                  text: builderCopy.demo.quote,
                  attribution: builderCopy.demo.attribution,
                },
              },
              {
                id: 'b2000000-0000-4000-8000-000000000004',
                contentType: 'bullet',
                metaData: { items: builderCopy.demo.items },
              },
              {
                id: 'b2000000-0000-4000-8000-000000000005',
                contentType: 'callout',
                metaData: {
                  title: builderCopy.demo.calloutTitle,
                  text: builderCopy.demo.calloutText,
                },
              },
              {
                id: 'b2000000-0000-4000-8000-000000000006',
                contentType: 'divider',
                metaData: {},
              },
              {
                id: 'b2000000-0000-4000-8000-000000000007',
                contentType: 'footer',
                metaData: { text: builderCopy.demo.footer },
              },
              legacySection,
            ]
          : [legacySection],
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
