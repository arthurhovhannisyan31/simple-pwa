import { type StoreManager } from "./store-manager";
import { CACHE_VERSION } from "../../constants";

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
      if (this.storeManager.hasSpace(this.assetsSize)) {
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

  delete = async (key: string): Promise<void> => {
    await caches.delete(key);
  };

  deleteOldCaches = async (): Promise<void> => {
    const cacheKeepList = [CACHE_VERSION];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(this.delete));
  };

  deleteOldResources = async (): Promise<void> => {
    const versionedCache = await caches.open(CACHE_VERSION);
    const versionedCacheKeys = await versionedCache.keys();

    // TODO apply better resource matching
    // const p = new URLPattern({
    //   pathname: '/foo/:image.jpg',
    //   baseURL: 'https://example.com',
    // });
    //
    // const result = p.exec('https://example.com/foo/cat.jpg');

    versionedCacheKeys.forEach((request) => {
      if (!this.assets.includes(request.url.replace(location.origin, ""))) {
        versionedCache.delete(request);
      }
    });
  };
}
