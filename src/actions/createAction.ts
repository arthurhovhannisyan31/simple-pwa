import { type Action } from "./types";

export const createAction = <T>(type: string, payload: T): Action<T> => ({
  type,
  payload,
});
