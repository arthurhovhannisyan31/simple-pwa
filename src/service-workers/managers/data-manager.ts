import { type CacheManager } from "./cache-manager";
import { CACHE_VERSION } from "../../constants";

export class DataManager {
  constructor(
    protected worker: ServiceWorkerGlobalScope,
    protected cacheManager: CacheManager,
  ) {}

  enableNavigationPreload = async (): Promise<void> => {
    if (this.worker.registration.navigationPreload) {
        await this.worker.registration.navigationPreload.enable();
    }
  };

  cacheFirst = async (request: Request): Promise<Response> => {
    const versionedCache = await caches.open(CACHE_VERSION);

    const resMatch = await versionedCache.match(request);
    if (resMatch) {
      return resMatch;
    }

    const res = await fetch(request);

    if (res.status < 400) {
      await versionedCache.put(request, res.clone());
    }

    return res;
  };

  networkFirst = async (request: Request): Promise<Response | undefined> => {
    try {
      let res: Response | undefined = await fetch(request);
      if (res.status < 400) {
        this.cacheManager.put(request, res.clone());
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
      if (request.method === "GET") {
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
            //   await this.cacheManager.putInCache(request, response.clone());
            // }
          }
        }

        return response;
      }

        return await fetch(request);
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
}
