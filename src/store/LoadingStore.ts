import { makeAutoObservable } from 'mobx';

class LoadingStore {
  isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }
}

export const loadingStore = new LoadingStore();
