import * as CryptoJS from 'crypto-js';
import { useState } from 'react';

import PBKDF2 from 'crypto-js/pbkdf2';

const ENCRYPTION_KEY_PIXEL_KEY_DELIMITER = '|';

export const useGenerateEncryptionKey = () => {
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [pixelKey, setPixelKey] = useState<string | null>(null);

  const generateKey = (password: string) => {
    const saltBytes = new Uint8Array(16);
    window.crypto.getRandomValues(saltBytes);
    const salt = CryptoJS.lib.WordArray.create(saltBytes);

    const encryptionKeyBuffer = PBKDF2(password, salt, {
      keySize: 64 / 4,
      iterations: 10000,
    });
    const pixelKeyBuffer = PBKDF2(password, salt, {
      keySize: 64 / 4,
      iterations: 10000,
    });

    const generatedEncryptionKey =
      CryptoJS.enc.Base64.stringify(encryptionKeyBuffer);
    const generatedPixelKey = CryptoJS.enc.Base64.stringify(pixelKeyBuffer);

    setEncryptionKey(generatedEncryptionKey);
    setPixelKey(generatedPixelKey);
  };

  const downloadKey = (password: string) => {
    if (!encryptionKey || !pixelKey) {
      console.error('Keys are not generated.');
      return;
    }

    const keyData = `${encryptionKey}${ENCRYPTION_KEY_PIXEL_KEY_DELIMITER}${pixelKey}`;
    const encryptedKeyData = CryptoJS.AES.encrypt(keyData, password).toString();

    const keyBlob = new Blob([encryptedKeyData], { type: 'text/plain' });
    const url = URL.createObjectURL(keyBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'encryption-key.key';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const extractKeys = (
    file: File,
    password: string,
  ): Promise<{ encryptionKey: string; pixelKey: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result?.toString();
        if (result) {
          try {
            const encryptedKeyData = result;
            const keyData = CryptoJS.AES.decrypt(
              encryptedKeyData,
              password,
            ).toString(CryptoJS.enc.Utf8);
            const [encryptionKey, pixelKey] = keyData.split(
              ENCRYPTION_KEY_PIXEL_KEY_DELIMITER,
            );
            if (!encryptionKey || !pixelKey) {
              reject(new Error('File does not contain both keys.'));
            } else {
              resolve({ encryptionKey, pixelKey });
            }
          } catch (error) {
            console.error('Error decrypting key data:', error);
            reject(new Error('Failed to decrypt key data.'));
          }
        } else {
          reject(new Error('Failed to read file content.'));
        }
      };

      reader.onerror = (error) => {
        console.error('File reading error:', error);
        reject(new Error('Failed to read file content.'));
      };

      reader.readAsText(file);
    });
  };

  return { generateKey, downloadKey, extractKeys, encryptionKey, pixelKey };
};
