import { makeAutoObservable } from 'mobx';

export type ModalType = 'default' | 'success' | 'error' | 'info' | 'warning';

export interface IModal {
  type: ModalType;
  title: string;
  message: string;
  confirm?: {
    text: string;
    onClick: () => void;
  };
  cancel?: {
    text: string;
    onClick: () => void;
  };
}

class ModalStore {
  modal: IModal | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setModal(modal: IModal) {
    this.modal = modal;
  }

  clearModal() {
    this.modal = null;
  }

  getModal() {
    return this.modal;
  }
}

export const modalStore = new ModalStore();
