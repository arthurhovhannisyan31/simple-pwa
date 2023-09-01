import { SHOW_NOTIFICATION } from "actions/actions";
import { createAction } from "actions/createAction";
import { type SWManager } from "service-workers/sw-manager";

import icon from "../public/favicon.ico";

const notificationOptions: NotificationOptions = {
  body: "Notification body",
  data: "Notification data",
  dir: "rtl",
  icon,
  vibrate: [1, 1, 3, 1],
  actions: [
    {
      action: "yes",
      icon,
      title: "yes",
    },
    {
      action: "no",
      icon,
      title: "no",
    },
  ],
  tag: "hello",
};

export async function notifyMe(serviceWorker: SWManager): Promise<void> {
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    serviceWorker.postMessage(
      createAction(SHOW_NOTIFICATION, notificationOptions),
    );
  } else if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      serviceWorker.postMessage(
        createAction(SHOW_NOTIFICATION, notificationOptions),
      );
    }
  }
}
