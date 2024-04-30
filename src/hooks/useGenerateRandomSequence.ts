// create hook useGenerateRandomSequence

export const useGenerateRandomSequence = () => {
  // Helper function to get a secure random integer in the specified range
  const secureRandomInt = (
    min: number,
    max: number,
    buffer: Uint8Array,
    offset: number,
  ): number => {
    const range = max - min + 1;
    const byteIndex = offset % (buffer.length - 4); // Ensure we don't overflow the buffer
    const int =
      (buffer[byteIndex] << 24) |
      (buffer[byteIndex + 1] << 16) |
      (buffer[byteIndex + 2] << 8) |
      buffer[byteIndex + 3];
    return min + (Math.abs(int) % range);
  };

  // Generates a SHA-256 hash of the pixelKey
  const hashPixelKey = async (pixelKey: string): Promise<Uint8Array> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pixelKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  };

  // Generates a random sequence for pixel manipulation based on a hash derived from pixelKey
  const generateRandomSequence = async (
    width: number,
    height: number,
    pixelKey: string,
    useMultipleBits: boolean = false,
    useErrorDiffusion: boolean = false,
  ): Promise<[number, number, string, number][]> => {
    const totalPixels = width * height;
    const pixelIndices = Array.from(
      { length: totalPixels },
      (_, index) => index,
    );
    const channels = ['red', 'green', 'blue'];
    const hash = await hashPixelKey(pixelKey);

    // Randomize pixel indices using the Fisher-Yates shuffle algorithm with secure hash-based randomness
    for (let i = totalPixels - 1; i > 0; i--) {
      const j = secureRandomInt(0, i, hash, i * 4); // i * 4 to vary the offset in the hash buffer
      [pixelIndices[i], pixelIndices[j]] = [pixelIndices[j], pixelIndices[i]];
    }

    const errors = new Array(totalPixels).fill(0); // Error array to store diffusion effects

    return pixelIndices.map((index) => {
      const x = index % width;
      const y = Math.floor(index / width);
      const channelOffset = index % 3; // Corrected from i to index
      const randomChannel = channels[channelOffset];

      let bitPosition = 0;
      if (useMultipleBits) {
        bitPosition = secureRandomInt(0, 7, hash, index % hash.length); // Use index to vary the offset
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
        ].filter((n) => n >= 0 && n < totalPixels);
        neighbors.forEach((n) => {
          errors[n] += Math.random() * 0.5 - 0.25; // Randomly adjust neighbors' error within a small range
        });
      }

      return [x, y, randomChannel, bitPosition];
    });
  };

  return { generateRandomSequence };
};
