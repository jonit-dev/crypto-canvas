import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import React from 'react';
import { Alert } from 'react-daisyui';
import { IAlertMessage } from '../store/AlertStore';

const statusIcons = {
  success: <CheckCircleIcon className="w-6 h-6 stroke-success" />,
  error: <ExclamationCircleIcon className="w-6 h-6 stroke-error" />,
  info: <InformationCircleIcon className="w-6 h-6 stroke-info" />,
};

export const AlertMessage: React.FC<IAlertMessage> = ({ status, message }) => {
  return (
    <Alert icon={statusIcons[status]} status={status}>
      <span>{message}</span>
    </Alert>
  );
};
