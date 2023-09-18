export interface Action<T = unknown> {
  type: string
  payload: T
}

export type SimpleAction = Action<undefined>
