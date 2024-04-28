import { makeAutoObservable } from 'mobx';

export type StatusType = 'success' | 'error' | 'info';

export interface IEncryptionKeys {
  encryptionKey: string; //base64-encoded key
  pixelKey: string; // base64-encoded key
}

class EncryptionKeysStore {
  encryptionKeys: IEncryptionKeys | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setEncryptionKeys(encryptionKeys: IEncryptionKeys) {
    this.encryptionKeys = encryptionKeys;
  }

  clearEncryptionKeys() {
    this.encryptionKeys = null;
  }

  get hasEncryptionKeys() {
    return (
      this.encryptionKeys !== null &&
      this.encryptionKeys.encryptionKey !== null &&
      this.encryptionKeys.pixelKey !== null
    );
  }

  getEncryptionKey() {
    return this.encryptionKeys?.encryptionKey;
  }

  getPixelKey() {
    return this.encryptionKeys?.pixelKey;
  }
}

export const encryptionKeysStore = new EncryptionKeysStore();
