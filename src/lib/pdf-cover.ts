// Generate a cover thumbnail (JPEG blob) from the first page of a PDF file.
// Uses pdfjs-dist with a worker URL.
import * as pdfjsLib from "pdfjs-dist";
// Vite-compatible worker import
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export async function pdfFirstPageCover(file: File, maxWidth = 600): Promise<Blob | null> {
  if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) return null;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const scale = Math.min(maxWidth / viewport.width, 2);
  const scaled = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = scaled.width;
  canvas.height = scaled.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: scaled, canvas }).promise;
  return await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.82));
}
