export abstract class AbstractSW {
  protected abstract onInstall: ServiceWorkerGlobalScope["oninstall"]

  protected abstract onActivate: ServiceWorkerGlobalScope["onactivate"]

  protected abstract onFetch: ServiceWorkerGlobalScope["onfetch"]

  protected abstract onMessage: ServiceWorkerGlobalScope["onmessage"]

  protected constructor(protected worker: ServiceWorkerGlobalScope) {}

  protected init(
    installHandler: ServiceWorkerGlobalScope["oninstall"],
    activateHandler: ServiceWorkerGlobalScope["onactivate"],
    fetchHandler: ServiceWorkerGlobalScope["onfetch"],
    messageHandler: ServiceWorkerGlobalScope["onmessage"],
    pushHandler: ServiceWorkerGlobalScope["onpush"],
    onNotificationClick: ServiceWorkerGlobalScope["onnotificationclick"],
  ): void {
      this.worker.oninstall = installHandler;
      this.worker.onactivate = activateHandler;
      this.worker.onfetch = fetchHandler;
      this.worker.onmessage = messageHandler;
      this.worker.onpush = pushHandler;
      this.worker.onnotificationclick = onNotificationClick;
  }

  protected skipWaiting(): Promise<void> {
    return this.worker.skipWaiting();
  }

  protected claim(): Promise<void> {
    return this.worker.clients.claim();
  }
}
