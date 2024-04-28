import CryptoJS from 'crypto-js';

const useEncryption = () => {
  const encryptText = (
    text: string,
    encryptionKey: string, // Base64-encoded key
  ): { encrypted: string; iv: string } => {
    const iv = CryptoJS.lib.WordArray.random(16); // Generate a 16-byte IV
    const key = CryptoJS.enc.Base64.parse(encryptionKey); // Parse the base64 key

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    console.log(`Encrypting text with:
      - IV: ${iv.toString(CryptoJS.enc.Base64)}
      - Key: ${key.toString(CryptoJS.enc.Base64)}
      - Encrypted: ${encrypted.toString()}
        `);

    return {
      encrypted: encrypted.toString(),
      iv: iv.toString(CryptoJS.enc.Base64),
    };
  };

  const decryptText = (
    encryptedText: string,
    iv: string,
    encryptionKey: string,
  ): string => {
    const key = CryptoJS.enc.Base64.parse(encryptionKey); // Parse the base64 key
    const ivArray = CryptoJS.enc.Base64.parse(iv); // Parse the base64 IV

    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: ivArray,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    console.log(`Decrypting text with:
      - IV: ${ivArray.toString(CryptoJS.enc.Base64)}
      - Key: ${key.toString(CryptoJS.enc.Base64)}
      - Decrypted: ${decrypted.toString(CryptoJS.enc.Utf8)}
      `);

    return decrypted.toString(CryptoJS.enc.Utf8); // Convert to UTF-8 text
  };

  return { encryptText, decryptText };
};

export default useEncryption;
