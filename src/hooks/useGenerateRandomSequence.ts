export const useGenerateRandomSequence = () => {
  const secureRandomInt = (
    min: number,
    max: number,
    buffer: Uint8Array,
    offset: number,
  ): number => {
    const range = max - min + 1;
    const byteIndex = offset % (buffer.length - 4);
    const int =
      (buffer[byteIndex] << 24) |
      (buffer[byteIndex + 1] << 16) |
      (buffer[byteIndex + 2] << 8) |
      buffer[byteIndex + 3];
    return min + (Math.abs(int) % range);
  };

  const hashPixelKey = async (pixelKey: string): Promise<Uint8Array> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pixelKey);
    const hashBuffer = await crypto.subtle.digest('SHA-384', data); // Switch to SHA-384 for enhanced security
    return new Uint8Array(hashBuffer);
  };

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

    for (let i = totalPixels - 1; i > 0; i--) {
      const j = secureRandomInt(0, i, hash, i * 4);
      [pixelIndices[i], pixelIndices[j]] = [pixelIndices[j], pixelIndices[i]];
    }

    const errors = new Array(totalPixels).fill(0);

    return pixelIndices.map((index) => {
      const x = index % width;
      const y = Math.floor(index / width);
      const pixelColor = hash[index % hash.length] % 256;
      const channelOffset = pixelColor > 85 ? (pixelColor > 170 ? 2 : 1) : 0;
      const randomChannel = channels[channelOffset];

      let bitPosition = 0;
      if (useMultipleBits) {
        bitPosition = secureRandomInt(0, 7, hash, index);
        if (useErrorDiffusion) {
          const error = errors[index];
          bitPosition = Math.max(0, Math.min(7, bitPosition + error));
          errors[index] = 0;
        }
      }

      if (useErrorDiffusion) {
        const neighbors = [
          index - 1,
          index + 1,
          index - width,
          index + width,
        ].filter((n) => n >= 0 && n < totalPixels);
        neighbors.forEach((n) => {
          const localIntensity = hash[n % hash.length] % 256;
          const intensityAdjustmentFactor = localIntensity / 128 - 1; // Adjust based on local pixel intensity
          const adjustment =
            (secureRandomInt(-25, 25, hash, n) / 100) *
            intensityAdjustmentFactor; // Dynamic error diffusion
          errors[n] += adjustment;
        });
      }

      return [x, y, randomChannel, bitPosition];
    });
  };

  return { generateRandomSequence };
};
