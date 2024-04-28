import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import { useCallback, useState } from 'react';
// Make Buffer globally available
window.Buffer = Buffer;

export function useGenerateSeedPhrase() {
  const [seedPhrase, setSeedPhrase] = useState('');

  const generateSeedPhrase = useCallback(() => {
    const mnemonic = bip39.generateMnemonic(); // generates a 12-word mnemonic
    setSeedPhrase(mnemonic);
  }, []);

  return { seedPhrase, generateSeedPhrase };
}
