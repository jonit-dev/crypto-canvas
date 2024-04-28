# Getting Started

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
