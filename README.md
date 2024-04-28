# Crypto Canvas

<img src="./src-tauri/icons/128x128@2x.png"
      alt="Crypto Canvas Logo"
      style="display: block; margin-left: auto; margin-right: auto; width: 25%;"/>

>

## Steganography-Based Encryption Application

This application allows you to hide encrypted messages within images using steganography. The hidden messages can be extracted and decrypted only with the correct encryption key and initialization vector (IV). This README describes the technical details, use cases, and the importance of key security.

## Pre-requisites

- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)

## Installation

1. Clone the repository
2. Install dependencies

```bash
yarn install
```

## Development

To start the application in development mode, run:

```bash
yarn dev
```

## Build

To build the application for production, run:

```bash
yarn build
```

## Build binaries with Tauri

To build the application as a standalone binary using Tauri, run:

```bash
yarn tauri:build
```

PS: Please check the [Tauri documentation](https://tauri.app/v1/guides/getting-started/setup/) for platform-specific requirements.

### Tauri setup on Linux

1. **Install Node.js and Yarn**

Tauri is a toolkit for building desktop applications with web technologies. It requires Node.js and Yarn to be installed on your machine.

- Install Node.js from the official [Node.js website](https://nodejs.org/).
- Install Yarn using the npm package manager that comes with Node.js: `npm install -g yarn`.

2. **Install Rust**

Tauri uses Rust to build and package your application. Install Rust from the official [Rust website](https://www.rust-lang.org/tools/install).

3. **Install webkit2gtk**

Tauri uses the WebKit rendering engine to display your web application. On Linux, you need to install the `webkit2gtk` package.

- On Ubuntu/Debian: `sudo apt install libwebkit2gtk-4.0-dev`
- On Fedora: `sudo dnf install webkit2gtk3-devel`
- On Arch Linux: `sudo pacman -S webkit2gtk`

4. **Install Tauri**

Install the Tauri CLI globally with Yarn: `yarn global add @tauri-apps/cli`.

5. **Build the Tauri Application**

Navigate to your project's directory and run `yarn tauri:build`. This will build your Tauri application and package it into an executable.

If you encounter any issues, refer to the official [Tauri documentation](https://tauri.studio/en/docs/getting-started/intro) or the [Tauri GitHub repository](https://github.com/tauri-apps/tauri).

## Technical Details

### Encryption and Decryption

- **Encryption Algorithm**: The application uses AES-CBC (Advanced Encryption Standard - Cipher Block Chaining) for encryption and decryption.
- **Initialization Vector (IV)**: A 16-byte random IV is generated for each encryption operation.
- **Encryption Key**: A base64-encoded key is used for encryption and decryption. Ensure it's sufficiently long and random to maintain security.
- **Padding**: PKCS7 padding is applied to ensure the encrypted text aligns with block boundaries.

### Steganography

- **Embedding Encrypted Text**: The encrypted text and IV are combined with a delimiter and embedded into pixel data in an image.
- **Random Sequence Generation**: A unique sequence of pixel coordinates is generated using a string-based pixel key, ensuring variability and uniqueness.
- **Extraction Process**: The binary data is extracted based on the random sequence, then converted back to text for decryption.

## Use Cases

### Storing Seed Phrases

Steganography can be used to securely store seed phrases or sensitive information within images. The encrypted text can be hidden in innocent-looking family pictures or other images, providing an additional layer of security.

### Importance of Key Security

The encryption key and IV are critical for decrypting hidden messages. It's essential to store them in a secure location, separate from the image containing the hidden data. This ensures that even if someone detects the hidden message, they cannot decrypt it without the key.

### Example Use Case: Family Pictures and Secure Key Storage

Consider a scenario where you store family pictures on a pendrive, but one of the images contains a hidden seed phrase. To secure the encryption key, you store it on another pendrive, which you keep in a separate location, such as a safe or a hidden compartment. This approach ensures that even if someone finds the family pictures, they would need the key to decrypt the hidden message.

## Best Practices for Key Management

- **Secure Storage**: Store the encryption key in a secure location, such as a safe or a hidden compartment. Avoid exposing the key in public code or unsecured locations.
- **Separate Locations**: Keep the key separate from the image with the hidden message. This reduces the risk of unauthorized access to both the data and the key.
- **Regular Key Rotation**: Consider updating the encryption key periodically to maintain security and reduce the risk of key compromise.
- **Key Backup**: Ensure you have a secure backup of the encryption key in case of loss or damage.

## Additional Considerations

- **Performance**: The random sequence generation and binary conversion should be efficient to handle large images. Consider optimizing where possible.
- **Security Reviews**: Regularly review your security practices and ensure they align with best practices for encryption and steganography.
- **Compliance**: If using this application for sensitive data storage, ensure compliance with relevant regulations and security standards.

## Conclusion

This steganography-based application provides a secure way to hide encrypted messages within images. With proper key management and secure storage
