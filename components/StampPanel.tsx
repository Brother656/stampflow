"use client";

import { Download, Loader2, MapPin, RotateCcw, Stamp } from "lucide-react";
import { STAMP_COLORS, type StampConfig } from "@/lib/types";

type StampPanelProps = {
  fileName: string;
  numPages: number;
  config: StampConfig;
  onConfigChange: (next: StampConfig) => void;
  onApply: () => void;
  onResetFile: () => void;
  isApplying: boolean;
  hasPosition: boolean;
};

export default function StampPanel({
  fileName,
  numPages,
  config,
  onConfigChange,
  onApply,
  onResetFile,
  isApplying,
  hasPosition,
}: StampPanelProps) {
  const update = <K extends keyof StampConfig>(key: K, value: StampConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-2 text-brand-600">
          <Stamp className="h-5 w-5" />
          <h2 className="text-base font-semibold text-slate-900">
            Studio de tamponnage
          </h2>
        </div>
        <p className="mt-1 truncate text-xs text-slate-500" title={fileName}>
          {fileName} · {numPages} page{numPages > 1 ? "s" : ""}
        </p>
      </div>

      <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {/* Texte du tampon */}
        <div>
          <label
            htmlFor="stamp-label"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Texte du tampon
          </label>
          <input
            id="stamp-label"
            type="text"
            value={config.label}
            onChange={(e) => update("label", e.target.value)}
            placeholder="Reçu le"
            maxLength={40}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-1 text-xs text-slate-400">
            La date et l&apos;heure actuelles seront ajoutées automatiquement en
            dessous.
          </p>
        </div>

        {/* Inclure l'heure */}
        <ToggleRow
          label="Inclure l'heure"
          description="Ajoute l'heure actuelle en plus de la date"
          checked={config.includeTime}
          onChange={(v) => update("includeTime", v)}
        />

        {/* Cadre visible */}
        <ToggleRow
          label="Afficher un cadre"
          description="Encadre le tampon d'une bordure colorée"
          checked={config.includeBorder}
          onChange={(v) => update("includeBorder", v)}
        />

        {/* Toutes les pages */}
        {numPages > 1 && (
          <ToggleRow
            label="Appliquer sur toutes les pages"
            description={`Le tampon sera dupliqué sur les ${numPages} pages, à la même position relative`}
            checked={config.applyToAllPages}
            onChange={(v) => update("applyToAllPages", v)}
          />
        )}

        {/* Couleur */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Couleur</p>
          <div className="flex gap-2">
            {STAMP_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => update("color", c)}
                title={c.label}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  config.color.hex === c.hex
                    ? "border-slate-900 ring-2 ring-offset-2 ring-slate-300"
                    : "border-white"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Taille de police */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="stamp-size"
              className="text-sm font-medium text-slate-700"
            >
              Taille du texte
            </label>
            <span className="text-xs text-slate-400">{config.fontSize}px</span>
          </div>
          <input
            id="stamp-size"
            type="range"
            min={10}
            max={28}
            step={1}
            value={config.fontSize}
            onChange={(e) => update("fontSize", Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </div>

        {/* Statut de positionnement */}
        <div
          className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${
            hasPosition
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            {hasPosition
              ? "Position définie. Cliquez ailleurs sur le document pour la déplacer."
              : "Cliquez sur l'aperçu du document pour positionner le tampon."}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-200 px-6 py-5">
        <button
          type="button"
          onClick={onApply}
          disabled={!hasPosition || isApplying}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isApplying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Appliquer et Télécharger
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onResetFile}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Charger un autre fichier
        </button>
      </div>
    </aside>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-brand-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  );
}
