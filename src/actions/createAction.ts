import { type Action, type SimpleAction } from "./types";

export const createAction = <T>(type: string, payload: T): Action<T> => ({
  type,
  payload,
});

export const createSimpleAction = (type: string): SimpleAction => ({
  type,
  payload: undefined,
});
