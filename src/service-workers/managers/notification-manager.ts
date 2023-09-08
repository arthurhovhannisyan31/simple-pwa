import favicon from "../../../public/favicon.ico";
import { urlBase64ToUint8Array } from "../helpers";

export class NotificationManager {
  constructor(protected worker: ServiceWorkerGlobalScope) {}

  onNotificationClick: ServiceWorkerGlobalScope["onnotificationclick"] = (
    _e,
  ) => {
    _e.notification.close();
  };

  initNotifications = async (): Promise<void> => {
    // console.log("Notification.permission", Notification.permission);

    if (Notification.permission === "granted") {
      if (this.worker?.registration?.active) {
        await this.worker.registration.showNotification("Registraction notification from main-sw", {
          body: "Notification body",
          icon: favicon,
          tag: "init",
        });
      }
    } else {
      Notification.requestPermission?.(async (permission) => {
        if (permission === "granted") {
          if (this.worker?.registration?.active) {
            await this.worker?.registration.showNotification(
              "A notification from main-sw after a granted permission",
            );
          }
        }
      });
    }
  };

  onPush: ServiceWorkerGlobalScope["onpush"] = async (_e) => {
    // console.log("MainSW onPush", _e);
    try {
      await this.worker.registration.showNotification(
        "A notification from main-sw",
      );
    } catch (err) {
      console.log(err);
    }
  };

  subscribeToPushNotifications = async (): Promise<void> => {
    const publicKey = "BB7ilDNWfRseWXJK0uhFP0BRw_s2aA-c_b8rjzltQl6gmIX1yqj5ssur823CBIuPfivE49uwAtJTc0WMLhigvo8";

    try {
      if (this.worker.registration) {
        let subscription = await this.worker.registration.pushManager.getSubscription();

        if (!subscription) {
          const applicationServerKey = urlBase64ToUint8Array(publicKey);

          subscription = await this.worker.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }
      }
    } catch (_err) {
      console.log(_err);
    }
  };
}
