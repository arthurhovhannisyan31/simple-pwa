import { isShowNotificationAction } from "actions/show-notification";
import { type Action } from "actions/types";

import {
CONNECT_CLIENT,
REGISTRATION_END,
SHOW_NOTIFICATION,
UNREGISTER_SW,
UPDATE_FOUND,
} from "../../actions/actions";
import { createAction, createSimpleAction } from "../../actions/createAction";

export class SWManager {
  container?: ServiceWorkerContainer;

  registration?: ServiceWorkerRegistration;

  sw: ServiceWorker | null = null;

  protected constructor(swRegistration: ServiceWorkerRegistration) {
    this.initContainer();
    this.initRegistration(swRegistration);
    this.sw = this.container?.controller ?? null;
    this.onRegistrationEnd();
  }

  initContainer(): void {
    this.container = navigator.serviceWorker;
    this.container.onmessage = this.onMessage;
    this.container.onmessageerror = this.onMessageError;
    this.container.oncontrollerchange = this.onControllerChange;
  }

  initRegistration(swRegistration: ServiceWorkerRegistration): void {
    this.registration = swRegistration;
    this.registration.onupdatefound = this.onUpdateFound;

    if (this.registration.installing) {
      this.registration.installing.onstatechange = this.onStateChange;
    }
  }

  static async register(
    url: string,
    options?: RegistrationOptions,
  ): Promise<SWManager> {
    try {
      let swRegistration: ServiceWorkerRegistration | undefined;
      swRegistration = await navigator.serviceWorker?.getRegistration(url);

      if (swRegistration) {
        await swRegistration.update();
      } else {
        swRegistration = await navigator.serviceWorker.register(url, options);
      }

      return new SWManager(swRegistration);
    } catch (err) {
      throw new Error("Service worker registration failed", {
        cause: err as Error,
      });
    }
  }

  protected onControllerChange: ServiceWorkerContainer["oncontrollerchange"] = (_e) => {
    if (navigator.serviceWorker.controller) {
      this.sw = navigator.serviceWorker.controller;

      if (this.container) {
        this.container.onmessage = this.onMessage;
      }
    }
  };

  protected onRegistrationEnd = (): void => {
    this.sw = this.registration?.active ?? null;
    this.postMessage(createAction(REGISTRATION_END, "SWManager: Registration end"));
    this.postMessage(createSimpleAction(CONNECT_CLIENT));
  };

  protected onUpdateFound: ServiceWorkerRegistration["onupdatefound"] = (
    _e,
  ): void => {
    this.postMessage(createSimpleAction(UPDATE_FOUND));
  };

  protected onStateChange: ServiceWorker["onstatechange"] = (_e) => {
    this.sw = this.registration?.active ?? null;
    this.postMessage(createSimpleAction("SWManager: state change"));
  };

  protected onMessage: ServiceWorkerContainer["onmessage"] = (_e) => {};

  protected onMessageError: ServiceWorkerContainer["onmessageerror"] = (_e) => {};

  postMessage = async (action: Action<any>): Promise<void> => {
    switch (action.type) {
      case SHOW_NOTIFICATION: {
        if (isShowNotificationAction(action)) {
          this.registration?.showNotification(
            action.payload.body as string,
            action.payload,
          );
        }
        break;
      }
      case UNREGISTER_SW: {
        this.sw?.postMessage(action);
        await this.#unregister();
        break;
      }
      default: {
        this.sw?.postMessage(action);
        break;
      }
    }
  };

  #unregister(): Promise<boolean> | undefined {
    return this.registration?.unregister();
  }

  static async unregister(url: string): Promise<void> {
    const swRegistration = await navigator.serviceWorker?.getRegistration(url);

    if (swRegistration) {
      await swRegistration.unregister();
    }
  }
}
