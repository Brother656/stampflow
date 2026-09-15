"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, ShieldCheck, Stamp, Zap } from "lucide-react";

type UploadZoneProps = {
  onFileSelected: (file: File) => void;
  errorMessage: string | null;
};

export default function UploadZone({
  onFileSelected,
  errorMessage,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (file.type !== "application/pdf") {
        onFileSelected(file); // laisse le parent gérer le message d'erreur exact
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-medium text-brand-700">
          <Stamp className="h-4 w-4" />
          StampFlow
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Tamponnez vos PDF en quelques secondes
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">
          Ajoutez un tampon dateur ou une mention personnalisée sur vos
          documents. Tout se passe dans votre navigateur : vos fichiers ne
          quittent jamais votre appareil.
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`group flex w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-all duration-200 ${
          isDragging
            ? "border-brand-500 bg-brand-50 shadow-card"
            : "border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50/40 hover:shadow-soft"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
            isDragging ? "bg-brand-500 text-white" : "bg-brand-100 text-brand-600"
          }`}
        >
          <FileUp className="h-7 w-7" />
        </div>
        <p className="text-lg font-semibold text-slate-800">
          Glissez-déposez votre PDF ici
        </p>
        <p className="mt-1 text-sm text-slate-500">
          ou cliquez pour parcourir vos fichiers
        </p>
        <span className="mt-6 inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors group-hover:bg-brand-700">
          Choisir un fichier PDF
        </span>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        <Feature
          icon={<ShieldCheck className="h-5 w-5" />}
          title="100% confidentiel"
          description="Aucun envoi serveur : traitement local dans votre navigateur."
        />
        <Feature
          icon={<Stamp className="h-5 w-5" />}
          title="Tampon personnalisé"
          description="Texte libre, date et heure fusionnés automatiquement."
        />
        <Feature
          icon={<Zap className="h-5 w-5" />}
          title="Export instantané"
          description="Téléchargement immédiat du PDF final incrusté."
        />
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}
