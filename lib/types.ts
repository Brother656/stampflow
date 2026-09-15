export type StampColor = {
  label: string;
  hex: string;
  rgb: [number, number, number];
};

export const STAMP_COLORS: StampColor[] = [
  { label: "Bleu", hex: "#2563eb", rgb: [0.145, 0.388, 0.922] },
  { label: "Rouge", hex: "#dc2626", rgb: [0.863, 0.149, 0.149] },
  { label: "Vert", hex: "#16a34a", rgb: [0.086, 0.639, 0.29] },
  { label: "Noir", hex: "#111827", rgb: [0.067, 0.094, 0.153] },
];

export type StampPosition = {
  /** Position relative (0 à 1) sur la largeur de la page, calculée depuis le clic */
  xRatio: number;
  /** Position relative (0 à 1) sur la hauteur de la page, calculée depuis le clic */
  yRatio: number;
};

export type StampConfig = {
  label: string;
  includeTime: boolean;
  includeBorder: boolean;
  applyToAllPages: boolean;
  fontSize: number;
  color: StampColor;
  position: StampPosition | null;
};

export type LoadedPdf = {
  file: File;
  bytes: ArrayBuffer;
  pageWidth: number;
  pageHeight: number;
  numPages: number;
};
