# StampFlow — Tampon dateur & signature PDF (100% client-side)

Application SaaS permettant d'apposer un tampon dateur personnalisé sur un
PDF, entièrement dans le navigateur. Aucun fichier n'est jamais envoyé à un
serveur : lecture, rendu de l'aperçu et génération du fichier final se font
avec `pdf.js` et `pdf-lib` côté client.

## Stack

- **Next.js 14** (App Router) + React 18 + TypeScript
- **Tailwind CSS** pour l'interface
- **pdf-lib** pour l'incrustation du tampon et l'export du PDF final
- **pdfjs-dist** pour le rendu de la prévisualisation de la première page
- **lucide-react** pour les icônes

## Installation

```bash
npx create-next-app@14.2.35 pdf-stamp-saas --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*"
cd pdf-stamp-saas
npm install pdf-lib pdfjs-dist@4.6.82 lucide-react
```

> Si vous clonez directement ce dépôt (recommandé), passez cette étape et
> lancez simplement :

```bash
npm install
```

## Lancer en local

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
app/
  layout.tsx        → Layout racine + métadonnées SEO
  page.tsx           → Bascule entre UploadZone et PdfEditor
  globals.css         → Directives Tailwind + styles globaux
components/
  UploadZone.tsx      → Écran d'accueil avec zone drag-and-drop
  PdfEditor.tsx        → Studio d'édition (aperçu + positionnement + panneau)
  StampPanel.tsx        → Panneau de configuration du tampon
lib/
  types.ts             → Types partagés (StampConfig, LoadedPdf, couleurs...)
  pdfRender.ts          → Rendu de la page 1 sur un <canvas> via pdfjs-dist
  pdfStamp.ts            → Incrustation du tampon avec pdf-lib + téléchargement
```

## Fonctionnement du positionnement

1. La première page du PDF est rendue sur un `<canvas>` via `pdfjs-dist`.
2. Un clic sur le canvas calcule une position **relative** (`xRatio`,
   `yRatio` entre 0 et 1), indépendante du niveau de zoom d'affichage.
3. Lors de l'export, `pdf-lib` reconvertit ce ratio en coordonnées PDF
   réelles (en points, origine en bas à gauche) pour dessiner le texte et le
   cadre du tampon directement sur la page — le tampon est donc nativement
   "aplati" dans le contenu du PDF (pas de calque, pas de champ de
   formulaire).

## Déploiement sur Vercel

1. Poussez ce projet sur un dépôt GitHub.
2. Sur [vercel.com](https://vercel.com), cliquez sur **New Project** et
   importez le dépôt.
3. Vercel détecte automatiquement Next.js — aucune variable d'environnement
   n'est nécessaire (l'application n'a pas de backend).
4. Cliquez sur **Deploy**.

Ou en une commande, avec la CLI Vercel :

```bash
npm install -g vercel
vercel --prod
```

## Limites connues / pistes d'évolution

- Seule la première page est prévisualisée pour le positionnement (le
  tampon peut néanmoins être dupliqué sur toutes les pages via l'option
  dédiée du panneau).
- Un seul tampon à la fois — relancer un clic déplace le tampon existant.
- Pour une signature manuscrite (dessin libre), on pourrait ajouter un
  `<canvas>` de signature (type `signature_pad`) et l'intégrer comme image
  PNG via `pdfDoc.embedPng()` dans `lib/pdfStamp.ts`.
