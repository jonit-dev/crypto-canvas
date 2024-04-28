import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import FileInputWithLabel from '../../components/LabeledFileInput';
import { useFileHandler } from '../../hooks/useFileHandler';
import { useGenerateEncryptionKey } from '../../hooks/useGenerateEncryption';
import { useSteganography } from '../../hooks/useStenography';
import { encryptionKeysStore } from '../../store/EncryptionKeysStore';
import { modalStore } from '../../store/ModalStore';

export const ExtractMessageTab = () => {
  const { extractTextFromImage } = useSteganography();
  const { readFileAsDataURL, clearStatusAndError, dataURLToBlob, blobToFile } =
    useFileHandler();

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const { extractKeys } = useGenerateEncryptionKey();

  const handleEncryptedKeyFileLoad = async (
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

    // extract keys from the file

    const { encryptionKey, pixelKey } = await extractKeys(e.target?.files[0]);

    encryptionKeysStore.setEncryptionKeys({
      encryptionKey,
      pixelKey,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearStatusAndError(); // Clear status and error messages
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    clearStatusAndError();
    if (!selectedImageFile) {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'Please select an image.',
      });
      return;
    }

    const dataURL = await readFileAsDataURL(selectedImageFile);

    try {
      const img = new Image();
      img.src = dataURL;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          resolve();
        };
      });

      // Draw the image on a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Create a Blob from the data URL
      const dataBlob = dataURLToBlob(dataURL);

      // Convert the Blob to a File
      const imageFile = blobToFile(dataBlob, 'uploaded_image.png');

      console.log(imageFile);

      if (!encryptionKeysStore.hasEncryptionKeys) {
        modalStore.setModal({
          type: 'error',
          title: 'Error',
          message: 'Please upload a valid encryption key file first.',
        });
        return;
      }

      // Call `extractTextFromImage` with the File type
      const extractedMessage = await extractTextFromImage(
        imageFile,
        // encryptionKeysStore.getEncryptionKey()!,
        encryptionKeysStore.getPixelKey()!,
      );

      if (!extractedMessage) {
        modalStore.setModal({
          type: 'error',
          title: 'Error',
          message: 'No message found in the image.',
        });
        return;
      }

      modalStore.setModal({
        type: 'success',
        title: 'Success',
        message: `The extracted message is: ${extractedMessage}`,
      });
    } catch (err) {
      modalStore.setModal({
        type: 'error',
        title: 'Oops!',
        message:
          'An error occurred while extracting the message from the image.',
      });
    }
  };

  return (
    <>
      <FileInputWithLabel
        labelText="Select your encryption key:"
        onChange={handleEncryptedKeyFileLoad}
        className="mb-4"
        accept=".key"
      />

      <FileInputWithLabel
        labelText="Select an image:"
        onChange={handleFileChange}
        className="mb-4"
        accept="image/*"
      />

      <Button
        disabled={!selectedImageFile}
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white hover:bg-blue-600"
      >
        Extract Message
      </Button>
    </>
  );
};
