// Web-Push
// Public base64 to Uint
import type { AssetsConfig, AssetsManifest } from "./types";

export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};
export const getAssetsConfig = (assetsManifest: AssetsManifest): AssetsConfig => {
  const resources = Object.values(assetsManifest);

  return resources.reduce((acc, { size, path }) => {
    acc.paths.push(path);
    acc.size += size;

    return acc;
  }, { paths: [] as string[], size: 0 });
};
