"use client";

import { useCallback, useState } from "react";
import { PDFDocument } from "pdf-lib";
import UploadZone from "@/components/UploadZone";
import PdfEditor from "@/components/PdfEditor";
import type { LoadedPdf } from "@/lib/types";

const MAX_FILE_SIZE_MB = 30;

export default function Home() {
  const [loadedPdf, setLoadedPdf] = useState<LoadedPdf | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const handleFileSelected = useCallback(async (file: File) => {
    setErrorMessage(null);

    if (file.type !== "application/pdf") {
      setErrorMessage("Merci de sélectionner un fichier au format PDF.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(
        `Ce fichier dépasse la taille maximale autorisée (${MAX_FILE_SIZE_MB} Mo).`
      );
      return;
    }

    setIsLoadingFile(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes.slice(0), {
        ignoreEncryption: true,
      });

      if (pdfDoc.isEncrypted) {
        setErrorMessage(
          "Ce PDF est protégé par un mot de passe. Merci de le déverrouiller avant de le charger."
        );
        setIsLoadingFile(false);
        return;
      }

      const numPages = pdfDoc.getPageCount();
      if (numPages === 0) {
        setErrorMessage("Ce PDF ne contient aucune page exploitable.");
        setIsLoadingFile(false);
        return;
      }

      const firstPage = pdfDoc.getPage(0);
      const { width, height } = firstPage.getSize();

      setLoadedPdf({
        file,
        bytes,
        pageWidth: width,
        pageHeight: height,
        numPages,
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un PDF valide et non corrompu."
      );
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setLoadedPdf(null);
    setErrorMessage(null);
  }, []);

  if (loadedPdf) {
    return <PdfEditor loadedPdf={loadedPdf} onResetFile={handleReset} />;
  }

  return (
    <UploadZone
      onFileSelected={handleFileSelected}
      errorMessage={
        isLoadingFile ? "Analyse du fichier en cours..." : errorMessage
      }
    />
  );
}
