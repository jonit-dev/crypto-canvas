import useEncryption from './useEncryption';
import { useGenerateRandomSequence } from './useGenerateRandomSequence';

export const useSteganography = () => {
  const { encryptText, decryptText } = useEncryption();

  const { generateRandomSequence } = useGenerateRandomSequence();

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
