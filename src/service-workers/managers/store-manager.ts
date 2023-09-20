import { bytesToMBytes } from "helpers";

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
    if (usage !== undefined && quota !== undefined) {
      this.storageState.quotaMemory = bytesToMBytes(quota);
      this.storageState.usedMemory = bytesToMBytes(usage);
      this.storageState.usedSpace = Number((usage / quota).toFixed(4)) * 100;
    }
  };

  getEstimation = (): StorageState => ({
      usedSpace: this.storageState.usedSpace,
      quotaMemory: this.storageState.quotaMemory,
      usedMemory: this.storageState.usedMemory,
    });

  persistData = async (): Promise<boolean | undefined> => {
    if (navigator.storage && navigator.storage.persist) {
      return navigator.storage.persist();
    }
  };

  isPersisted = async (): Promise<boolean> => navigator.storage.persisted();
}
