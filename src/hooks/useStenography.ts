import seedrandom from 'seedrandom';
import useEncryption from './useEncryption';

// Generates a random sequence for pixel manipulation based on a seed key
export const generateRandomSequence = (
  width: number,
  height: number,
  pixelKey: string,
): [number, number, string][] => {
  const rng = seedrandom(pixelKey);
  const totalPixels = width * height;
  const pixelIndices = Array.from({ length: totalPixels }, (_, index) => index);
  const channels = ['red', 'green', 'blue'];

  // Randomizes the pixel indices using the Fisher-Yates shuffle algorithm
  for (let i = totalPixels - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pixelIndices[i], pixelIndices[j]] = [pixelIndices[j], pixelIndices[i]];
  }

  return pixelIndices.map((index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    const randomChannel = channels[Math.floor(rng() * channels.length)];
    return [x, y, randomChannel];
  });
};

// Custom hook encapsulating steganography functionalities
export const useSteganography = () => {
  const { encryptText, decryptText } = useEncryption();

  const hideTextInImage = async (
    image: File,
    text: string,
    encryptionKey: string,
    pixelKey: string,
  ): Promise<File> => {
    const { encrypted, iv } = encryptText(text, encryptionKey);
    const delimiter = '\u0003';
    const fullText = `${iv}${delimiter}${encrypted}`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = reject;
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const textBinary = Array.from(new TextEncoder().encode(fullText))
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');

    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
    );
    let textIndex = 0;

    sequence.forEach(([x, y, channel]) => {
      if (textIndex < textBinary.length) {
        const pixelIndex = (y * canvas.width + x) * 4;
        const channelOffset = { red: 0, green: 1, blue: 2 }[channel]!;
        imageData.data[pixelIndex + channelOffset] =
          (imageData.data[pixelIndex + channelOffset] & 0b11111110) |
          parseInt(textBinary[textIndex], 2);
        textIndex++;
      }
    });

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) =>
        b ? resolve(b) : reject(new Error('Blob creation failed.')),
      );
    });

    return new File([blob], 'hidden_text_image.png', { type: 'image/png' });
  };

  const extractTextFromImage = async (
    image: File,
    encryptionKey: string,
    pixelKey: string,
  ): Promise<string | undefined> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.onerror = reject;
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
    );
    let textBinary = '';

    sequence.forEach(([x, y, channel]) => {
      const pixelIndex = (y * canvas.width + x) * 4;
      const channelOffset = { red: 0, green: 1, blue: 2 }[channel]!;
      textBinary += (
        imageData.data[pixelIndex + channelOffset] & 0b00000001
      ).toString();
    });

    const byteSize = 8;
    const textBytes = [];
    for (let i = 0; i < textBinary.length; i += byteSize) {
      textBytes.push(parseInt(textBinary.slice(i, i + byteSize), 2));
    }

    const extractedText = new TextDecoder().decode(new Uint8Array(textBytes));
    const delimiterIndex = extractedText.indexOf('\u0003');
    if (delimiterIndex === -1) return undefined;

    const [iv, encryptedText] = extractedText.split('\u0003');
    return decryptText(encryptedText, iv, encryptionKey);
  };

  return { hideTextInImage, extractTextFromImage };
};
