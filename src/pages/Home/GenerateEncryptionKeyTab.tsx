import { useEffect, useState } from 'react';
import { Button, Card, Input } from 'react-daisyui';
import { AlertMessage } from '../../components/AlertMessage';
import { useGenerateEncryptionKey } from '../../hooks/useGenerateEncryption';
import { loadingStore } from '../../store/LoadingStore';
import { modalStore } from '../../store/ModalStore';

export const GenerateEncryptionKeyTab = () => {
  const { generateKey, encryptionKey, pixelKey, downloadKey } =
    useGenerateEncryptionKey();

  const [encryptionKeyPassword, setEncryptionKeyPassword] = useState('');

  const handleGenerateAndDownloadKey = async () => {
    try {
      loadingStore.setLoading(true);

      // wait 1 sec
      await new Promise((resolve) => setTimeout(resolve, 1000));

      generateKey(encryptionKeyPassword);

      modalStore.setModal({
        type: 'success',
        title: 'Success',
        message:
          'Key generated successfully. It should be on ~/Downloads folder.',
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!encryptionKey || !pixelKey) return;

    console.log('Downloading key...');

    downloadKey(encryptionKeyPassword);

    loadingStore.setLoading(false);
  }, [encryptionKey, pixelKey]);

  return (
    <Card className="p-5">
      <AlertMessage
        status="warning"
        message="If you lose the generated key, you will not be able to decrypt any messages."
      />

      <p className="mt-8 mb-8">
        This tool generates a 256-bit encryption key that can be used to encrypt
        and decrypt messages.
      </p>

      <Input
        value={encryptionKeyPassword}
        onChange={(e) => setEncryptionKeyPassword(e.target.value)}
        placeholder="Enter password to encrypt the key"
        type="password"
        className="mb-4 w-full"
      />

      <Button
        onClick={handleGenerateAndDownloadKey}
        variant="outline"
        disabled={!encryptionKeyPassword}
      >
        Generate and Download Key
      </Button>
    </Card>
  );
};
