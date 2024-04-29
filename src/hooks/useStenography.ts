import seedrandom from 'seedrandom';
import useEncryption from './useEncryption';

// Generates a random sequence for pixel manipulation based on a seed key
export const generateRandomSequence = (
  width: number,
  height: number,
  pixelKey: string,
  useMultipleBits: boolean = false,
  useErrorDiffusion: boolean = false,
): [number, number, string, number][] => {
  const rng = seedrandom(pixelKey);
  const totalPixels = width * height;
  const pixelIndices = Array.from({ length: totalPixels }, (_, index) => index);
  const channels = ['red', 'green', 'blue'];

  // Randomize pixel indices using the Fisher-Yates shuffle algorithm
  for (let i = totalPixels - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pixelIndices[i], pixelIndices[j]] = [pixelIndices[j], pixelIndices[i]];
  }

  const errors = new Array(totalPixels).fill(0); // Error array to store diffusion effects

  return pixelIndices.map((index) => {
    const x = index % width;
    const y = Math.floor(index / width);
    const randomChannel = channels[Math.floor(rng() * channels.length)];

    let bitPosition = 0;
    if (useMultipleBits) {
      bitPosition = Math.floor(rng() * 8);
      if (useErrorDiffusion) {
        // Apply error diffusion: adjust bit position based on accumulated error
        const error = errors[index];
        bitPosition = Math.max(0, Math.min(7, bitPosition + error));
        errors[index] = 0; // Reset error after applying
      }
    }

    // If using error diffusion, diffuse the "modification" to neighboring pixels
    if (useErrorDiffusion) {
      const neighbors = [
        index - 1,
        index + 1,
        index - width,
        index + width,
      ].filter((i) => i >= 0 && i < totalPixels);
      neighbors.forEach((n) => {
        errors[n] += rng() * 0.5 - 0.25; // Randomly adjust neighbors' error within a small range
      });
    }

    return [x, y, randomChannel, bitPosition];
  });
};
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
      img.onerror = reject;
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const textBinary = Array.from(new TextEncoder().encode(fullText))
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');

    const sequence = await generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
      false, // Set to true to use multiple bits
      true, // Set to true to use error diffusion
    );

    let textIndex = 0;
    sequence.forEach(([x, y, channel, bitPosition]) => {
      if (textIndex < textBinary.length) {
        const pixelIndex = (y * canvas.width + x) * 4;
        const channelOffset = { red: 0, green: 1, blue: 2 }[channel]!;
        const bitMask = 1 << bitPosition; // Create a bitmask for the current bit position
        const currentBit = parseInt(textBinary[textIndex], 2);

        // Set the specified bit to currentBit
        imageData.data[pixelIndex + channelOffset] =
          (imageData.data[pixelIndex + channelOffset] & ~bitMask) | // Reset the bit at bitPosition
          (currentBit << bitPosition); // Set it to currentBit
        textIndex++;
      }
    });

    ctx.putImageData(imageData, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Blob creation failed'));
      });
    });

    return new File([blob], 'hidden_text_image.png', { type: 'image/png' });
  };

  const extractTextFromImage = async (
    image: File,
    encryptionKey: string,
    pixelKey: string,
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
      img.onerror = reject;
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const sequence = await generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
      false, // Set to true to use multiple bits
      true, // Set to true to use error diffusion
    );

    let textBinary = '';
    sequence.forEach(([x, y, channel, bitPosition]) => {
      const pixelIndex = (y * canvas.width + x) * 4;
      const channelOffset = { red: 0, green: 1, blue: 2 }[channel]!;
      const bitMask = 1 << bitPosition; // Create a bitmask for the current bit position

      textBinary += (
        (imageData.data[pixelIndex + channelOffset] & bitMask) >>
        bitPosition
      ).toString();
    });
    const byteSize = 8;
    const textBytes = [];
    for (let i = 0; i < textBinary.length; i += byteSize) {
      const byte = textBinary.slice(i, i + byteSize);
      if (byte.length === byteSize) {
        // Ensure full byte
        textBytes.push(parseInt(byte, 2));
      }
    }

    const extractedText = new TextDecoder().decode(new Uint8Array(textBytes));
    const delimiterIndex = extractedText.indexOf('\u0003');
    if (delimiterIndex === -1) return undefined;

    const iv = extractedText.substring(0, delimiterIndex);
    const encryptedText = extractedText.substring(delimiterIndex + 1);
    return decryptText(encryptedText, iv, encryptionKey);
  };

  return { hideTextInImage, extractTextFromImage };
};
