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
      this.storageState.quotaMemory = this.bytesToMBytes(quota);
      this.storageState.usedMemory = this.bytesToMBytes(usage);
      this.storageState.usedSpace = Number((usage / quota).toFixed(4)) * 100;
    }
  };

  getEstimation = (): StorageState => ({
      usedSpace: this.storageState.usedSpace,
      quotaMemory: this.storageState.quotaMemory,
      usedMemory: this.storageState.usedMemory,
    });

  hasSpace = (sizeBytes: number): boolean => {
    const sizeMBytes = this.bytesToMBytes(sizeBytes);

    return this.storageState.quotaMemory > sizeMBytes;
  };

  bytesToMBytes = (val: number): number => Number((val / (1024 * 1024)).toFixed(2));

  // TODO observe
  persistData = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const result = await navigator.storage.persist();
      console.log(`Data persisted: ${result}`);
    }
  };
}
