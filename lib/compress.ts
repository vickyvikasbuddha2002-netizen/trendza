export interface CompressedImage {
  blob: Blob;
  w: number;
  h: number;
}

/**
 * Shrink a phone photo before it ever touches the network.
 *
 * A typical 4000x3000 phone shot is 3-8MB. At 1600px on the long edge
 * and WebP q0.82 it lands around 150-300KB with no visible loss at the
 * sizes we display. Uploading six untouched originals over 4G is the
 * single biggest reason someone abandons the flow halfway.
 */
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82,
): Promise<CompressedImage> {
  const bitmap = await loadBitmap(file);

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get a 2D canvas context");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  if ("close" in bitmap) bitmap.close();

  const blob = await encode(canvas, quality);
  return { blob, w, h };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // `from-image` applies the EXIF orientation flag, otherwise portrait
  // shots from iPhones arrive sideways.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Safari has historically rejected the options bag; fall through.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("That file could not be read as an image"));
      img.src = url;
    });
  } finally {
    // The bitmap is already decoded into the element by the time we revoke.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) return resolve(blob);
        // Ancient browsers without WebP encoding.
        canvas.toBlob(
          (jpeg) =>
            jpeg ? resolve(jpeg) : reject(new Error("Could not compress that image")),
          "image/jpeg",
          quality,
        );
      },
      "image/webp",
      quality,
    );
  });
}
