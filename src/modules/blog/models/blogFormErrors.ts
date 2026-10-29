import type { BlogMutationInput } from './blogArticle';

export type BlogFormErrors = Partial<Record<keyof BlogMutationInput, string>>;
