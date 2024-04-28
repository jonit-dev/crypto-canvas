import React, { useState } from 'react';
import { Alert, Button, FileInput, Textarea } from 'react-daisyui';
import { useFileHandler } from '../../hooks/useFileHandler';
import { useSteganography } from '../../hooks/useStenography';

export const HideMessagePage = () => {
  const { hideTextInImage } = useSteganography();
  const {
    readFileAsDataURL,
    createDownloadLink,
    fileReadingStatus,
    fileReadingError,
    clearStatusAndError,
    dataURLToBlob,
    blobToFile,
  } = useFileHandler();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

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
      setStatus('Please select an image and enter a message.');
      return;
    }

    setStatus('Processing...');
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

      setDownloadLink(link);
      setStatus('Message hidden in image.');
    } catch (err) {
      console.error(err);
      setError('Error hiding message in image.');
    }
  };

  return (
    <div className="mt-12">
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

      {status ||
        (fileReadingStatus && (
          <Alert className="mt-4" color="blue">
            {status}
          </Alert>
        ))}
      {error ||
        (fileReadingError && (
          <Alert className="mt-4" color="red">
            {error}
          </Alert>
        ))}

      {downloadLink && (
        <a
          href={downloadLink}
          download="hidden_message_image.png" // Sets the download file name
          className="mt-4 text-center text-blue-600 underline"
        >
          Download Hidden Message Image
        </a>
      )}
    </div>
  );
};
