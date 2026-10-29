export type BackendForward = (
  request: Request,
  path: string,
) => Promise<Response>;
