import { useState } from 'react';
import seedrandom from 'seedrandom';

// Encrypt text with a key and return the encrypted data and IV
const encryptText = async (
  text: string,
  key: Uint8Array,
): Promise<{ encrypted: Uint8Array; iv: Uint8Array }> => {
  const iv = crypto.getRandomValues(new Uint8Array(16)); // Secure Initialization Vector
  const algorithm = { name: 'AES-CBC', iv }; // AES with CBC mode

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    algorithm,
    false, // Not extractable
    ['encrypt'], // Only for encryption
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      algorithm,
      cryptoKey,
      new TextEncoder().encode(text),
    ),
  );

  return { encrypted, iv };
};

// Decrypt text with a key and IV
const decryptText = async (
  encrypted: Uint8Array,
  iv: Uint8Array,
  key: Uint8Array,
): Promise<string> => {
  const algorithm = { name: 'AES-CBC', iv }; // AES with CBC mode

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    algorithm,
    false,
    ['decrypt'], // Only for decryption
  );

  const decrypted = new Uint8Array(
    await crypto.subtle.decrypt(algorithm, cryptoKey, encrypted),
  );

  return new TextDecoder('utf-8').decode(decrypted);
};

// Generate a SHA-256 hash
const generateHash = async (data: string): Promise<Uint8Array> => {
  const textEncoder = new TextEncoder();
  const encodedData = textEncoder.encode(data); // Convert to Uint8Array
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData); // SHA-256 hash
  return new Uint8Array(hashBuffer); // Return as Uint8Array
};

// Generate a pseudo-random sequence of pixel coordinates
const generateRandomSequence = async (
  width: number,
  height: number,
  key: string,
): Promise<[number, number][]> => {
  const hash = await generateHash(key); // Generate SHA-256 hash
  const hashHex = Array.from(hash) // Convert Uint8Array to hex string
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const rng = seedrandom(hashHex); // Use the hash to seed the RNG

  const totalPixels = width * height;
  const sequence: [number, number][] = [];
  const usedPixels = new Set<number>();

  while (sequence.length < totalPixels) {
    const randomIndex = Math.floor(rng() * totalPixels);
    if (!usedPixels.has(randomIndex)) {
      usedPixels.add(randomIndex);
      const x = randomIndex % width;
      const y = Math.floor(randomIndex / width);
      sequence.push([x, y]);
    }
  }

  return sequence;
};

// Custom React hook for steganography using Canvas and Web Crypto API

export const useSteganography = () => {
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array>(
    crypto.getRandomValues(new Uint8Array(32)), // 256-bit AES key
  );
  const [pixelKey, setPixelKey] = useState<string>(
    Array.from(crypto.getRandomValues(new Uint8Array(16))) // Convert to hexadecimal
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(''),
  );

  const hideTextInImage = async (image: File, text: string): Promise<File> => {
    if (!(image instanceof File)) {
      throw new Error('Invalid input: image should be a File instance.'); // Validate input
    }

    const img = new Image();
    img.src = URL.createObjectURL(image); // Ensure `image` is a valid File

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = (ev) => {
        reject(new Error(`Failed to load image: ${ev}`));
      };
    });

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const { encrypted, iv } = await encryptText(text, encryptionKey); // Using Web Crypto API for encryption

    let textBinary = '';
    encrypted.forEach(
      (byte) => (textBinary += byte.toString(2).padStart(8, '0')),
    );
    iv.forEach((byte) => (textBinary += byte.toString(2).padStart(8, '0')));

    const sequence = await generateRandomSequence(
      img.width,
      img.height,
      pixelKey,
    ); // Awaiting the promise

    let textIndex = 0;
    for (const [x, y] of sequence) {
      if (textIndex >= textBinary.length) break;

      const pixelIndex = (y * img.width + x) * 4; // RGBA channels

      imageData.data[pixelIndex] =
        (imageData.data[pixelIndex] & 0b11111110) |
        parseInt(textBinary[textIndex], 2); // Insert LSB
      textIndex++;
    }

    ctx.putImageData(imageData, 0, 0);

    const updatedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create Blob from canvas.'));
        }
      });
    });

    return new File([updatedBlob], 'hidden_message_image.png', {
      type: 'image/png',
    });
  };

  const extractTextFromImage = async (image: File): Promise<string> => {
    const img = new Image();
    img.src = URL.createObjectURL(image);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    await new Promise<void>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
    });

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const sequence = await generateRandomSequence(
      img.width,
      img.height,
      pixelKey,
    ); // Awaiting the promise

    let textBinary = '';
    for (const [x, y] of sequence) {
      const pixelIndex = (y * img.width + x) * 4;

      textBinary += (imageData.data[pixelIndex] & 0b00000001).toString(); // Extract LSB
    }

    const textBytes: number[] = [];
    const byteSize = 8;
    for (let i = 0; i < textBinary.length; i += byteSize) {
      textBytes.push(parseInt(textBinary.slice(i, i + byteSize)));
    }

    const iv = new Uint8Array(textBytes.slice(0, 16)); // Extract IV
    const encryptedText = new Uint8Array(textBytes.slice(16)); // Extract encrypted text

    const decryptedText = await decryptText(encryptedText, iv, encryptionKey); // Decrypt using Web Crypto API

    return decryptedText;
  };

  return {
    encryptionKey,
    pixelKey,
    setEncryptionKey,
    setPixelKey,
    hideTextInImage,
    extractTextFromImage,
  };
};
