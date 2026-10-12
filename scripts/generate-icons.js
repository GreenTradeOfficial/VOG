import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to calculate CRC32 for PNG chunks
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createPngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crcData = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

function encodeRGBAtoPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // Raw Scanlines with Filter type 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    scanlines[rowStart] = 0; // None filter
    const srcStart = y * width * 4;
    rgbaBuffer.copy(scanlines, rowStart + 1, srcStart, srcStart + width * 4);
  }

  const idatCompressed = zlib.deflateSync(scanlines, { level: 9 });
  const idatChunk = createPngChunk('IDAT', idatCompressed);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw church emblem on RGBA buffer
function renderChurchIcon(size, isMaskable = false) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const scale = isMaskable ? 0.72 : 0.88;
  const r = (size / 2) * scale;

  // Background deep navy blue
  const bgR = 11, bgG = 37, bgB = 69; // #0B2545
  // Royal blue accent
  const royalR = 29, royalG = 78, royalB = 216; // #1D4ED8
  // Gold accent
  const goldR = 245, goldG = 158, goldB = 11; // #F59E0B
  // Red accent
  const redR = 220, redG = 38, redB = 38; // #DC2626
  // Pure white
  const whiteR = 255, whiteG = 255, whiteB = 255;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Full square background for maskable icon
        buf[idx] = bgR;
        buf[idx + 1] = bgG;
        buf[idx + 2] = bgB;
        buf[idx + 3] = 255;
      } else {
        // Circular rounded icon with subtle anti-aliasing
        if (dist > r + 1) {
          buf[idx] = 0;
          buf[idx + 1] = 0;
          buf[idx + 2] = 0;
          buf[idx + 3] = 0;
          continue;
        } else if (dist > r) {
          const alpha = Math.max(0, Math.min(255, Math.round((1 - (dist - r)) * 255)));
          buf[idx] = bgR;
          buf[idx + 1] = bgG;
          buf[idx + 2] = bgB;
          buf[idx + 3] = alpha;
          continue;
        } else {
          buf[idx] = bgR;
          buf[idx + 1] = bgG;
          buf[idx + 2] = bgB;
          buf[idx + 3] = 255;
        }
      }

      // Outer gold ring
      const ringOuter = r * 0.94;
      const ringInner = r * 0.86;
      if (dist <= ringOuter && dist >= ringInner) {
        buf[idx] = goldR;
        buf[idx + 1] = goldG;
        buf[idx + 2] = goldB;
        buf[idx + 3] = 255;
      }

      // Middle royal blue ring
      const innerRingOuter = r * 0.84;
      const innerRingInner = r * 0.80;
      if (dist <= innerRingOuter && dist >= innerRingInner) {
        buf[idx] = royalR;
        buf[idx + 1] = royalG;
        buf[idx + 2] = royalB;
        buf[idx + 3] = 255;
      }

      // Sacred Cross Design in Center
      // Vertical cross bar
      const crossWidth = r * 0.18;
      const crossHeight = r * 0.95;
      const crossTop = cy - crossHeight * 0.55;
      const crossBottom = cy + crossHeight * 0.45;

      const inVerticalBar = Math.abs(x - cx) <= crossWidth / 2 && y >= crossTop && y <= crossBottom;

      // Horizontal cross beam
      const beamHeight = r * 0.18;
      const beamWidth = r * 0.72;
      const beamY = cy - crossHeight * 0.18;
      const inHorizontalBeam = Math.abs(y - beamY) <= beamHeight / 2 && Math.abs(x - cx) <= beamWidth / 2;

      // Grace Vessel / Chalice curve at base
      const vesselY = cy + crossHeight * 0.22;
      const vesselRadius = r * 0.38;
      const inVesselCurve = y >= vesselY && y <= crossBottom && Math.abs(dx) <= (vesselRadius * (1 - (y - vesselY) / (crossBottom - vesselY + 1) * 0.4));

      // Golden rays / starburst behind the cross
      const inRays = (Math.abs(dx - dy) < r * 0.04 || Math.abs(dx + dy) < r * 0.04) && dist < r * 0.75 && dist > r * 0.25;

      if (inRays) {
        buf[idx] = goldR;
        buf[idx + 1] = goldG;
        buf[idx + 2] = goldB;
        buf[idx + 3] = 180;
      }

      // Render Red Grace flame at top of cross
      const flameCx = cx;
      const flameCy = crossTop - r * 0.08;
      const distFlame = Math.sqrt((x - flameCx) * (x - flameCx) * 2 + (y - flameCy) * (y - flameCy));
      if (distFlame <= r * 0.12 && y <= crossTop + r * 0.02) {
        buf[idx] = redR;
        buf[idx + 1] = redG;
        buf[idx + 2] = redB;
        buf[idx + 3] = 255;
      }

      // Render Cross & Vessel
      if (inVerticalBar || inHorizontalBeam) {
        // Golden highlight on edge, white core
        const isCore = inVerticalBar ? (Math.abs(x - cx) <= crossWidth * 0.3) : (Math.abs(y - beamY) <= beamHeight * 0.3);
        if (isCore) {
          buf[idx] = whiteR;
          buf[idx + 1] = whiteG;
          buf[idx + 2] = whiteB;
          buf[idx + 3] = 255;
        } else {
          buf[idx] = goldR;
          buf[idx + 1] = goldG;
          buf[idx + 2] = goldB;
          buf[idx + 3] = 255;
        }
      } else if (inVesselCurve) {
        buf[idx] = goldR;
        buf[idx + 1] = goldG;
        buf[idx + 2] = goldB;
        buf[idx + 3] = 230;
      }
    }
  }

  return encodeRGBAtoPNG(size, size, buf);
}

// Ensure public directory exists
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
console.log('Generating PWA icons...');
const icon192 = renderChurchIcon(192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);
console.log('Generated pwa-192x192.png');

const icon512 = renderChurchIcon(512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);
console.log('Generated pwa-512x512.png');

const iconMaskable512 = renderChurchIcon(512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable512);
console.log('Generated pwa-maskable-512x512.png');

const appleTouchIcon = renderChurchIcon(180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
console.log('Generated apple-touch-icon.png');

// Also generate SVG favicon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="vogNavy" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#133E87"/>
      <stop offset="100%" stop-color="#0B2545"/>
    </radialGradient>
    <linearGradient id="vogGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="22" fill="url(#vogNavy)"/>
  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#vogGold)" stroke-width="2.5" opacity="0.8"/>
  <!-- Cross -->
  <rect x="46" y="16" width="8" height="52" rx="2" fill="#FFFFFF"/>
  <rect x="28" y="28" width="44" height="8" rx="2" fill="#FFFFFF"/>
  <!-- Red Flame Accent -->
  <path d="M 50 10 C 46 14, 46 18, 50 20 C 54 18, 54 14, 50 10 Z" fill="#DC2626"/>
  <!-- Grace Vessel base -->
  <path d="M 32 64 Q 50 78 68 64 L 62 72 Q 50 82 38 72 Z" fill="url(#vogGold)"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('Generated favicon.svg');
