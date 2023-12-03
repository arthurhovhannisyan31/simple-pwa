import favicon from "../../../public/favicon.ico";
import { urlBase64ToUint8Array } from "../helpers";

export class NotificationManager {
  constructor(protected worker: ServiceWorkerGlobalScope) {}

  onNotificationClick: ServiceWorkerGlobalScope["onnotificationclick"] = async (
    _e,
  ): Promise<void> => {
    const clients = await this.worker.clients.matchAll();
    if (clients.length) {
      // TODO check event source id to focus on sender client
      (clients[0] as WindowClient).focus();
    }
    _e.notification.close();
  };

  initNotifications = async (): Promise<void> => {
    // console.log("Notification.permission", Notification.permission);

    if (Notification.permission === "granted") {
      if (this.worker?.registration?.active) {
        await this.worker.registration.showNotification("Registration notification from main-sw", {
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
    console.log("MainSW onPush", _e);
    console.log(_e.data?.text());
    try {
      await this.worker.registration.showNotification(
        `${_e.data?.text()}`,
      );
    } catch (err) {
      console.log(err);
    }
  };

  subscribeToPushNotifications = async (): Promise<void> => {
    const publicKey = "BMRPTBGMgOH2MoyJP5uouq7Weq-FjTQxGixWuUFrAAEMOMq0V8mlQ11oKkEAorkOu7r8dB0JcgvB5neAvFrnogI";

    try {
      if (this.worker.registration) {
        let subscription = await this.worker.registration.pushManager.getSubscription();
        console.log("subscription0", JSON.stringify(subscription));

        if (!subscription) {
          const applicationServerKey = urlBase64ToUint8Array(publicKey);
          console.log("applicationServerKey", applicationServerKey);

          subscription = await this.worker.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
          console.log("subscription1", JSON.stringify(subscription));
        }
      }
    } catch (_err) {
      console.log(_err);
    }
  };
}
