import { useState } from 'react';

// Custom hook for file handling in a browser environment
export const useFileHandler = () => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');

  // Reads a file as a Data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    setStatus('Reading file...');
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          // Corrected check for string type
          resolve(result);
          setStatus('File read successfully.');
        } else {
          reject(new Error('Failed to read file as Data URL.'));
        }
      };
      reader.onerror = (event) => {
        setError('Error reading file.');
        reject(event.target?.error);
      };
      reader.readAsDataURL(file); // Read as Data URL
    });
  };
  // Creates a download link from a Data URL or Blob
  const createDownloadLink = (
    data: string | Blob,
    fileName: string,
  ): string => {
    let blob: Blob;
    if (typeof data === 'string') {
      // If it's a Data URL, convert it to Blob
      const byteString = atob(data.split(',')[1]);
      const mimeString = data.split(',')[0].split(':')[1].split(';')[0];
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      blob = new Blob([byteArray], { type: mimeString });
    } else {
      blob = data;
    }

    const link = URL.createObjectURL(blob);
    return `${link}#${fileName}`; // Using `#fileName` to set download name
  };

  const clearStatusAndError = () => {
    setError(null);
    setStatus('');
  };

  // Convert a Data URL to a Blob
  const dataURLToBlob = (dataURL: string): Blob => {
    const base64 = dataURL.split(',')[1]; // Extract base64 data
    const byteString = atob(base64); // Decode base64
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]; // Extract MIME type
    const byteArray = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([byteArray], { type: mimeString }); // Create a Blob from the byte array
  };

  // Convert a Blob to a File
  const blobToFile = (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  };

  return {
    readFileAsDataURL,
    createDownloadLink,
    fileReadingStatus: status,
    fileReadingError: error,
    clearStatusAndError,
    dataURLToBlob,
    blobToFile,
  };
};
