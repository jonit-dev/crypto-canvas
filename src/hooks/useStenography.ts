import seedrandom from 'seedrandom';
import useEncryption from './useEncryption';

// Random sequence generation
export const generateRandomSequence = (
  width: number,
  height: number,
  pixelKey: string, // Now a string
): [number, number][] => {
  const rng = seedrandom(pixelKey); // Seed with the string key
  const totalPixels = width * height; // Total number of pixels

  const sequence: [number, number][] = [];
  const usedPixels = new Set<number>();

  // Generate unique pixel coordinates
  while (sequence.length < totalPixels) {
    const randomIndex = Math.floor(rng() * totalPixels); // Random index
    if (!usedPixels.has(randomIndex)) {
      usedPixels.add(randomIndex); // Ensure uniqueness
      const x = randomIndex % width; // Calculate x-coordinate
      const y = Math.floor(randomIndex / width); // Calculate y-coordinate
      sequence.push([x, y]); // Add to the sequence
    }
  }

  return sequence;
};
// Custom hook for steganography
export const useSteganography = () => {
  const { encryptText, decryptText } = useEncryption();

  // Hide text in an image
  const hideTextInImage = async (
    image: File,
    text: string,
    encryptionKey: string, // Base64-encoded key
    pixelKey: string, // String-based pixel key
  ): Promise<File> => {
    console.log('Encrypting text...');
    const { encrypted, iv } = encryptText(text, encryptionKey);

    const delimiter = '\u0003'; // The delimiter between IV and encrypted text
    const fullText = `${iv}${delimiter}${encrypted}`; // Ensure delimiter is embedded

    console.log('Full text for embedding:', fullText);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height;
        ctx.drawImage(img, 0, 0); // Draw the image on the canvas
        console.log('Image loaded and drawn on canvas');
        resolve();
      };
      img.onerror = (error) => {
        console.error('Failed to load image:', error);
        reject(error);
      };
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Convert text to binary for embedding
    const textBinary = Array.from(new TextEncoder().encode(fullText))
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join('');

    console.log('Generating random sequence...');
    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
    ); // Get the pixel sequence

    // Embed the text in the image
    let textIndex = 0;
    for (const [x, y] of sequence) {
      if (textIndex >= textBinary.length) {
        break;
      }

      const pixelIndex = (y * canvas.width + x) * 4; // Index into pixel data
      imageData.data[pixelIndex] =
        (imageData.data[pixelIndex] & 0b11111110) |
        parseInt(textBinary[textIndex], 2); // Embed the bit
      textIndex++;
    }

    ctx.putImageData(imageData, 0, 0);

    // Convert canvas to file
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

  // Extract text from an image
  const extractTextFromImage = async (
    image: File,
    encryptionKey: string, // Base64-encoded key
    pixelKey: string, // String-based pixel key
  ): Promise<string | undefined> => {
    console.log('Starting to load image...');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image();
    img.src = URL.createObjectURL(image);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height;
        ctx.drawImage(img, 0, 0); // Draw the image on the canvas
        console.log('Image loaded and drawn on canvas');
        resolve();
      };
      img.onerror = (error) => {
        console.error('Failed to load image:', error);
        reject(error);
      };
    });

    console.log('Getting image data...');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    console.log('Generating random sequence...');
    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey,
    ); // Get the pixel sequence

    console.log('Extracting binary data...');
    let textBinary = '';
    for (const [x, y] of sequence) {
      const pixelIndex = (y * canvas.width + x) * 4;
      textBinary += (imageData.data[pixelIndex] & 0b00000001).toString();
    }

    console.log('Converting binary data to text...');
    const byteSize = 8;
    const textBytes: number[] = [];
    for (let i = 0; i < textBinary.length; i += byteSize) {
      textBytes.push(parseInt(textBinary.slice(i, i + byteSize), 2));
    }

    const extractedText = new TextDecoder('utf-8').decode(
      new Uint8Array(textBytes),
    );

    const delimiterIndex = extractedText.indexOf('\u0003'); // Check for delimiter
    if (delimiterIndex === -1) {
      console.error('No delimiter found in extracted text');
      return undefined;
    }

    // Extract IV and encrypted text
    const [iv, encryptedText] = extractedText.split('\u0003');

    try {
      console.log('Attempting decryption...');
      const decryptedText = decryptText(encryptedText, iv, encryptionKey);
      console.log('Decryption successful');
      return decryptedText;
    } catch (error) {
      console.error('Error during decryption:', error);
      return undefined;
    }
  };

  return { hideTextInImage, extractTextFromImage };
};
