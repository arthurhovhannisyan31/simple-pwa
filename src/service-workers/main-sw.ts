import { AbstractSW } from "lib/abstract-sw";

import { CacheManager } from "./managers/cache-manager";
import { DataManager } from "./managers/data-manager";
import { NotificationManager } from "./managers/notification-manager";
import { StoreManager } from "./managers/store-manager";
import assetsManifest from "../../assets/assets-manifest.json";
import version from "../../assets/version.json";
import { DISPOSE, LOGOUT } from "../actions/actions";

const resources = Object.values(assetsManifest);
const { size, paths: assetsPaths } = resources.reduce((acc, { size, path }) => {
  acc.paths.push(path);
  acc.size += size;

  return acc;
}, { paths: [] as string[], size: 0 });

console.log("MainSW", version);

declare const location: WorkerLocation;

export class MainSW extends AbstractSW {
  cacheManager: CacheManager;

  storageManager: StoreManager;

  notificationManager: NotificationManager;

  dataManager: DataManager;

  constructor(sw: ServiceWorkerGlobalScope) {
    super(sw);
    this.storageManager = new StoreManager(sw);
    this.cacheManager = new CacheManager(
      sw,
      this.storageManager,
      assetsPaths,
      size,
    );
    this.dataManager = new DataManager(sw, this.cacheManager);
    this.notificationManager = new NotificationManager(sw);

    this.setup(
      this.onInstall,
      this.onActivate,
      this.onFetch,
      this.onMessage,
      this.notificationManager.onPush,
      this.notificationManager.onNotificationClick,
    );
  }

  init = async (): Promise<void> => {
    // await this.notificationManager.initNotifications();
    await this.storageManager.estimateStorage();
    await this.cacheManager.init();
  };

  onInstall: ServiceWorkerGlobalScope["oninstall"] = (_e): void => {
    console.log("MainSW onInstall version", version.version);
    _e.waitUntil(this.init());
    _e.waitUntil(this.skipWaiting());
  };

  onActivate: ServiceWorkerGlobalScope["onactivate"] = (_e): void => {
    console.log("MainSW onActivate version", version.version);
    _e.waitUntil(this.dataManager.enableNavigationPreload());
    _e.waitUntil(this.notificationManager.subscribeToPushNotifications());
    _e.waitUntil(this.cacheManager.deleteOldCaches());
    _e.waitUntil(this.cacheManager.deleteOldResources());
    _e.waitUntil(this.claim());
  };

  onMessage: ServiceWorkerGlobalScope["onmessage"] = async (
    _e,
  ): Promise<void> => {
    const senderId = (_e.source as WindowClient).id;

    console.log("MainSW onMessage ", {
      version: version.version,
      senderId,
      data: _e.data,
    });
    console.log("MainSW onMessage event", _e);

    switch (_e.data.type) {
      case LOGOUT: {
        try {
          const clients = await this.worker.clients?.matchAll() ?? [];
          const restClients = clients.filter((client) => client.id !== senderId);
          restClients.forEach((client) => client.postMessage({
            type: "LOGOUT",
            payload: "Game over",
          }));
        } catch (_err) {
          console.log(_err);
        }
        break;
      }
      case DISPOSE: {
        break;
      }
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

  dispose(): void {
    // clean all caches
  }
}

declare const self: ServiceWorkerGlobalScope;

new MainSW(self as ServiceWorkerGlobalScope);

export default {} as ServiceWorker;
