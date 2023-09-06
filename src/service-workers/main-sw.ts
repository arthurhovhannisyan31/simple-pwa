import { AbstractSW } from "lib/abstract-sw";

import { urlBase64ToUint8Array } from "./helpers";
import { type StorageState } from "./types";
import assetsManifest from "../../assets/assets-manifest.json";
import version from "../../assets/version.json";
import favicon from "../../public/favicon.ico";
import { CACHE_VERSION } from "../constants";

const resources = Object.values(assetsManifest);

console.log("MainSW", version);

declare const location: WorkerLocation;

// StorageManager.estimate()

export class MainSW extends AbstractSW {
  /* TODO move to storage manager */
  storageState: StorageState = {
    quotaMemory: 0,
    usedMemory: 0,
    usedSpace: 0,
  };

  // cache manager: init, add, delete
  // storage manager: estimate
  // data manager: fetch, cache, strategies
  // notification manager: show, request
  // push manager: web push

  constructor(sw: ServiceWorkerGlobalScope) {
    super(sw);

    this.init(
      this.onInstall,
      this.onActivate,
      this.onFetch,
      this.onMessage,
      this.onPush,
      this.onNotificationClick,
    );
    this.initNotifications();
  }

  /* General */
  onInstall: ServiceWorkerGlobalScope["oninstall"] = (_e): void => {
    _e.waitUntil(this.initCache());

    this.skipWaiting();
  };

  onActivate: ServiceWorkerGlobalScope["onactivate"] = async (
    _e,
  ): Promise<void> => {
    _e.waitUntil(this.deleteOldCaches());
    _e.waitUntil(this.deleteOldResources());
    _e.waitUntil(this.estimateStorage());
    _e.waitUntil(this.worker.registration.navigationPreload.enable());
    _e.waitUntil(this.subscribeToPushNotifications());

    this.claim();
  };

  onMessage: ServiceWorkerGlobalScope["onmessage"] = async (
    _e,
  ): Promise<void> => {
    // console.log(_e);
    // console.log("MainSW onMessage", _e);
    // switch (_e.data.type) {
    //   case "UPDATE": {
    //     // this.skipWaiting();
    //   }
    // }
    const senderId = (_e.source as WindowClient).id;
    try {
      const clients = await this.worker.clients?.matchAll() ?? [];
      const restClients = clients.filter((client) => client.id !== senderId);
      restClients.forEach((client) => client.postMessage({
        type: "MESSAGE",
        payload: "Hello from SWDecorator",
      }));
    } catch (_err) {
      // console.log(_err);
    }
  };

  /* Cache manager */

  initCache = async (): Promise<void> => this.addToCache(resources);

  async addToCache(requests: RequestInfo[]): Promise<void> {
    const versionedCache = await caches.open(CACHE_VERSION);

    try {
      await versionedCache.addAll(requests);
    } catch (err) {
      console.log(err);
    }
  }

  async putInCache(request: RequestInfo, response: Response): Promise<void> {
    const versionedCache = await caches.open(CACHE_VERSION);
    if (!(await versionedCache.match(request))) {
      await versionedCache.put(request, response);
    }
  }

  deleteCache = async (key: string): Promise<void> => {
    await caches.delete(key);
  };

