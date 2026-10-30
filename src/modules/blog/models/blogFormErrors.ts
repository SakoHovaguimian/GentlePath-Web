import type { BlogArticleDraft } from './blogArticle';

export type BlogFormErrors = Partial<Record<keyof BlogArticleDraft, string>>;
