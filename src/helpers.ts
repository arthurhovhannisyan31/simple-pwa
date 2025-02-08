import {
CONNECT_CLIENTS,
LOGOUT,
SHOW_NOTIFICATION,
UNREGISTER_SW,
} from "actions/actions";
import { createAction, createSimpleAction } from "actions/createAction";
import { type SWManager } from "service-workers/managers/sw-manager";

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

export function logout(serviceWorker: SWManager): void {
  serviceWorker.postMessage(
    createSimpleAction(LOGOUT),
  );
}

export function connectClients(serviceWorker: SWManager): void {
  serviceWorker.postMessage(
    createSimpleAction(CONNECT_CLIENTS),
  );
}

export function unregisterSW(serviceWorker: SWManager): void {
  serviceWorker.postMessage(
    createSimpleAction(UNREGISTER_SW),
  );
}

export const bytesToMBytes = (val: number): number => Number((val / (1024 * 1024)).toFixed(2));
