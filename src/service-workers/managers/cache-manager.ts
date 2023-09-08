import { CACHE_VERSION } from "../../constants";

declare const location: WorkerLocation;

export class CacheManager {
  constructor(
    protected worker: ServiceWorkerGlobalScope,
    protected assets: RequestInfo[],
  ) {}

  initCache = async (): Promise<void> => this.addToCache(this.assets);

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
    const versionedCache = await caches.open(CACHE_VERSION);
    const versionedCacheKeys = await versionedCache.keys();

    versionedCacheKeys.forEach((request) => {
      if (!this.assets.includes(request.url.replace(location.origin, ""))) {
        versionedCache.delete(request);
      }
    });
  };
}
