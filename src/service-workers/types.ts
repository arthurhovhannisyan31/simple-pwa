export interface StorageState {
  quotaMemory: number,
  usedMemory: number,
  usedSpace: number,
}

export interface AssetsConfig {
  paths: string[],
  size: number
}

export interface AssetsManifest {
  key: string,
  value: Pick<AssetsConfig, "size"> & {
    path: string,
  },
}
