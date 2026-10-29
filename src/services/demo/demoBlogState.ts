import 'server-only';
import type { BlogArticle } from '@/modules/blog/models/blogArticle';
import { createDemoBlogArticles } from './demoBlogFixtures';

const demoGlobal = globalThis as typeof globalThis & {
  gentlePathDemoBlog?: BlogArticle[];
};
export function getDemoBlogState(): BlogArticle[] {
  demoGlobal.gentlePathDemoBlog ??= createDemoBlogArticles();
  return demoGlobal.gentlePathDemoBlog;
}
export function resetDemoBlogState(): void {
  demoGlobal.gentlePathDemoBlog = createDemoBlogArticles();
}
