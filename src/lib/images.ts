// Validasi & sniffing gambar dari byte aslinya (bukan dari nama file / MIME browser).

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export type ImageInfo = { mime: string; ext: string; width: number | null; height: number | null };

export function sniffImage(bytes: Uint8Array): ImageInfo | null {
  const b = bytes;
  const ascii = (start: number, len: number) => String.fromCharCode(...b.subarray(start, start + len));
  if (b.length < 12) return null;

  // PNG
  if (b[0] === 0x89 && ascii(1, 3) === "PNG") {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    return { mime: "image/png", ext: "png", width: dv.getUint32(16), height: dv.getUint32(20) };
  }
  // JPEG
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg", ...jpegSize(b) };
  }
  // GIF
  if (ascii(0, 4) === "GIF8") {
    return { mime: "image/gif", ext: "gif", width: b[6] | (b[7] << 8), height: b[8] | (b[9] << 8) };
  }
  // WebP
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return { mime: "image/webp", ext: "webp", ...webpSize(b) };
  }
  // AVIF (ISO BMFF dengan brand avif/avis)
  if (ascii(4, 4) === "ftyp" && /avi[fs]/.test(ascii(8, 4) + ascii(16, 16))) {
    return { mime: "image/avif", ext: "avif", width: null, height: null };
  }
  return null;
}

function jpegSize(b: Uint8Array): { width: number | null; height: number | null } {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    const len = (b[i + 2] << 8) | b[i + 3];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: (b[i + 5] << 8) | b[i + 6], width: (b[i + 7] << 8) | b[i + 8] };
    }
    if (len < 2) break;
    i += 2 + len;
  }
  return { width: null, height: null };
}

function webpSize(b: Uint8Array): { width: number | null; height: number | null } {
  const chunk = String.fromCharCode(...b.subarray(12, 16));
  if (chunk === "VP8 " && b.length >= 30) {
    return { width: (b[26] | (b[27] << 8)) & 0x3fff, height: (b[28] | (b[29] << 8)) & 0x3fff };
  }
  if (chunk === "VP8L" && b.length >= 25) {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X" && b.length >= 30) {
    return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
  }
  return { width: null, height: null };
}
