import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require('/Users/sisi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const input = new URL('../assets/neutral-plane-sheet.png', import.meta.url).pathname;
const meta = await sharp(input).metadata();
if (!meta.hasAlpha) throw new Error('The generated sprite sheet must have real transparency.');
const halves = [
  { name: 'city-plane-left', left: 0, width: Math.floor(meta.width / 2), box: [105, 88] },
  { name: 'city-plane-right', left: Math.floor(meta.width / 2), width: meta.width - Math.floor(meta.width / 2), box: [105, 80] },
];
for (const half of halves) {
  // Trim each isolated generated sprite, preserve alpha and aspect ratio.
  const isolated = await sharp(input)
    .extract({ left: half.left, top: 0, width: half.width, height: meta.height })
    .png().toBuffer();
  const trimmed = await sharp(isolated).trim({ threshold: 12 }).png().toBuffer();
  const sprite = await sharp(trimmed)
    .resize({ width: (half.box[0] - 10) * 3, height: (half.box[1] - 10) * 3, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: 15, bottom: 15, left: 15, right: 15, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  await writeFile(new URL(`../assets/parts/${half.name}.png`, import.meta.url), sprite);
}
console.log('Exported two ivory paper planes with the new top-view perspective; preserved genuine alpha.');