  deleteOldCaches = async (): Promise<void> => {
    const cacheKeepList = [CACHE_VERSION];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(this.deleteCache));
  };

  deleteOldResources = async (): Promise<void> => {
    // console.log("deleteOldResources");
    const versionedCache = await caches.open(CACHE_VERSION);
    const versionedCacheKeys = await versionedCache.keys();

    versionedCacheKeys.forEach((request) => {
      if (!resources.includes(request.url.replace(location.origin, ""))) {
        versionedCache.delete(request);
      }
    });
  };

  /* Storage manager */

  estimateStorage = async (): Promise<void> => {
    const sm = navigator.storage;
    const { usage, quota } = await sm.estimate();
    if (usage && quota) {
      this.storageState.quotaMemory = Number((quota / (1024 * 1024)).toFixed(2));
      this.storageState.usedMemory = Number((usage / (1024 * 1024)).toFixed(2));
      this.storageState.usedSpace = Number((usage / quota).toFixed(4)) * 100;

      // console.log(`
      //   Storage manager, ${this.storageState.usedSpace}% of quota is used,
      //   total available space: ${this.storageState.quotaMemory}MB,
      //   used space: ${this.storageState.usedMemory}MB
      // `);
    }
  };

  /* Data manager */

  onFetch: ServiceWorkerGlobalScope["onfetch"] = async (
    _e,
  ): Promise<Response | void> => {
    // console.log(e.request.url);

    if (_e.request.url.match(location.origin)) {
      _e.respondWith(
      //  . Cache first
      //  this.cacheFirst(_e.request),
      //  . Network first
      //  this.networkFirst(e.request) as Promise<Response>, // Cache with network fallback
      //  . Cache with network update
      //  this.cacheWithNetworkUpdate(e.request), // Cache with network update
      //  . Cache and network race
      //  this.cacheNetworkRace(_e.request),
      //  5. Preload of request
       this.cacheWithPreload(
         _e.request,
         _e.preloadResponse,
       ),
      );
    }
  };

  cacheFirst = async (request: Request): Promise<Response> => {
    const versionedCache = await caches.open(CACHE_VERSION);

    const resMatch = await versionedCache.match(request);
    if (resMatch) {
      return resMatch;
    }

    const res = await fetch(request);

    // if (res.status < 400) {
    //   await versionedCache.put(request, res.clone());
    // }

    return res;
  };

  networkFirst = async (request: Request): Promise<Response | undefined> => {
    try {
      let res: Response | undefined = await fetch(request);
      if (res.status < 400) {
        this.putInCache(request, res.clone());
      } else {
        res = await caches.match(request);
      }

      return res;
    } catch (err) {
      return caches.match(request);
    }
  };

  cacheWithNetworkUpdate = async (request: Request): Promise<Response> => {
    try {
      const versionedCache = await caches.open(CACHE_VERSION);
      const cacheRes = await caches.match(request);

      const fetchResource = async (): Promise<Response> => {
        const fetchRes = await fetch(request);
        if (fetchRes.status < 400) {
          await versionedCache.put(request, fetchRes.clone());
        }

        return fetchRes;
      };

      return cacheRes || await fetchResource();
    } catch (err: unknown) {
      throw new Error("Unable to fetch request", {
        cause: err as Error,
      });
    }
  };

  cacheWithPreload = async (
    request: FetchEvent["request"],
    preloadedResponse: FetchEvent["preloadResponse"],
  ): Promise<Response> => {
    try {
      const versionedCache = await caches.open(CACHE_VERSION);
      const responseFromCache = await versionedCache.match(request);

      if (responseFromCache) {
        return responseFromCache;
      }

      let response: Response = await preloadedResponse;
      if (!response || response.status >= 400) {
        const fetchResponse = await fetch(request);

        if (fetchResponse.status < 400) {
          response = fetchResponse;

          // if (supportedFiles.includes(request.url)) {
          //   await versionedCache.put(request, response.clone());
          //   await this.putInCache(request, response.clone());
          // }
        }
      }

      return response;
    } catch (err: unknown) {
      throw new Error("Unable to fetch request", {
        cause: err as Error,
      });
    }
  };

  cacheNetworkRace = async (request: Request): Promise<Response> => {
    let rejectCount = 0;

    const getNetwork = async (): Promise<Response | void> => {
      const res = await fetch(request);
      if (res.status >= 400) {
        rejectCount++;
        throw new Error("Failed to fetch resource");
      }

      return res;
    };
    const getCache = async (): Promise<Response | void> => {
      const res = await caches.match(request);
      if (!res) {
        rejectCount++;
        throw new Error("Failed to fetch resource");
      }

      return res;
    };

    const res = await Promise.any([
      getNetwork(),
      getCache(),
    ]);

    if (rejectCount === 2) {
      throw new Error("Failed to fetch resource");
    }

    return res as Response;
  };

  /* Notification manager */

  onNotificationClick: ServiceWorkerGlobalScope["onnotificationclick"] = (
    _e,
  ) => {
    // console.log("MainSW onNotificationClick", _e);
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

  /* Push manager */

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

        // console.log(JSON.parse(JSON.stringify(subscription, null, 2)));
      }
    } catch (_err) {
      console.log(_err);
    }
  };
}

declare const self: ServiceWorkerGlobalScope;

new MainSW(self as ServiceWorkerGlobalScope);

export default {} as ServiceWorker;
