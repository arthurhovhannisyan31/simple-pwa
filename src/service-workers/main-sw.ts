import { AbstractSW } from "lib/abstract-sw";

import { CacheManager } from "./managers/cache-manager";
import { DataManager } from "./managers/data-manager";
import { NotificationManager } from "./managers/notification-manager";
import { StoreManager } from "./managers/store-manager";
import assetsManifest from "../../assets/assets-manifest.json";
import version from "../../assets/version.json";
import {
CONNECT_CLIENTS,
DISPOSE,
LOGOUT,
MESSAGE_PORT,
UNREGISTER_SW,
} from "../actions/actions";
import { createSimpleAction } from "../actions/createAction";

const resources = Object.values(assetsManifest);
const { size, paths: assetsPaths } = resources.reduce((acc, { size, path }) => {
  acc.paths.push(path);
  acc.size += size;

  return acc;
}, { paths: [] as string[], size: 0 });

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
    // _e.waitUntil(this.notificationManager.subscribeToPushNotifications());
    _e.waitUntil(this.cacheManager.deleteOldCaches());
    _e.waitUntil(this.cacheManager.deleteOldResources());
    _e.waitUntil(this.claim());
  };

  getClients = async (senderId = ""): Promise<Client[]> => {
    const clients = await this.worker.clients?.matchAll({
      includeUncontrolled: true,
    }) ?? [];

    return clients.filter((client) => client.id !== senderId);
  };

  onMessage: ServiceWorkerGlobalScope["onmessage"] = async (
    _e,
  ): Promise<void> => {
    const senderId = (_e.source as WindowClient).id;

    console.log("MainSW onMessage data", _e.data);

    switch (_e.data.type) {
      case LOGOUT: {
        try {
          const clients = await this.getClients(senderId);
          clients.forEach((client) => client.postMessage({
            type: "LOGOUT",
            payload: "Game over",
          }));
        } catch (_err) {
          console.error(_err);
        }
        break;
      }
      case DISPOSE: {
        await this.cacheManager.deleteAllCaches();
        break;
      }
      case CONNECT_CLIENTS: {
        try {
          const clients = await this.getClients(senderId);

          await Promise.all(
            clients.map((client) => {
              const mc = new MessageChannel();
              mc.port1.onmessage = this.onMessagePort;

              return client.postMessage(
                createSimpleAction(MESSAGE_PORT),
                [mc.port2],
              );
            }),
          );
        } catch (err) {
          console.error(err);
        }

        break;
      }
      case UNREGISTER_SW: {
        await this.dispose();
        break;
      }
    }
  };

  onMessagePort: MessagePort["onmessage"] = (msg) => {
    // TODO redirect or bind to this.onMessage
    console.log("MainSW onMessagePort", msg);
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

  async dispose(): Promise<void> {
    await this.cacheManager.deleteAllCaches();
  }
}

declare const self: ServiceWorkerGlobalScope;

new MainSW(self as ServiceWorkerGlobalScope);

export default {} as ServiceWorker;
