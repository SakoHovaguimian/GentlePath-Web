import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import sharp from 'sharp';
import { gentlePathLandingStrings as copy } from '../src/strings.ts';

const root = new URL('../', import.meta.url);
const asset = (name) => new URL(`public/gentlepath/${name}`, root);
const icon = await readFile(asset('app-icon.svg'));
for (const [name, size] of [
  ['app-icon.png', 512],
  ['apple-touch-icon.png', 180],
  ['favicon-32.png', 32],
]) {
  await sharp(icon)
    .resize(size, size)
    .removeAlpha()
    .png()
    .toFile(fileURLToPath(asset(name)));
}

const dataImage = async (name) =>
  `data:image/png;base64,${(await readFile(asset(name))).toString('base64')}`;
const background = await dataImage('share-preview-art.png');
const mark = await dataImage('app-icon.png');
const image = new ImageResponse(
  h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#fffdf8',
        color: '#123e39',
        fontFamily: 'DM Sans',
      },
    },
    h('img', {
      src: background,
      width: 1200,
      height: 630,
      style: { position: 'absolute', inset: 0, objectFit: 'cover' },
    }),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: 68,
          top: 66,
          display: 'flex',
          alignItems: 'center',
          gap: 13,
        },
      },
      h('img', {
        src: mark,
        width: 62,
        height: 62,
        style: { borderRadius: 15 },
      }),
      h(
        'span',
        { style: { fontSize: 34, fontWeight: 600, letterSpacing: -1.5 } },
        copy.brandTitle,
      ),
    ),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: 68,
          top: 235,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 8,
        },
      },
      h(
        'span',
        {
          style: {
            fontFamily: 'Lora',
            fontSize: 65,
            letterSpacing: -2.5,
            lineHeight: 1.15,
          },
        },
        copy.metadata.previewHeading,
      ),
      h(
        'span',
        {
          style: {
            fontFamily: 'Lora',
            fontSize: 53,
            letterSpacing: -2,
            lineHeight: 1.25,
          },
        },
        copy.metadata.previewSupporting,
      ),
      h(
        'span',
        { style: { marginTop: 30, fontSize: 17, fontWeight: 600 } },
        copy.metadata.previewEyebrow,
      ),
    ),
  ),
  {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'DM Sans',
        data: await readFile(asset('fonts/dm-sans-600-normal.ttf')),
        weight: 600,
        style: 'normal',
      },
      {
        name: 'Lora',
        data: await readFile(asset('fonts/lora-400-normal.ttf')),
        weight: 400,
        style: 'normal',
      },
    ],
  },
);
await sharp(Buffer.from(await image.arrayBuffer()))
  .removeAlpha()
  .png()
  .toFile(fileURLToPath(asset('share-preview.png')));
console.log('Exported opaque app icons and the 1200 × 630 share preview.');
