import React, { useState } from 'react';
import { Button, Textarea } from 'react-daisyui';
import { AlertMessage } from '../../components/AlertMessage';
import FileInputWithLabel from '../../components/LabeledFileInput';
import { useFileHandler } from '../../hooks/useFileHandler';
import { useGenerateEncryptionKey } from '../../hooks/useGenerateEncryption';
import { useSteganography } from '../../hooks/useStenography';
import { encryptionKeysStore } from '../../store/EncryptionKeysStore';
import { loadingStore } from '../../store/LoadingStore';
import { modalStore } from '../../store/ModalStore';

export const HideMessageTab = () => {
  const { hideTextInImage } = useSteganography();

  const { extractKeys } = useGenerateEncryptionKey();

  const {
    readFileAsDataURL,
    createDownloadLink,
    clearStatusAndError,
    dataURLToBlob,
    blobToFile,
  } = useFileHandler();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleImageFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearStatusAndError(); // Clear status and error messages
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

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

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async () => {
    clearStatusAndError();
    if (!selectedFile || !message) {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'Please select an image and enter a message.',
      });
      return;
    }

    const dataURL = await readFileAsDataURL(selectedFile);

    try {
      loadingStore.setLoading(true);

      // Wait for the loading screen to show
      await new Promise((resolve) => setTimeout(resolve, 1000));

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

      if (!encryptionKeysStore.hasEncryptionKeys) {
        modalStore.setModal({
          type: 'error',
          title: 'Error',
          message: 'Please upload a valid encryption key file first.',
        });
        return;
      }

      // Call `hideTextInImage` with the File type
      const hiddenMessageImage = await hideTextInImage(
        imageFile, // Now passing a File type
        message,
        encryptionKeysStore.getEncryptionKey()!,
        encryptionKeysStore.getPixelKey()!,
      );

      const link = createDownloadLink(
        hiddenMessageImage,
        'hidden_message_image.png',
      ); // Create a download link with a specific file name

      modalStore.setModal({
        type: 'success',
        title: 'Success',
        message:
          'The provided text was successfully hidden in the image. You can download the image now.',
        confirm: {
          text: 'Download',
          onClick: () => {
            if (link) {
              const a = document.createElement('a');
              a.href = link;
              a.download = 'hidden-message.png';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
          },
        },
        cancel: {
          text: 'Close',
        },
      });
    } catch (err) {
      console.error(err);

      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'An error occurred while hiding the message in the image.',
      });
    } finally {
      loadingStore.setLoading(false);
    }
  };

  return (
    <>
      <AlertMessage
        status="warning"
        message="Compressing the image may result in loss of data. Please make sure to keep the original image."
      />

      <FileInputWithLabel
        labelText="Select your encryption key:"
        onChange={handleEncryptedKeyFileLoad}
        className="mb-4 mt-4"
        accept=".key"
        placeholder='Select a ".key" file'
      />
      <FileInputWithLabel
        labelText="Select an image:"
        placeholder="Select an image file"
        onChange={handleImageFileLoad}
        className="mb-4"
        accept="image/*"
      />

      <Textarea
        value={message}
        onChange={handleMessageChange}
        placeholder="Enter your secret message"
        className="w-full mb-4"
      />

      <Button
        disabled={!selectedFile || !message}
        onClick={handleSubmit}
        className="w-full"
        variant="outline"
      >
        Hide Message
      </Button>
    </>
  );
};
