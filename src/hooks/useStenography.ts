import seedrandom from 'seedrandom';

const generateRandomSequence = (
  width: number,
  height: number,
  pixelKey: Uint8Array,
): [number, number][] => {
  const seed = Array.from(pixelKey)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  const rng = seedrandom(seed); // Initialize PRNG with seed
  const totalPixels = width * height; // Total number of pixels

  const sequence: [number, number][] = [];
  const usedPixels = new Set<number>();

  // Generate unique pixel coordinates
  while (sequence.length < totalPixels) {
    const randomIndex = Math.floor(rng() * totalPixels); // Random index
    if (!usedPixels.has(randomIndex)) {
      usedPixels.add(randomIndex);
      const x = randomIndex % width;
      const y = Math.floor(randomIndex / width);
      sequence.push([x, y]);
    }
  }

  return sequence;
};

// Custom hook for steganography
export const useSteganography = () => {
  const hideTextInImage = async (
    image: File,
    text: string,
    encryptedKey: Uint8Array, // Key for encryption
    pixelKey: Uint8Array, // Key for generating random sequence
  ): Promise<File> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = (ev) => reject(new Error(`Failed to load image: ${ev}`));
    });

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const delimiter = '\u0003'; // End-of-text marker
    const fullText = text + delimiter;

    const textBinary = Array.from(new TextEncoder().encode(fullText))
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');

    // Embed data using a pseudo-random sequence
    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
    );
    let textIndex = 0;

    for (const [x, y] of sequence) {
      if (textIndex >= textBinary.length) {
        break;
      }

      const pixelIndex = (y * canvas.width + x) * 4; // Index into the pixel data
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

    return new File([blob], 'hidden_text_image.png', { type: 'image/png' });
  };

  const extractTextFromImage = async (
    image: File,
    encryptedKey: Uint8Array, // Key for decryption
    pixelKey: Uint8Array, // Key to generate the same pseudo-random sequence
  ): Promise<string | undefined> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = (ev) => reject(new Error(`Failed to load image: ${ev}`));
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Generate the same pseudo-random sequence to extract text
    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
    );

    let textBinary = '';
    for (const [x, y] of sequence) {
      const pixelIndex = (y * canvas.width + x) * 4;
      textBinary += (imageData.data[pixelIndex] & 0b00000001).toString();
    }

    const byteSize = 8;
    const textBytes: number[] = [];
    for (let i = 0; i < textBinary.length; i += byteSize) {
      textBytes.push(parseInt(textBinary.slice(i, i + byteSize), 2));
    }

    const text = new TextDecoder('utf-8').decode(new Uint8Array(textBytes));
    const delimiterIndex = text.indexOf('\u0003'); // End-of-text marker

    if (delimiterIndex === -1) {
      return undefined; // No hidden text
    }

    return text.substring(0, delimiterIndex); // Return the extracted text
  };

  return { hideTextInImage, extractTextFromImage };
};
