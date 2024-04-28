import React, { useState } from 'react';
import { Button, FileInput } from 'react-daisyui';
import { useFileHandler } from '../../hooks/useFileHandler';
import { useSteganography } from '../../hooks/useStenography';
import { modalStore } from '../../store/ModalStore';

export const ExtractMessagePage = () => {
  const { extractTextFromImage } = useSteganography();
  const { readFileAsDataURL, clearStatusAndError, dataURLToBlob, blobToFile } =
    useFileHandler();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearStatusAndError(); // Clear status and error messages
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    clearStatusAndError();
    if (!selectedFile) {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'Please select an image.',
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

      console.log(imageFile);

      // Call `extractTextFromImage` with the File type
      const extractedMessage = await extractTextFromImage(imageFile);

      modalStore.setModal({
        type: 'success',
        title: 'Success',
        message: `The extracted message is: ${extractedMessage}`,
        cancel: {
          text: 'Close',
        },
      });
    } catch (err) {
      console.error(err.message);

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
      <FileInput
        onChange={handleFileChange}
        className="mb-4"
        accept="image/*"
        placeholder="Upload an image"
      />

      <Button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white hover:bg-blue-600"
      >
        Extract Message
      </Button>
    </>
  );
};
