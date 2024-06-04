import { useEffect } from 'react';
import { Button, Card, Kbd, Link } from 'react-daisyui';
import { AlertMessage } from '../../components/AlertMessage';
import { useGenerateSeedPhrase } from '../../hooks/useGenerateSeedPhrase';
import { modalStore } from '../../store/ModalStore';

export const GenerateSeedPhraseTab = () => {
  const { seedPhrase, generateSeedPhrase } = useGenerateSeedPhrase();

  const handleGenerateSeedPhrase = () => {
    generateSeedPhrase();
  };

  const handleCopyToClipboard = async () => {
    if (!seedPhrase) return;

    try {
      await navigator.clipboard.writeText(seedPhrase);
      modalStore.clearModal();

      modalStore.setModal({
        type: 'success',
        title: 'Seed Phrase Copied',
        message: 'Seed phrase copied to clipboard successfully.',
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (!seedPhrase) return;

    modalStore.setModal({
      title: 'Seed Phrase Generated',
      message: (
        <>
          <p>Your seed phrase has been generated successfully.</p>

          <p className="mb-4">
            Remember to keep it safe and never share it with anyone.
          </p>

          <p className="mb-4">Click on it to copy.</p>
          <Kbd onClick={handleCopyToClipboard}>{seedPhrase}</Kbd>
        </>
      ),
      type: 'info',
    });
  }, [seedPhrase]);

  return (
    <Card className="p-5">
      <AlertMessage
        status="warning"
        message={
          <>
            <p>
              If you lose the generated key, you will not be able to decrypt any
              messages.
            </p>
            <br />
            <p>
              Compatible wallets: Bitcoin, Ethereum, Litecoin, Bitcoin Cash,
              Dash, Zcash, Cardano, Polkadot, Solana, BSC, Cosmos, Avax,
              Harmony, Polygon, Fantom and more...
            </p>
          </>
        }
      />

      <p className="mt-8 mb-4">
        This tool generates a 12-word seed phrase in BIP39 format that can be
        used to setup a crypto wallet. Click the button below to generate and
        copy it. Remember to keep it safe and never share it with anyone.
      </p>

      <p className="mb-4">
        You can use tools like{' '}
        <Link color="primary" target="_blank" href="https://metamask.io/">
          Metamask
        </Link>{' '}
        to operate them. We strongly recommend you buy a hardware cold wallet to
        hold substantial funds.
      </p>

      <Button onClick={handleGenerateSeedPhrase} variant="outline">
        Generate Seed Phrase
      </Button>
    </Card>
  );
};
