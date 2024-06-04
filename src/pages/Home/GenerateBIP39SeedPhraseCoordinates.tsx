import { useEffect, useState } from 'react';
import { Button, Card, Divider, Input, Kbd, Radio } from 'react-daisyui';
import { AlertMessage } from '../../components/AlertMessage';
import FileInputWithLabel from '../../components/LabeledFileInput';
import { useGenerateBIP39Coordinates } from '../../hooks/useGenerateBIP39Coordinates';
import { modalStore } from '../../store/ModalStore';

export const GenerateBIP39SeedPhraseCoordinates = () => {
  const { generateCoordinates, revertCoordinates, coordinates } =
    useGenerateBIP39Coordinates();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const [revertedSeedPhrase, setRevertedSeedPhrase] = useState<string | null>(
    null,
  );
  const [action, setAction] = useState<'generate' | 'revert'>('generate');

  const [inputCoordinates, setInputCoordinates] = useState<string>('');

  const handleGenerateCoordinates = () => {
    if (privateKey && password && seedPhrase) {
      generateCoordinates(seedPhrase, privateKey, password);
    } else {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'Seed phrase, private key, and password are required.',
      });
    }
  };

  const handleRevertCoordinates = () => {
    if (privateKey && password && inputCoordinates) {
      const coordinatesArray = inputCoordinates
        .split(',')
        .map((coord) => parseInt(coord.trim(), 10));
      const revertedSeedPhrase = revertCoordinates(
        coordinatesArray,
        privateKey,
        password,
      );

      if (!revertedSeedPhrase) {
        modalStore.setModal({
          type: 'error',
          title: 'Error',
          message:
            'Failed to revert seed phrase. Please check if your private key and password are correct.',
        });
        return;
      }

      setRevertedSeedPhrase(revertedSeedPhrase);
    } else {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'Private key, password, and coordinates are required.',
      });
    }
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      modalStore.clearModal();

      modalStore.setModal({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Text copied to clipboard successfully.',
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (!coordinates) return;

    modalStore.setModal({
      title: 'Coordinates Generated',
      message: (
        <>
          <AlertMessage
            status="warning"
            message="Make sure to try to revert the coordinates to verify that they are correct!"
          />

          <p className="mt-4 mb-4">
            Your BIP39 coordinates have been generated successfully.
          </p>
          <p className="mb-4">Click on it to copy.</p>
          <Kbd onClick={() => handleCopyToClipboard(coordinates.join(', '))}>
            {coordinates.join(', ')}
          </Kbd>
        </>
      ),
      type: 'info',
    });
  }, [coordinates]);

  useEffect(() => {
    if (!revertedSeedPhrase) return;

    modalStore.setModal({
      title: 'Seed Phrase Reverted',
      message: (
        <>
          <AlertMessage
            status="warning"
            message="If this seed phrase is not the one you expected, please check your private key and password."
          />

          <p className="mt-4 mb-4">
            Your seed phrase has been reverted successfully.
          </p>

          <p className="mb-4">Click on it to copy.</p>
          <Kbd onClick={() => handleCopyToClipboard(revertedSeedPhrase)}>
            {revertedSeedPhrase}
          </Kbd>
        </>
      ),
      type: 'info',
    });
  }, [revertedSeedPhrase]);

  const onLoadKeyFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files || e.target.files.length === 0) {
      modalStore.setModal({
        type: 'error',
        title: 'Error',
        message: 'Please select a valid private key file.',
      });
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result?.toString();
      if (result) {
        setPrivateKey(result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card className="p-5">
      <AlertMessage
        status="warning"
        message="This tool generates BIP39 coordinates from a seed phrase, private key, and password. 
                 MAKE SURE TO TRY TO REVERT THE COORDINATES TO VERIFY THAT THEY ARE CORRECT! If you misspell your password or try a different key, you'll get different results."
      />

      <FileInputWithLabel
        labelText="Select your private key file:"
        className="mb-4 mt-4"
        accept=".key"
        placeholder='Select a ".key" file'
        onChange={onLoadKeyFile}
      />
      <Input
        type="password"
        placeholder="Enter your private key password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full"
      />

      <div className="mb-2 mt-4">
        <Radio
          name="action"
          value="generate"
          checked={action === 'generate'}
          onChange={() => setAction('generate')}
        />
        <label className="ml-2">Generate Coordinates</label>
        <Radio
          name="action"
          value="revert"
          checked={action === 'revert'}
          onChange={() => setAction('revert')}
          className="ml-4"
        />
        <label className="ml-2">Revert Coordinates</label>
      </div>

      <Divider />

      {action === 'generate' && (
        <>
          <Input
            type="text"
            placeholder="Enter your seed phrase"
            value={seedPhrase}
            onChange={(e) => setSeedPhrase(e.target.value)}
            className="mb-4 w-full"
          />

          <Button onClick={handleGenerateCoordinates} variant="outline">
            Generate Coordinates
          </Button>
        </>
      )}

      {action === 'revert' && (
        <>
          <Input
            type="text"
            placeholder="Enter your BIP39 coordinates"
            value={inputCoordinates}
            onChange={(e) => setInputCoordinates(e.target.value)}
            className="mb-4 w-full"
          />

          <Button onClick={handleRevertCoordinates} variant="outline">
            Revert Coordinates
          </Button>
        </>
      )}
    </Card>
  );
};
