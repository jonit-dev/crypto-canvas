import { makeAutoObservable } from 'mobx';

export type StatusType = 'success' | 'error' | 'info' | 'warning';

export interface IAlertMessage {
  status: StatusType;
  message: string;
}

class AlertStore {
  message: IAlertMessage | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setMessage(message: IAlertMessage) {
    this.message = message;
  }

  clearMessage() {
    this.message = null;
  }

  get hasMessage() {
    return this.message !== null;
  }
}

export const alertStore = new AlertStore();
