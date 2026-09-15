"use client";

// Toute la logique de ce fichier s'exécute exclusivement dans le navigateur.
// pdfjs-dist est chargé dynamiquement pour éviter tout problème de SSR.

let pdfjsLibPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function getPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist").then((mod) => {
      // Le worker est chargé depuis un CDN plutôt que bundlé par webpack :
      // c'est un module ESM que le minifieur de Next.js ne sait pas traiter
      // correctement lorsqu'il est résolu localement via import.meta.url.
      mod.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${mod.version}/pdf.worker.min.mjs`;
      return mod;
    });
  }
  return pdfjsLibPromise;
}

export type RenderResult = {
  pageWidthPt: number;
  pageHeightPt: number;
  numPages: number;
  canvasWidth: number;
  canvasHeight: number;
};

/**
 * Charge un PDF depuis un ArrayBuffer, dessine la première page sur le
 * canvas fourni, et renvoie les dimensions utiles (en points PDF et en
 * pixels de canvas) pour le mapping des coordonnées de clic.
 */
export async function renderFirstPageToCanvas(
  bytes: ArrayBuffer,
  canvas: HTMLCanvasElement,
  targetWidthPx: number
): Promise<RenderResult> {
  const pdfjsLib = await getPdfjs();

  // pdfjs peut "détacher" le buffer transféré : on lui donne une copie.
  const bytesCopy = bytes.slice(0);
  const loadingTask = pdfjsLib.getDocument({ data: bytesCopy });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidthPx / baseViewport.width;
  const viewport = page.getViewport({ scale });

  const outputScale = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Impossible d'obtenir le contexte 2D du canvas.");
  }

  const transform =
    outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

  await page.render({
    canvasContext: context,
    viewport,
    transform,
  }).promise;

  return {
    pageWidthPt: baseViewport.width,
    pageHeightPt: baseViewport.height,
    numPages: pdf.numPages,
    canvasWidth: Math.floor(viewport.width),
    canvasHeight: Math.floor(viewport.height),
  };
}
