import { SHOW_NOTIFICATION } from "./actions";
import { type Action } from "./types";

type ShowNotificationAction = Action<NotificationOptions>

export function isShowNotificationAction(
  action: Action,
): action is ShowNotificationAction {
  return action.type === SHOW_NOTIFICATION;
}
