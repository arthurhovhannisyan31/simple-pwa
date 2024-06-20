import type { StoreManager } from "./store-manager";
import type { AssetsManifest } from "../types";

import { CACHE_VERSION } from "../../constants";
import { bytesToMBytes } from "../../helpers";
import { getAssetsConfig } from "../helpers";

export class CacheManager {
  assets: RequestInfo[] = [];

  assetsSize = 0; // MB

  constructor(
    protected worker: ServiceWorkerGlobalScope,
    protected storeManager: StoreManager,
  ) {}

  init = async (assetsManifest: AssetsManifest): Promise<void> => {
    const { size, paths } = getAssetsConfig(assetsManifest);

    this.assets = paths;
    this.assetsSize = bytesToMBytes(size);
  };

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
    try {
      await this.storeManager.estimate();
      const estimation = this.storeManager.getEstimation();
      const responseSize = bytesToMBytes(Number(response.headers.get("content-length") ?? 0));

      if (estimation.quotaMemory > responseSize) {
        const versionedCache = await caches.open(CACHE_VERSION);

        await versionedCache.put(request, response);
      }
    } catch (err) {
      console.log(err);
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
    const removedAssets: string[] = [];

    versionedCacheKeys.forEach((request) => {
      if (!this.assets.some((asset) => request.url.includes(asset as string))) {
        removedAssets.push(request.url);

        versionedCache.delete(request);
      }
    });

    if (removedAssets.length) {
      console.group("Debug: Remove outdated assets from cache");
      removedAssets.forEach((el) => console.log(el));
      console.groupEnd();
    }
  };
}
