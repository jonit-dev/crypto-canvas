import { Button, Card } from 'react-daisyui';
import { AlertMessage } from '../../components/AlertMessage';
import { useGenerateEncryptionKey } from '../../hooks/useGenerateEncryption';

export const GenerateEncryptionKeyTab = () => {
  const { generateKey, downloadKey } = useGenerateEncryptionKey();

  const handleGenerateAndDownloadKey = async () => {
    generateKey();
    downloadKey();
  };

  return (
    <Card className="p-5">
      <AlertMessage
        status="warning"
        message="If you lose the generated key, you will not be able to decrypt any messages."
      />

      <p className="mt-8 mb-8">
        This tool generates a 256-bit encryption key that can be used to encrypt
        and decrypt messages. Click the button below to generate and download
        the key.
      </p>

      <Button onClick={handleGenerateAndDownloadKey} variant="outline">
        Generate and Download Key
      </Button>
    </Card>
  );
};
