# Technical Details

## Encryption and Decryption

- **Encryption Algorithm**: The application uses AES-CBC (Advanced Encryption Standard - Cipher Block Chaining) for encryption and decryption.
- **Initialization Vector (IV)**: A 16-byte random IV is generated for each encryption operation.
- **Encryption Key**: A base64-encoded key is used for encryption and decryption. Ensure it's sufficiently long and random to maintain security.
- **Padding**: PKCS7 padding is applied to ensure the encrypted text aligns with block boundaries.

## Steganography

- **Embedding Encrypted Text**: The encrypted text and IV are combined with a delimiter and embedded into pixel data in an image.
- **Random Sequence Generation**: A unique sequence of pixel coordinates is generated using a string-based pixel key, ensuring variability and uniqueness.
- **Extraction Process**: The binary data is extracted based on the random sequence, then converted back to text for decryption.

## Additional Considerations

- **Performance**: The random sequence generation and binary conversion should be efficient to handle large images. Consider optimizing where possible.
- **Security Reviews**: Regularly review your security practices and ensure they align with best practices for encryption and steganography.
- **Compliance**: If using this application for sensitive data storage, ensure compliance with relevant regulations and security standards.
