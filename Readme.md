# Simple PWA

### Description
This application shows how a Service Worker `SW` can help improve application loading speed by serving cached bundles from the browser cache [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache).

The core logic here is to serve only specific assets of the application (not html itself).
Here are the steps of building the project:
- Generate assets bundles with `contenthash` as a part of their name
- Generate assets log with their names and bundle size
- Generate SW bundle with imported assets log
- `SW` Estimate available space for all assets
- `SW` Add all assets to browser cache (Cache API)
- `SW` Serve available assets by their name after page reload
- `SW` Cleanup outdated assets from the cache.

In case if any changes will be applied to the project, the name of specific bundle will be changed, and it will be requested by browser (during the html parsing step) by new name.
This way we can ensure that wrong asset will not be served for the new bundle request.
But what about outdated assets?
During the `SW` activation phase the new assets log will be parsed and compared against existing cache. 
All cached resources that are not populated in the new assets log will be deleted to prevent cache congestion.

### Tech stack:
- Typescript
- Webpack

### Suggested readings:
- [web.dev pwa](https://web.dev/learn/pwa/)
- [web.dev serving](https://web.dev/learn/pwa/serving/)
- [MDN Service_Worker_API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Going-Offline-Jeremy-Keith](https://www.amazon.com/Going-Offline-Jeremy-Keith/dp/1937557650)
