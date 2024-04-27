import React, { useState } from 'react';

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
    // Add your encryption and steganography logic here
    console.log('File:', selectedFile);
    console.log('Message:', message);
  };

  return (
    <div className="bg-white text-black dark:bg-dark-bg dark:text-dark-text min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Upload a Picture and Hide a Message</h1>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 border border-gray-300 p-2 rounded dark:border-gray-600"
      />

      <textarea
        value={message}
        onChange={handleMessageChange}
        placeholder="Enter your secret message"
        className="w-full h-32 border border-gray-300 p-2 rounded dark:border-gray-600"
      />

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Hide Message in Picture
      </button>
    </div>
  );
};
