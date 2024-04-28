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
      <Dialog open>
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
                onClick={modal.cancel.onClick}
                color={getButtonColor(modal.type)}
              >
                {modal.cancel.text}
              </Button>
            )}
            {modal.confirm && (
              <Button
                onClick={modal.confirm.onClick}
                color={getButtonColor(modal.type)}
              >
                {modal.confirm.text}
              </Button>
            )}
          </form>
        </Modal.Actions>
      </Dialog>
    )
  );
});
