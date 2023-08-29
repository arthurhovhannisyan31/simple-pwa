declare global {
  type AnyObject = Record<string, any>;

  type UnknownObject = Record<string, unknown>;

  type EmptyObject = Record<string, never>;

  type AnyArgsFunction = (...args: any) => void;

  type PromiseResult<T extends Promise> = ReturnType<T> extends Promise<infer R> ? R : never;
}

export default global;
