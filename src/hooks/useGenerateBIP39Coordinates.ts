import * as bip39 from 'bip39';
import * as CryptoJS from 'crypto-js';
import { useState } from 'react';

export const useGenerateBIP39Coordinates = () => {
  const [coordinates, setCoordinates] = useState<number[] | null>(null);

  const generateCoordinates = (
    seedPhrase: string,
    privateKey: string,
    password: string,
  ) => {
    const key = privateKey + password;
    const hash = CryptoJS.SHA256(key).toString();
    const words = seedPhrase.split(' ');

    const scrambledCoordinates = words.map((word, i) => {
      const index = bip39.wordlists.english.indexOf(word);
      const hashValue = parseInt(hash.substr(i % hash.length, 2), 16);
      return (index + hashValue) % bip39.wordlists.english.length;
    });

    setCoordinates(scrambledCoordinates);
  };

  const revertCoordinates = (
    coordinates: number[],
    privateKey: string,
    password: string,
  ): string | null => {
    try {
      const key = privateKey + password;
      const hash = CryptoJS.SHA256(key).toString();
      const unscrambledWords = coordinates.map((index, i) => {
        const hashValue = parseInt(hash.substr(i % hash.length, 2), 16);
        const wordIndex =
          (index - hashValue + bip39.wordlists.english.length) %
          bip39.wordlists.english.length;
        return bip39.wordlists.english[wordIndex];
      });

      const seedPhrase = unscrambledWords.join(' ');

      // Check if the seed phrase is valid
      if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid password');
      }

      return seedPhrase;
    } catch (error) {
      console.error('Error reverting coordinates:', error);
      return null;
    }
  };

  return {
    generateCoordinates,
    revertCoordinates,
    coordinates,
    setCoordinates,
  };
};
