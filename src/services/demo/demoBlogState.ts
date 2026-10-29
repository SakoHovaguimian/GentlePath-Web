import 'server-only';
import type { BlogArticle } from '@/modules/blog/models/blogArticle';
import { createDemoBlogArticles } from './demoBlogFixtures';
import { resetDemoBlogImages } from './demoBlogMedia';

const demoGlobal = globalThis as typeof globalThis & {
  gentlePathDemoBlog?: BlogArticle[];
};
export function getDemoBlogState(): BlogArticle[] {
  demoGlobal.gentlePathDemoBlog ??= createDemoBlogArticles();
  for (const article of demoGlobal.gentlePathDemoBlog) article.content ??= [];
  return demoGlobal.gentlePathDemoBlog;
}
export function resetDemoBlogState(): void {
  demoGlobal.gentlePathDemoBlog = createDemoBlogArticles();
  resetDemoBlogImages();
}
