import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import React from 'react';
import { Alert } from 'react-daisyui';
import { IAlertMessage } from '../store/AlertStore';

const statusIcons = {
  success: <CheckCircleIcon className="w-6 h-6 stroke-success" />,
  error: <ExclamationCircleIcon className="w-6 h-6 stroke-error" />,
  info: <InformationCircleIcon className="w-6 h-6 stroke-info" />,
  warning: <ExclamationTriangleIcon className="w-6 h-6 stroke-warning" />,
};

interface IProps extends IAlertMessage {
  className?: string;
}

export const AlertMessage: React.FC<IProps> = ({
  status,
  message,
  className,
}) => {
  return (
    <Alert icon={statusIcons[status]} status={status} className={className}>
      <span>{message}</span>
    </Alert>
  );
};
