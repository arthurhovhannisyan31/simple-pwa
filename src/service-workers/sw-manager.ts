import { isShowNotificationAction } from "actions/show-notification";
import { type Action } from "actions/types";

export class SWManager {
  container: ServiceWorkerContainer;

  registration: ServiceWorkerRegistration;

  protected constructor(sw: ServiceWorkerRegistration) {
    this.container = navigator.serviceWorker;
    this.container.onmessage = this.onMessage;

    this.registration = sw;
    this.registration.onupdatefound = this.onUpdateFound;

    if (this.registration.installing) {
      this.registration.installing.onstatechange = this.onStateChange;
    }

    this.onRegistrationEnd();
  }

  static async register(
    url: string,
    options?: RegistrationOptions,
  ): Promise<SWManager> {
    try {
      const sw = await navigator.serviceWorker.register(url, options);

      return new SWManager(sw);
    } catch (err) {
      throw new Error("Service worker registration failed", {
        cause: err as Error,
      });
    }
  }

  protected onRegistrationEnd = (): void => {
    // console.log("SWManager onRegistrationEnd");

    this.registration.active?.postMessage("SWManager: Registration end");
  };

  protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"] = (
    _e,
  ): void => {
    if (this.registration.installing) {
      this.registration.installing.postMessage({ type: "UPDATE" });
    }
    // console.log("SWManager onupdatefound: ", _e);
  };

  protected onStateChange: ServiceWorker["onstatechange"] = (_e) => {
    // console.log("SWManager onstatechange: ", _e);

    this.registration.active?.postMessage("SWManager: state change");
  };

  protected onMessage: ServiceWorkerContainer["onmessage"] = (_e) => {
    // console.log("SWManager onmessage: ", e);
  };

  postMessage = (action: Action<any>): void => {
    if (isShowNotificationAction(action)) {
      // this.registration.showNotification(
      //   action.payload.body as string,
      //   action.payload,
      // );
    }
  };

  unregister(): void {
    this.registration.unregister();
  }
}
