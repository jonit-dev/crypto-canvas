import React, { useState } from 'react';
import { Button, FileInput, Textarea } from 'react-daisyui';
import { useFileHandler } from '../../hooks/useFileHandler';
import { useSteganography } from '../../hooks/useStenography';
import { modalStore } from '../../store/ModalStore';

export const HideMessagePage = () => {
  const { hideTextInImage } = useSteganography();
  const {
    readFileAsDataURL,
    createDownloadLink,
    clearStatusAndError,
    dataURLToBlob,
    blobToFile,
  } = useFileHandler();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearStatusAndError(); // Clear status and error messages
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
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

      // Call `hideTextInImage` with the File type
      const hiddenMessageImage = await hideTextInImage(
        imageFile, // Now passing a File type
        message,
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
    }
  };

  return (
    <>
      <FileInput
        onChange={handleFileChange}
        className="mb-4"
        accept="image/*"
        placeholder="Upload an image"
      />

      <Textarea
        value={message}
        onChange={handleMessageChange}
        placeholder="Enter your secret message"
        className="w-full mb-4"
      />

      <Button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white hover:bg-blue-600"
      >
        Hide Message
      </Button>
    </>
  );
};
