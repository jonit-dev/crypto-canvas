import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Card } from 'react-daisyui';
import { useGenerateSeedPhrase } from '../../hooks/useGenerateSeedPhrase';
import { modalStore } from '../../store/ModalStore';

export const GenerateSeedPhraseTab = () => {
  const { seedPhrase, generateSeedPhrase } = useGenerateSeedPhrase();

  const handleGenerateSeedPhrase = () => {
    generateSeedPhrase();
  };

  const handleCopy = () => {
    modalStore.setModal({
      title: 'Seed Phrase Copied',
      message: 'Seed phrase copied to clipboard.',
      type: 'success',
    });
  };

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
      {seedPhrase && (
        <div className="mt-4">
          <p>Your seed phrase: {seedPhrase}</p>
          <CopyToClipboard text={seedPhrase} onCopy={handleCopy}>
            <Button color="primary" className="mt-2" size="sm">
              <i className="ri-file-copy-line"></i> Copy to clipboard
            </Button>
          </CopyToClipboard>
        </div>
      )}
    </Card>
  );
};
