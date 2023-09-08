import { type StorageState } from "../types";

export class StoreManager {
  storageState: StorageState = {
    quotaMemory: 0,
    usedMemory: 0,
    usedSpace: 0,
  };

  constructor(protected worker: ServiceWorkerGlobalScope) {}

  estimateStorage = async (): Promise<void> => {
    const sm = navigator.storage;
    const { usage, quota } = await sm.estimate();
    if (usage && quota) {
      this.storageState.quotaMemory = Number((quota / (1024 * 1024)).toFixed(2));
      this.storageState.usedMemory = Number((usage / (1024 * 1024)).toFixed(2));
      this.storageState.usedSpace = Number((usage / quota).toFixed(4)) * 100;
    }
  };

  getEstimation = (): StorageState => ({
      usedSpace: this.storageState.usedSpace,
      quotaMemory: this.storageState.quotaMemory,
      usedMemory: this.storageState.usedMemory,
    });
}
