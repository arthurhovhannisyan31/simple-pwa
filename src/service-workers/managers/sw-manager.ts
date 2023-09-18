import { isShowNotificationAction } from "actions/show-notification";
import { type Action } from "actions/types";

export class SWManager {
  container: ServiceWorkerContainer;

  registration: ServiceWorkerRegistration;

  sw: ServiceWorker | null = null;

  protected constructor(swRegistration: ServiceWorkerRegistration) {
    this.container = navigator.serviceWorker;
    this.init();

    this.registration = swRegistration;
    this.registration.onupdatefound = this.onUpdateFound;

    if (this.registration.installing) {
      this.registration.installing.onstatechange = this.onStateChange; // ??
    }

    this.onRegistrationEnd();
  }

  init(): void {
    this.sw = this.container.controller;
    this.container.onmessage = this.onMessage;
    this.container.onmessageerror = this.onMessageError;
    this.container.oncontrollerchange = this.onControllerChange;
  }

  static async register(
    url: string,
    options?: RegistrationOptions,
  ): Promise<SWManager> {
    try {
      const swRegistration = await navigator.serviceWorker.register(url, options);

      return new SWManager(swRegistration);
    } catch (err) {
      throw new Error("Service worker registration failed", {
        cause: err as Error,
      });
    }
  }

  protected onControllerChange: ServiceWorkerContainer["oncontrollerchange"] = (_e) => {
    console.log("SWManager onControllerChange", _e);

    if (navigator.serviceWorker.controller) {
      this.sw = navigator.serviceWorker.controller;
    }
  };

  protected onRegistrationEnd = (): void => {
    // console.log("SWManager onRegistrationEnd");

    this.sw?.postMessage({ type: "REGISTRATION_END", data: "SWManager: Registration end" });
    // this.registration.active?.postMessage("SWManager: Registration end");
  };

  protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"] = (
    _e,
  ): void => {
    if (this.registration.installing) {
      this.sw?.postMessage({ type: "UPDATE" });
      // this.registration.installing.postMessage({ type: "UPDATE" });
    }
    // console.log("SWManager onupdatefound: ", _e);
  };

  protected onStateChange: ServiceWorker["onstatechange"] = (_e) => {
    // console.log("SWManager onstatechange: ", _e);

    // this.sw?.postMessage("SWManager: state change");
    this.registration.active?.postMessage("SWManager: state change");
  };

  protected onMessage: ServiceWorkerContainer["onmessage"] = (_e) => {
    console.log("SWManager onmessage: ", _e);
  };

  protected onMessageError: ServiceWorkerContainer["onmessageerror"] = (_e) => {
    console.log("SWManager onmessagerror", _e);
  };

  postMessage = (action: Action<any>): void => {
    if (isShowNotificationAction(action)) {
      this.registration.showNotification(
        action.payload.body as string,
        action.payload,
      );
    } else {
      this.sw?.postMessage(action);
    }
  };

  unregister(): Promise<boolean> {
    return this.registration.unregister();
  }
}
