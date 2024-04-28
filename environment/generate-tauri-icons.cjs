/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const png2icons = require('png2icons');
const { exec } = require('child_process');

const iconSourcePath = './resources/icon.png';
const iconDestinationPath = './src-tauri/icons';

const icons = [
  '128x128@2x',
  '128x128',
  '32x32',
  'Square107x107Logo',
  'Square142x142Logo',
  'Square150x150Logo',
  'Square30x30Logo',
  'Square310x310Logo',
  'Square44x44Logo',
  'Square71x71Logo',
  'Square89x89Logo',
  'StoreLogo',
  'Square284x284Logo',
];

async function copyIcons() {
  if (!fs.existsSync(iconDestinationPath)) {
    fs.mkdirSync(iconDestinationPath, { recursive: true });
  }

  const input = fs.readFileSync(iconSourcePath);

  // generate ICNS
  const output = png2icons.createICNS(input, png2icons.BILINEAR_RESIZE);
  if (output) {
    fs.writeFileSync(path.join(iconDestinationPath, 'icon.icns'), output);
  }

  await Promise.all(
    icons.map(async (icon) => {
      let size;
      if (icon === 'StoreLogo') {
        size = 256; // size of the StoreLogo
      } else {
        const sizeMatch = icon.match(/\d+/);
        size = sizeMatch ? parseInt(sizeMatch[0]) : null;
      }

      if (size) {
        await sharp(iconSourcePath)
          .resize(size, size)
          .png()
          .toFile(path.join(iconDestinationPath, `${icon}.png`));
      }
    }),
  );

  // Also copy the original icon as icon.png and icon.ico
  fs.copyFileSync(iconSourcePath, path.join(iconDestinationPath, 'icon.png'));

  // Convert png to ico for Windows icon
  await sharp(iconSourcePath)
    .resize(256, 256) // for ICO, it's common to use 256x256
    .toFile(path.join(iconDestinationPath, 'icon.ico'));
}

copyIcons();

function generateIcons() {
  if (!fs.existsSync(iconDestinationPath)) {
    fs.mkdirSync(iconDestinationPath, { recursive: true });
  }

  exec(
    `tauri icon ${iconSourcePath} -o ${iconDestinationPath}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`${stdout}`);
      console.log('Icons generated successfully');
    },
  );
}

generateIcons();
