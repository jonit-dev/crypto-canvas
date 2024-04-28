const useEncryption = () => {
  const encryptText = async (
    text: string,
    encryptedKey: Uint8Array,
  ): Promise<{ encrypted: Uint8Array; iv: Uint8Array }> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(16)); // Initialization Vector
    const algorithm = { name: 'AES-CBC', iv };

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      encryptedKey,
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
    encryptedText: Uint8Array,
    iv: Uint8Array,
    encryptedKey: Uint8Array,
  ): Promise<string> => {
    const algorithm = { name: 'AES-CBC', iv };

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      encryptedKey,
      algorithm,
      false,
      ['decrypt'],
    );

    const decrypted = new Uint8Array(
      await window.crypto.subtle.decrypt(algorithm, cryptoKey, encryptedText),
    );

    return new TextDecoder('utf-8').decode(decrypted);
  };

  return { encryptText, decryptText };
};

export default useEncryption;
