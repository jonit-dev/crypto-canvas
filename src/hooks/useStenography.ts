import seedrandom from 'random-seed';

// Function to encrypt text with a key and return the encrypted data and IV
const encryptText = async (
  text: string,
  key: Uint8Array,
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

// Function to decrypt text with a key and IV
const decryptText = async (
  encrypted: Uint8Array,
  iv: Uint8Array,
  key: Uint8Array,
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

// Function to generate a pseudo-random sequence of pixel coordinates
const generateRandomSequence = (
  width: number,
  height: number,
  pixelKey: Uint8Array,
): [number, number][] => {
  const seed = Array.from(pixelKey)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const rng = seedrandom.create(seed); // Initialize PRNG with seed
  const totalPixels = width * height; // Ensure total pixel count

  const sequence: [number, number][] = [];
  const usedPixels = new Set<number>();

  // Ensure rng has a valid range
  while (sequence.length < totalPixels) {
    const randomIndex = Math.floor(rng(totalPixels)); // Provide the range argument
    if (!usedPixels.has(randomIndex)) {
      usedPixels.add(randomIndex);
      const x = randomIndex % width;
      const y = Math.floor(randomIndex / width);
      sequence.push([x, y]);
    }
  }

  return sequence;
};

// Function to extract keys from a file
const extractKeys = (
  file: File,
): Promise<{ encryptionKey: Uint8Array; pixelKey: Uint8Array }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result?.toString();
      if (result) {
        const lines = result.split('\n');
        if (lines.length < 2) {
          reject(new Error('File does not contain both keys.'));
        } else {
          const encryptionKey = new Uint8Array(
            lines[0].match(/.{1,2}/g)?.map((hex) => parseInt(hex, 16)) || [],
          );
          const pixelKey = new Uint8Array(
            lines[1].match(/.{1,2}/g)?.map((hex) => parseInt(hex, 16)) || [],
          );
          resolve({ encryptionKey, pixelKey });
        }
      } else {
        reject(new Error('Failed to read file content.'));
      }
    };
    reader.readAsText(file);
  });
};

// Custom hook for steganography
export const useSteganography = () => {
  const hideTextInImage = async (
    image: File,
    text: string,
    encryptionKey: Uint8Array,
    pixelKey: Uint8Array,
  ): Promise<File> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = (ev) => reject(new Error(`Failed to load image: ${ev}`));
    });

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const { encrypted, iv } = await encryptText(text, encryptionKey);

    let textBinary = '';
    encrypted.forEach(
      (byte) => (textBinary += byte.toString(2).padStart(8, '0')),
    );
    iv.forEach((byte) => (textBinary += byte.toString(2)));

    const sequence = generateRandomSequence(img.width, img.height, pixelKey);

    let textIndex = 0;
    for (const [x, y] of sequence) {
      if (textIndex >= textBinary.length) break;

      const pixelIndex = (y * img.width + x) * 4;

      imageData.data[pixelIndex] =
        (imageData.data[pixelIndex] & 0b11111110) |
        parseInt(textBinary[textIndex], 2);
      textIndex++;
    }

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create Blob from canvas.'));
        }
      });
    });

    return new File([blob], 'hidden_message_image.png', { type: 'image/png' });
  };

  const extractTextFromImage = async (
    image: File,
    encryptionKey: Uint8Array,
    pixelKey: Uint8Array,
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = (ev) => reject(new Error(`Failed to load image: ${ev}`));
    });

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const sequence = generateRandomSequence(img.width, img.height, pixelKey);

    let textBinary = '';
    for (const [x, y] of sequence) {
      const pixelIndex = (y * img.width + x) * 4;

      textBinary += (imageData.data[pixelIndex] & 0b00000001).toString();
    }

    const textBytes = [];
    const byteSize = 8;
    for (let i = 0; i < textBinary.length; i += byteSize) {
      textBytes.push(parseInt(textBinary.slice(i, i + byteSize), 2));
    }

    const iv = new Uint8Array(textBytes.slice(0, 16)); // Extract IV
    const encryptedText = new Uint8Array(textBytes.slice(16)); // Extract encrypted text

    return await decryptText(encryptedText, iv, encryptionKey);
  };

  return { hideTextInImage, extractTextFromImage, extractKeys };
};
