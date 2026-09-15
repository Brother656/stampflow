"use client";

import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import type { StampConfig } from "./types";

const PADDING = 10;
const LINE_GAP = 4;

export function formatStampDate(includeTime: boolean): string {
  const now = new Date();
  const datePart = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (!includeTime) return datePart;
  const timePart = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} à ${timePart}`;
}

function drawStampOnPage(
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  config: StampConfig,
  dateText: string
) {
  const { width, height } = page.getSize();
  const { position, label, fontSize, color, includeBorder } = config;
  if (!position) return;

  const labelSize = fontSize;
  const dateSize = Math.max(fontSize - 3, 8);

  const labelWidth = boldFont.widthOfTextAtSize(label || " ", labelSize);
  const dateWidth = regularFont.widthOfTextAtSize(dateText, dateSize);
  const contentWidth = Math.max(labelWidth, dateWidth);

  const boxWidth = contentWidth + PADDING * 2;
  const boxHeight = labelSize + dateSize + LINE_GAP + PADDING * 2;

  // Le clic utilisateur correspond au coin supérieur gauche visuel du tampon.
  const clickX = position.xRatio * width;
  const clickY = height - position.yRatio * height;

  // On garde le tampon dans les limites de la page.
  const boxX = Math.min(Math.max(clickX, 0), Math.max(width - boxWidth, 0));
  const boxTopY = Math.min(Math.max(clickY, boxHeight), height);
  const boxY = boxTopY - boxHeight;

  const [r, g, b] = color.rgb;
  const stampColor = rgb(r, g, b);

  if (includeBorder) {
    page.drawRectangle({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      borderColor: stampColor,
      borderWidth: 1.5,
      color: rgb(1, 1, 1),
      opacity: 0.92,
      borderOpacity: 1,
    });
  }

  page.drawText(label || " ", {
    x: boxX + PADDING,
    y: boxY + boxHeight - PADDING - labelSize,
    size: labelSize,
    font: boldFont,
    color: stampColor,
  });

  page.drawText(dateText, {
    x: boxX + PADDING,
    y: boxY + PADDING,
    size: dateSize,
    font: regularFont,
    color: stampColor,
  });
}

/**
 * Incruste définitivement le tampon dans le PDF (texte + éventuel cadre),
 * ce qui le rend natif au document — pas de calque ni de champ de
 * formulaire éditable, donc directement "aplati".
 */
export async function applyStampAndDownload(
  bytes: ArrayBuffer,
  config: StampConfig,
  originalFileName: string
): Promise<void> {
  if (!config.position) {
    throw new Error(
      "Aucune position n'a été définie pour le tampon. Cliquez sur le document."
    );
  }

  const pdfDoc = await PDFDocument.load(bytes.slice(0));
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const dateText = formatStampDate(config.includeTime);

  const pages = config.applyToAllPages
    ? pdfDoc.getPages()
    : [pdfDoc.getPages()[0]];
  for (const page of pages) {
    drawStampOnPage(page, boldFont, regularFont, config, dateText);
  }

  const outBytes = await pdfDoc.save();
  const blob = new Blob([outBytes.buffer.slice(0) as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);

  const baseName = originalFileName.replace(/\.pdf$/i, "");
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName}-tamponne.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
