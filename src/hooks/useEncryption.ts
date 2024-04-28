import { useState } from 'react';

const useEncryption = () => {
  const [key] = useState(() =>
    window.crypto.getRandomValues(new Uint8Array(16)),
  );

  const encryptText = async (
    text: string,
  ): Promise<{ encrypted: Uint8Array; iv: Uint8Array }> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(16)); // Initialization Vector
    const algorithm = { name: 'AES-CBC', iv };

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      algorithm,
      false,
      ['encrypt'],
    );

    const encrypted = new Uint8Array(
      await window.crypto.subtle.encrypt(
        algorithm,
        cryptoKey,
        new TextEncoder().encode(text),
      ),
    );

    return { encrypted, iv };
  };

  const decryptText = async (
    encrypted: Uint8Array,
    iv: Uint8Array,
  ): Promise<string> => {
    const algorithm = { name: 'AES-CBC', iv };

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      key,
      algorithm,
      false,
      ['decrypt'],
    );

    const decrypted = new Uint8Array(
      await window.crypto.subtle.decrypt(algorithm, cryptoKey, encrypted),
    );

    return new TextDecoder('utf-8').decode(decrypted);
  };

  return { encryptText, decryptText };
};

export default useEncryption;
