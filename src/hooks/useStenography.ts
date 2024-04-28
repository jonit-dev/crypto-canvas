import seedrandom from 'seedrandom';
import useEncryption from './useEncryption';

// Random sequence generation with consistent channel selection
export const generateRandomSequence = (
  width: number,
  height: number,
  pixelKey: string, // Random seed key
): [number, number, string][] => {
  const rng = seedrandom(pixelKey); // Seed with the key
  const totalPixels = width * height;

  const sequence: [number, number, string][] = [];
  const usedPixels = new Set<number>();

  const channels = ['red', 'green', 'blue']; // Possible channels

  // Generate unique pixel coordinates with consistent random selection
  while (sequence.length < totalPixels) {
    const randomIndex = Math.floor(rng() * totalPixels); // Random index
    const randomChannel = channels[Math.floor(rng() * channels.length)]; // Random channel
    if (!usedPixels.has(randomIndex)) {
      usedPixels.add(randomIndex); // Ensure uniqueness
      const x = randomIndex % width; // x-coordinate
      const y = Math.floor(randomIndex / width); // y-coordinate
      sequence.push([x, y, randomChannel]); // Add to the sequence with channel selection
    }
  }

  return sequence; // Return generated sequence
};

// Custom hook for steganography with correct channel reading
export const useSteganography = () => {
  const { encryptText, decryptText } = useEncryption();

  const hideTextInImage = async (
    image: File,
    text: string,
    encryptionKey: string, // Base64-encoded key
    pixelKey: string, // Key for random sequence generation
  ): Promise<File> => {
    const { encrypted, iv } = encryptText(text, encryptionKey); // Encrypt text

    const delimiter = '\u0003'; // Delimiter for separation
    const fullText = `${iv}${delimiter}${encrypted}`; // Combine encrypted text

    const canvas = document.createElement('canvas'); // Create canvas
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const img = new Image(); // Create image object
    img.src = URL.createObjectURL(image); // Load image source

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth; // Set canvas width
        canvas.height = img.naturalHeight; // Set canvas height
        ctx.drawImage(img, 0, 0); // Draw image onto canvas
        resolve(); // Signal completion
      };
      img.onerror = (error) => {
        reject(error); // Handle error
      };
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Get image data

    const textBinary = Array.from(new TextEncoder().encode(fullText))
      .map((byte) => byte.toString(2).padStart(8, '0'))
      .join(''); // Convert text to binary

    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey, // Use the same key
    ); // Generate the sequence

    let textIndex = 0; // Start of text
    for (const [x, y, channel] of sequence) {
      if (textIndex >= textBinary.length) {
        break; // No more text to embed
      }

      const pixelIndex = (y * canvas.width + x) * 4; // Get pixel index
      const channelOffset = { red: 0, green: 1, blue: 2 }[channel]!; // Get channel offset

      imageData.data[pixelIndex + channelOffset] =
        (imageData.data[pixelIndex + channelOffset] & 0b11111110) |
        parseInt(textBinary[textIndex], 2); // Embed the bit

      textIndex++; // Increment index
    }

    ctx.putImageData(imageData, 0, 0); // Update the image data

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob); // Create a new blob
        } else {
          reject(new Error('Failed to create Blob.')); // Handle error
        }
      });
    });

    return new File([blob], 'hidden_text_image.png', { type: 'image/png' }); // Create the file
  };

  const extractTextFromImage = async (
    image: File,
    encryptionKey: string, // Key for decryption
    pixelKey: string, // Seed for sequence generation
  ): Promise<string | undefined> => {
    const canvas = document.createElement('canvas'); // Create a new canvas
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D; // Get the context

    const img = new Image(); // Create an image object
    img.src = URL.createObjectURL(image); // Load the image

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.naturalWidth; // Set canvas width
        canvas.height = img.naturalHeight; // Set canvas height
        ctx.drawImage(img, 0, 0); // Draw the image
        resolve(); // Resolve on completion
      };
      img.onerror = (error) => {
        reject(error); // Handle error
      };
    });

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height); // Get image data

    const sequence = generateRandomSequence(
      canvas.width,
      canvas.height,
      pixelKey, // Use the same seed
    ); // Get the random sequence

    let textBinary = ''; // Initialize text storage
    for (const [x, y, channel] of sequence) {
      // Include channel info
      const pixelIndex = (y * canvas.width + x) * 4; // Get pixel index
      const channelOffset = { red: 0, green: 1, blue: 2 }[channel]!; // Determine channel offset

      textBinary += (
        imageData.data[pixelIndex + channelOffset] & 0b00000001
      ).toString(); // Read the bit
    }

    const byteSize = 8; // Byte size
    const textBytes = []; // Initialize bytes array
    for (let i = 0; i < textBinary.length; i += byteSize) {
      textBytes.push(parseInt(textBinary.slice(i, i + byteSize), 2)); // Parse binary to bytes
    }

    const extractedText = new TextDecoder().decode(new Uint8Array(textBytes)); // Decode bytes to text

    const delimiterIndex = extractedText.indexOf('\u0003'); // Locate the delimiter
    if (delimiterIndex === -1) {
      return undefined; // No delimiter, return undefined
    }

    const [iv, encryptedText] = extractedText.split('\u0003'); // Split IV and text

    try {
      return decryptText(encryptedText, iv, encryptionKey); // Attempt decryption
    } catch (error) {
      console.error('Decryption error:', error); // Handle error
      return undefined;
    }
  };

  return { hideTextInImage, extractTextFromImage }; // Return the methods
};
