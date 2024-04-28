import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { observer } from 'mobx-react-lite';
import { Button, Modal } from 'react-daisyui';
import { ModalType, modalStore } from '../store/ModalStore';

export const ModalAlert = observer(() => {
  const { Dialog } = Modal.useDialog();

  const modal = modalStore.getModal();

  const getButtonColor = (type: ModalType) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getIcon = (type: ModalType) => {
    switch (type) {
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 inline-block mr-2" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 inline-block mr-2" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 inline-block mr-2" />;
      default:
        return null;
    }
  };

  return (
    modal && (
      <Dialog open responsive>
        <Modal.Header
          className={`font-bold text-${getButtonColor(modal.type)}`}
        >
          {getIcon(modal.type)}
          {modal.title}
        </Modal.Header>
        <Modal.Body>{modal.message}</Modal.Body>
        <Modal.Actions>
          <form method="dialog">
            {modal.cancel && (
              <Button
                className="mr-4"
                onClick={() => {
                  modal.cancel?.onClick?.();
                  modalStore.clearModal();
                }}
              >
                {modal.cancel.text}
              </Button>
            )}
            {(modal.confirm && (
              <Button onClick={modal.confirm.onClick} color="primary">
                {modal.confirm.text}
              </Button>
            )) ?? (
              <Button onClick={() => modalStore.clearModal()} color="primary">
                Close
              </Button>
            )}
          </form>
        </Modal.Actions>
      </Dialog>
    )
  );
});
