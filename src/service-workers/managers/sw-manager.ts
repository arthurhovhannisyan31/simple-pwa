import { isShowNotificationAction } from "actions/show-notification";
import { type Action } from "actions/types";

import { SHOW_NOTIFICATION, UNREGISTER_SW } from "../../actions/actions";
import { createSimpleAction } from "../../actions/createAction";

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

      // let swRegistration;
      // swRegistration = await navigator.serviceWorker.getRegistration(url);
      //
      // if (!swRegistration || !swRegistration.active) {
      //   swRegistration = await navigator.serviceWorker.register(url, options);
      // } else {
      //   await swRegistration.update();
      // }

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
    this.sw = this.registration.active;
    this.sw?.postMessage({ type: "REGISTRATION_END", data: "SWManager: Registration end" });
  };

  protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"] = (
    _e,
  ): void => {
    this.sw?.postMessage(createSimpleAction("UPDATE_FOUND"));
  };

  protected onStateChange: ServiceWorker["onstatechange"] = (_e) => {
    this.sw = this.registration.active;
    this.sw?.postMessage(createSimpleAction("SWManager: state change"));
  };

  protected onMessage: ServiceWorkerContainer["onmessage"] = (_e) => {
    console.log("SWManager onmessage: ", _e);
    console.log("SWManager onmessage: ", _e.source);
  };

  protected onMessageError: ServiceWorkerContainer["onmessageerror"] = (_e) => {
    console.log("SWManager onmessagerror", _e);
  };

  postMessage = async (action: Action<any>): Promise<void> => {
    switch (action.type) {
      case SHOW_NOTIFICATION: {
        if (isShowNotificationAction(action)) {
          this.registration.showNotification(
            action.payload.body as string,
            action.payload,
          );
        }
        break;
      }
      case UNREGISTER_SW: {
        this.sw?.postMessage(action);
        await this.unregister();
        break;
      }
      default: {
        this.sw?.postMessage(action);
        break;
      }
    }
  };

  unregister(): Promise<boolean> {
    return this.registration.unregister();
  }
}
