import React, { useState } from 'react';
import { Button, Card, FileInput, Textarea } from 'react-daisyui';

export const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = () => {
    // Logic to hide the message in the uploaded image
    console.log('File:', selectedFile);
    console.log('Message:', message);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-dark-bg">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Upload an Image and Hide a Secret Message</h1>
        
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
      </Card>
    </div>
  );
};
