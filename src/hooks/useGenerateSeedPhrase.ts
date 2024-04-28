import * as bip39 from 'bip39';
import { useCallback, useState } from 'react';

export function useGenerateSeedPhrase() {
  const [seedPhrase, setSeedPhrase] = useState('');

  const generateSeedPhrase = useCallback(() => {
    const mnemonic = bip39.generateMnemonic(); // generates a 12-word mnemonic
    setSeedPhrase(mnemonic);
  }, []);

  return { seedPhrase, generateSeedPhrase };
}
