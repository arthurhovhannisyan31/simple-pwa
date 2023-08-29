declare global {
  interface ServiceWorkerRegistration extends ServiceWorkerRegistration {
    navigationPreload: NavigationPreloadManager
  }
}
export default global;
