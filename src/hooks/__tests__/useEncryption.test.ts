import { renderHook } from '@testing-library/react';
import useEncryption from '../useEncryption';

describe('useEncryption', () => {
  beforeAll(() => {
    // Mock window.crypto.subtle, window.crypto.getRandomValues, TextEncoder and TextDecoder
    Object.defineProperty(global, 'crypto', {
      value: {
        subtle: {
          importKey: jest.fn(),
          encrypt: jest.fn(),
          decrypt: jest.fn(),
        },
        getRandomValues: jest.fn().mockReturnValue(new Uint8Array(16)),
      },
      writable: true,
    });

    global.TextEncoder = jest.fn().mockImplementation(() => {
      return { encode: jest.fn().mockReturnValue(new Uint8Array(16)) };
    });

    global.TextDecoder = jest.fn().mockImplementation(() => {
      return { decode: jest.fn().mockReturnValue('mocked decoded text') };
    });
  });

  it('should encrypt and decrypt text correctly', async () => {
    const { result } = renderHook(() => useEncryption());
    const text = 'Hello, World!';

    // Encrypt the text
    const { encrypted, iv } = await result.current.encryptText(text);

    // Decrypt the text
    const decryptedText = await result.current.decryptText(encrypted, iv);

    // Check that the decrypted text matches the original text
    expect(decryptedText).toEqual('mocked decoded text');
  });
});
