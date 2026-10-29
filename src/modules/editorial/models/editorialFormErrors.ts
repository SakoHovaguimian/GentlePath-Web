export type EditorialFormErrors = Record<string, string>;

export interface EditorialValidation<T> {
  data?: T;
  errors: EditorialFormErrors;
}
