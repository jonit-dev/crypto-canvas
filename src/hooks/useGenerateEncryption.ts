import { useState } from 'react';

export const useGenerateEncryptionKey = () => {
  // Internal state to store encryption and pixel keys
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);
  const [pixelKey, setPixelKey] = useState<Uint8Array | null>(null);

  // Function to generate new keys
  const generateKey = () => {
    const newEncryptionKey = crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
    const newPixelKey = crypto.getRandomValues(new Uint8Array(16)); // 128-bit key for pixel sequence
    setEncryptionKey(newEncryptionKey);
    setPixelKey(newPixelKey);
  };

  // Function to download generated keys
  const downloadKey = () => {
    if (!encryptionKey || !pixelKey) return;

    const keyData = `${Array.from(encryptionKey)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')}\n${Array.from(pixelKey)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')}`;

    const keyBlob = new Blob([keyData], { type: 'text/plain' });
    const url = URL.createObjectURL(keyBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'encryption-key.key';
    document.body.appendChild(downloadLink);
    downloadLink.click(); // Trigger download
    document.body.removeChild(downloadLink);
  };

  // Function to extract keys from a given file
  const extractKeys = (
    file: File,
  ): Promise<{ encryptionKey: string; pixelKey: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result?.toString();
        if (result) {
          const lines = result.split('\n');
          if (lines.length < 2) {
            reject(new Error('File does not contain both keys.'));
          } else {
            // Convert hexadecimal to base64
            const hexToBase64 = (hex: string): string => {
              return btoa(
                String.fromCharCode(
                  ...(hex.match(/.{1,2}/g)?.map((h) => parseInt(h, 16)) || []),
                ),
              );
            };

            const encryptionKey = hexToBase64(lines[0]); // Base64 for crypto-js
            const pixelKey = hexToBase64(lines[1]); // Base64 for easier handling

            resolve({ encryptionKey, pixelKey });
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

  return { generateKey, downloadKey, extractKeys };
};
