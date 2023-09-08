import { AbstractSW } from "lib/abstract-sw";

import { CacheManager } from "./managers/cache-manager";
import { DataManager } from "./managers/data-manager";
import { NotificationManager } from "./managers/notification-manager";
import { StoreManager } from "./managers/store-manager";
import assetsManifest from "../../assets/assets-manifest.json";
import version from "../../assets/version.json";

const resources = Object.values(assetsManifest);

console.log("MainSW", version);

declare const location: WorkerLocation;

// StorageManager.estimate()

export class MainSW extends AbstractSW {
  cacheManager: CacheManager;

  storageManager: StoreManager;

  notificationManager: NotificationManager;

  dataManager: DataManager;

  constructor(sw: ServiceWorkerGlobalScope) {
    super(sw);
    this.cacheManager = new CacheManager(sw, resources);
    this.storageManager = new StoreManager(sw);
    this.notificationManager = new NotificationManager(sw);
    this.dataManager = new DataManager(sw, this.cacheManager);

    this.init(
      this.onInstall,
      this.onActivate,
      this.onFetch,
      this.onMessage,
      this.notificationManager.onPush,
      this.notificationManager.onNotificationClick,
    );
    this.notificationManager.initNotifications();
  }

  /* General */
  onInstall: ServiceWorkerGlobalScope["oninstall"] = (_e): void => {
    _e.waitUntil(this.cacheManager.initCache());

    this.skipWaiting();
  };

  onActivate: ServiceWorkerGlobalScope["onactivate"] = async (
    _e,
  ): Promise<void> => {
    _e.waitUntil(this.worker.registration.navigationPreload.enable());
    _e.waitUntil(this.notificationManager.subscribeToPushNotifications());
    _e.waitUntil(this.cacheManager.deleteOldCaches());
    _e.waitUntil(this.cacheManager.deleteOldResources());
    _e.waitUntil(this.storageManager.estimateStorage());

    this.claim();
  };

  onMessage: ServiceWorkerGlobalScope["onmessage"] = async (
    _e,
  ): Promise<void> => {
    const senderId = (_e.source as WindowClient).id;
    try {
      const clients = await this.worker.clients?.matchAll() ?? [];
      const restClients = clients.filter((client) => client.id !== senderId);
      restClients.forEach((client) => client.postMessage({
        type: "MESSAGE",
        payload: "Hello from MainSW",
      }));
    } catch (_err) {
      console.log(_err);
    }
  };

  onFetch: ServiceWorkerGlobalScope["onfetch"] = async (
    _e,
  ): Promise<Response | void> => {
    if (_e.request.url.match(location.origin)) {
      _e.respondWith(
        this.dataManager.cacheWithPreload(
          _e.request,
          _e.preloadResponse,
        ),
      );
    }
  };
}

declare const self: ServiceWorkerGlobalScope;

new MainSW(self as ServiceWorkerGlobalScope);

export default {} as ServiceWorker;
