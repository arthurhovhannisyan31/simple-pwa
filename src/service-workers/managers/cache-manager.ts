import { type StoreManager } from "./store-manager";
import { CACHE_VERSION } from "../../constants";
import { ASSET_PATH, bytesToMBytes } from "../../helpers";

declare const location: WorkerLocation;

export class CacheManager {
  constructor(
    protected worker: ServiceWorkerGlobalScope,
    protected storeManager: StoreManager,
    protected assets: RequestInfo[],
    protected assetsSize: number,
  ) {}

  init = async (): Promise<void> => this.add(this.assets);

  async add(requests: RequestInfo[]): Promise<void> {
    try {
      const estimation = this.storeManager.getEstimation();
      const sizeMBytes = bytesToMBytes(this.assetsSize);

      if (estimation.quotaMemory > sizeMBytes) {
        const versionedCache = await caches.open(CACHE_VERSION);

        await versionedCache.addAll(requests);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async put(request: RequestInfo, response: Response): Promise<void> {
    const versionedCache = await caches.open(CACHE_VERSION);
    if (!(await versionedCache.match(request))) {
      await versionedCache.put(request, response);
    }
  }

  deleteCache = async (key: string): Promise<void> => {
    await caches.delete(key);
  };

  deleteAllCaches = async (): Promise<void> => {
    const keys = await caches.keys();
    await Promise.all(keys.map(this.deleteCache));
  };

  deleteOldCaches = async (): Promise<void> => {
    const cacheKeepList = [CACHE_VERSION];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(this.deleteCache));
  };

  deleteOldResources = async (): Promise<void> => {
    const versionedCache = await caches.open(CACHE_VERSION);
    const versionedCacheKeys = await versionedCache.keys();

    let replacer = location.origin;

    if (ASSET_PATH === "/") {
      replacer += "/";
    }

    versionedCacheKeys.forEach((request) => {
      if (!this.assets.includes(request.url.replace(replacer, ""))) {
        versionedCache.delete(request);
      }
    });
  };
}
