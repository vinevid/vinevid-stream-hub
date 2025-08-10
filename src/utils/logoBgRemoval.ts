import { pipeline, env } from "@huggingface/transformers";

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement
) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

export const getTransparentLogo = async (imageUrl: string): Promise<string> => {
  const cacheKey = "vinevid_logo_transparent_v1";
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageUrl;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  resizeImageIfNeeded(canvas, ctx, img);

  const imageData = canvas.toDataURL("image/png", 1.0);

  const segmenter = await pipeline(
    "image-segmentation",
    "Xenova/segformer-b0-finetuned-ade-512-512",
    { device: "webgpu" }
  );

  const result = await segmenter(imageData);
  if (!result || !Array.isArray(result) || !result[0]?.mask) {
    throw new Error("Invalid segmentation result");
  }

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) throw new Error("Could not get output canvas context");

  outputCtx.drawImage(canvas, 0, 0);
  const outData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  const data = outData.data;

  for (let i = 0; i < result[0].mask.data.length; i++) {
    const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
    data[i * 4 + 3] = alpha;
  }
  outputCtx.putImageData(outData, 0, 0);

  const final = outputCanvas.toDataURL("image/png", 1.0);
  localStorage.setItem(cacheKey, final);
  return final;
};
