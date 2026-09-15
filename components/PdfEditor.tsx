"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, MousePointerClick, Stamp } from "lucide-react";
import StampPanel from "./StampPanel";
import { renderFirstPageToCanvas } from "@/lib/pdfRender";
import { applyStampAndDownload, formatStampDate } from "@/lib/pdfStamp";
import { STAMP_COLORS, type LoadedPdf, type StampConfig } from "@/lib/types";

type PdfEditorProps = {
  loadedPdf: LoadedPdf;
  onResetFile: () => void;
};

const DEFAULT_CONFIG: StampConfig = {
  label: "Reçu le",
  includeTime: true,
  includeBorder: true,
  applyToAllPages: false,
  fontSize: 16,
  color: STAMP_COLORS[0],
  position: null,
};

export default function PdfEditor({ loadedPdf, onResetFile }: PdfEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [config, setConfig] = useState<StampConfig>(DEFAULT_CONFIG);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!canvasRef.current) return;
      setIsRendering(true);
      setRenderError(null);
      try {
        const targetWidth = Math.min(
          720,
          Math.max(320, (containerRef.current?.clientWidth ?? 720) - 48)
        );
        const result = await renderFirstPageToCanvas(
          loadedPdf.bytes,
          canvasRef.current,
          targetWidth
        );
        if (!cancelled) {
          setCanvasSize({
            width: result.canvasWidth,
            height: result.canvasHeight,
          });
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setRenderError(
            "Impossible d'afficher l'aperçu de ce PDF. Le fichier est peut-être corrompu ou protégé."
          );
        }
      } finally {
        if (!cancelled) setIsRendering(false);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedPdf]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      if (
        clickX < 0 ||
        clickY < 0 ||
        clickX > rect.width ||
        clickY > rect.height
      ) {
        return;
      }
      const xRatio = clickX / rect.width;
      const yRatio = clickY / rect.height;
      setConfig((prev) => ({ ...prev, position: { xRatio, yRatio } }));
    },
    []
  );

  const handleApply = useCallback(async () => {
    setApplyError(null);
    setIsApplying(true);
    try {
      await applyStampAndDownload(
        loadedPdf.bytes,
        config,
        loadedPdf.file.name
      );
    } catch (err) {
      console.error(err);
      setApplyError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la génération du PDF."
      );
    } finally {
      setIsApplying(false);
    }
  }, [config, loadedPdf]);

  const previewDateText = formatStampDate(config.includeTime);
  const overlayLeft = config.position ? config.position.xRatio * canvasSize.width : 0;
  const overlayTop = config.position ? config.position.yRatio * canvasSize.height : 0;

  return (
    <div className="flex h-screen w-full flex-col lg:flex-row">
      {/* Zone de prévisualisation */}
      <div
        ref={containerRef}
        className="flex flex-1 flex-col items-center overflow-y-auto bg-slate-100 px-6 py-8"
      >
        <div className="mb-4 flex w-full max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Stamp className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-medium">Aperçu — page 1</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-soft">
            <MousePointerClick className="h-3.5 w-3.5" />
            Cliquez pour placer le tampon
          </div>
        </div>

        {renderError ? (
          <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-sm font-medium text-red-700">{renderError}</p>
          </div>
        ) : (
          <div
            className="relative select-none overflow-hidden rounded-xl bg-white shadow-card"
            style={{
              width: canvasSize.width || undefined,
              height: canvasSize.height || undefined,
              minWidth: isRendering ? 320 : undefined,
              minHeight: isRendering ? 420 : undefined,
            }}
            onClick={handleCanvasClick}
          >
            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              </div>
            )}
            <canvas ref={canvasRef} className="block cursor-crosshair" />

            {config.position && !isRendering && (
              <div
                className="pointer-events-none absolute animate-fade-in rounded-md border-2 bg-white/95 px-2.5 py-1.5 shadow-md"
                style={{
                  left: overlayLeft,
                  top: overlayTop,
                  borderColor: config.color.hex,
                  borderWidth: config.includeBorder ? 2 : 0,
                }}
              >
                <p
                  className="whitespace-nowrap font-bold leading-tight"
                  style={{
                    color: config.color.hex,
                    fontSize: Math.max(config.fontSize * 0.75, 10),
                  }}
                >
                  {config.label || " "}
                </p>
                <p
                  className="mt-0.5 whitespace-nowrap leading-tight"
                  style={{
                    color: config.color.hex,
                    fontSize: Math.max(config.fontSize * 0.6, 8),
                  }}
                >
                  {previewDateText}
                </p>
              </div>
            )}
          </div>
        )}

        {applyError && (
          <p className="mt-4 max-w-md rounded-lg bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-600">
            {applyError}
          </p>
        )}
      </div>

      {/* Panneau de configuration */}
      <div className="w-full flex-shrink-0 lg:w-[360px]">
        <StampPanel
          fileName={loadedPdf.file.name}
          numPages={loadedPdf.numPages}
          config={config}
          onConfigChange={setConfig}
          onApply={handleApply}
          onResetFile={onResetFile}
          isApplying={isApplying}
          hasPosition={!!config.position}
        />
      </div>
    </div>
  );
}
