import { Button, Card } from 'react-daisyui';
import { useGenerateEncryptionKey } from '../../hooks/useGenerateEncryption';

export const GenerateEncryptionKeyTab = () => {
  const { generateKey, downloadKey } = useGenerateEncryptionKey();

  const handleGenerateAndDownloadKey = async () => {
    generateKey();
    downloadKey();
  };

  return (
    <Card className="p-5">
      <p className="mb-8">
        This tool generates a 256-bit encryption key that can be used to encrypt
        and decrypt messages. Click the button below to generate and download
        the key.
      </p>

      <Button
        onClick={handleGenerateAndDownloadKey}
        color="primary"
        className="mb-4"
      >
        Generate and Download Key
      </Button>
    </Card>
  );
};
