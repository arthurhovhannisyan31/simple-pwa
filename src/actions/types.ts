export interface Action<T = unknown> {
  type: string
  payload: T
}
