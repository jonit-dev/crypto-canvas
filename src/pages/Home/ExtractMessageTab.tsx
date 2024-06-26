import React, { useState } from 'react';
import { Button, Divider, Input } from 'react-daisyui';
import FileInputWithLabel from '../../components/LabeledFileInput';
import { useFileHandler } from '../../hooks/useFileHandler';
import { useGenerateEncryptionKey } from '../../hooks/useGenerateEncryption';
import { useSteganography } from '../../hooks/useStenography';
import { encryptionKeysStore } from '../../store/EncryptionKeysStore';
import { loadingStore } from '../../store/LoadingStore';
import { modalStore } from '../../store/ModalStore';

export const ExtractMessageTab = () => {
  const { extractTextFromImage } = useSteganography();
  const { readFileAsDataURL, clearStatusAndError, dataURLToBlob, blobToFile } =
    useFileHandler();

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [encryptionKeyFile, setEncryptionKeyFile] = useState<File | null>(null);

  const { extractKeys } = useGenerateEncryptionKey();

  const [privateKeyPassword, setPrivateKeyPassword] = useState('');

  const handleEncryptedKeyFileLoad = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    clearStatusAndError(); // Clear status and error messages

    if (!e.target?.files || e.target.files.length === 0) {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'Please select a valid encryption key file.',
      });
      return;
    }

    setEncryptionKeyFile(e.target.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearStatusAndError(); // Clear status and error messages
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    clearStatusAndError();
    if (!selectedImageFile || !encryptionKeyFile || !privateKeyPassword) {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message:
          'Please select an image, encryption key file, and provide the password.',
      });
      return;
    }

    try {
      loadingStore.setLoading(true);

      // Wait for the loading screen to show
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { encryptionKey, pixelKey } = await extractKeys(
        encryptionKeyFile,
        privateKeyPassword,
      );

      encryptionKeysStore.setEncryptionKeys({
        encryptionKey,
        pixelKey,
      });

      const dataURL = await readFileAsDataURL(selectedImageFile);
      const img = new Image();
      img.src = dataURL;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          resolve();
        };
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const dataBlob = dataURLToBlob(dataURL);
      const imageFile = blobToFile(dataBlob, 'uploaded_image.png');

      const extractedMessage = await extractTextFromImage(
        imageFile,
        encryptionKeysStore.getEncryptionKey()!,
        encryptionKeysStore.getPixelKey()!,
      );

      if (!extractedMessage) {
        modalStore.setModal({
          type: 'error',
          title: 'Oops!',
          message:
            'No message found on the image or the encryption key is incorrect.',
        });
        return;
      }

      modalStore.setModal({
        type: 'success',
        title: 'Success',
        message: `The extracted message is: ${extractedMessage}`,
      });
    } catch (err) {
      console.error('Failed to extract message: ', err);

      modalStore.setModal({
        type: 'error',
        title: 'Oops!',
        message: (
          <>
            <p>Sorry, we couldn't extract the message from the image.</p>
            <p>This could be due to:</p>
            <ul className="list-disc list-inside mt-4">
              <li>The encryption key file or password being incorrect,</li>
              <li>The image not containing a hidden message, or</li>
              <li>The image being modified after the message was hidden.</li>
            </ul>
          </>
        ),
      });
    } finally {
      loadingStore.setLoading(false);
    }
  };

  return (
    <>
      <FileInputWithLabel
        labelText="Select your encryption key:"
        onChange={handleEncryptedKeyFileLoad}
        className="mb-4 mt-4"
        accept=".key"
        placeholder='Select a ".key" file'
      />

      <Input
        type="password"
        placeholder="Enter your private key password"
        value={privateKeyPassword}
        onChange={(e) => setPrivateKeyPassword(e.target.value)}
        className="mb-4 w-full"
      />

      <Divider />

      <FileInputWithLabel
        labelText="Select an image:"
        onChange={handleFileChange}
        className="mb-4"
        accept="image/*"
      />

      <Button
        disabled={
          !selectedImageFile || !encryptionKeyFile || !privateKeyPassword
        }
        onClick={handleSubmit}
        className="w-full"
        variant="outline"
      >
        Extract Message
      </Button>
    </>
  );
};
