import { useEffect } from 'react';
import { Button, Card, Kbd } from 'react-daisyui';
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
      <p className="mt-8 mb-8">
        This tool generates a 12-word seed phrase that can be used to setup a
        crypto wallet. Click the button below to generate and copy it. Remember
        to keep it safe and never share it with anyone.
      </p>
      <Button onClick={handleGenerateSeedPhrase} variant="outline">
        Generate Seed Phrase
      </Button>
    </Card>
  );
};
