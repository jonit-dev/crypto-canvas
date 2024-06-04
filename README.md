# Crypto Canvas

<img src="./src-tauri/icons/128x128@2x.png"
      alt="Crypto Canvas Logo"
      style="display: block; margin-left: auto; margin-right: auto; width: 25%;"/>

>

## Steganography-Based Encryption Application

This application allows you to hide encrypted messages within images using steganography. The hidden messages can be extracted and decrypted only with the correct encryption key and initialization vector (IV). This README describes the technical details, use cases, and the importance of key security.

## Table Of Contentes

- [Getting Started]()
- [Running Locally](./docs/running-locally.md)
- [Key Management](./docs/key_management.md)
- [Technical Details](./docs/technical_details.md)
- [Use Cases](./docs/use_cases.md)
- [Stealth](./docs/stealth.md)

## Best Practices

- **Test the secret extraction**
  - Ensure the application can extract the secret message correctly from the image.
- **DO NOT COMPRESS IMAGES**
  - Compressed images can distort the pixel data, affecting the embedded message's integrity. DO NOT COMPRESS images containing hidden messages. Careful with services like emails, whatsapp, telegram, etc because they'll compress the image transmitted.
    - One potential workaround is zipping the image before the upload (and then unzipping it on the other side).
- **Store keys safely**
  - Use the built-in generator to create your unique key and store it SEPARATELY from the image.
- **Limit Embedded Data Volume**
  - Embedding large amounts of data can lead to detectable patterns. Keep the volume low to maintain stealth.
- **Regularly Test for Detection**
  - Use statistical analysis tools to test the output images for anomalies or patterns. This helps identify potential issues early and improve the algorithm's stealth.

## Limitations

- **Image Compression**
  - Compressed images can distort the pixel data, affecting the embedded message's integrity. DO NOT COMPRESS images containing hidden messages.

## License

This project is licensed under the MIT License.
