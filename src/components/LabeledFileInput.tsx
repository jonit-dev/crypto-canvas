import React from 'react';
import { FileInput } from 'react-daisyui';

interface IProps {
  labelText: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept: string;
  className?: string;
  placeholder?: string;
}

const FileInputWithLabel: React.FC<IProps> = ({
  labelText,
  onChange,
  accept,
  className,
  placeholder,
}) => (
  <div className={`form-control w-full max-w-xs ${className}`}>
    <label className="label">
      <span className="label-text">{labelText}</span>
    </label>
    <FileInput
      onChange={onChange}
      className="mb-4"
      accept={accept}
      placeholder={placeholder}
    />
  </div>
);

export default FileInputWithLabel;
