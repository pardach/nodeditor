import { useMemo, useRef, useState } from "react";
import { saveAs } from "file-saver";
import type { EvaluationDiagnostic } from "../../core/types/graph";
import type { GeometryCollection } from "../../core/types/primitives";
import { geometryToSvgMarkup, svgMarkupToGeometry } from "../../core/serialization/svgGeometry";
import { PathRenderer } from "./PathRenderer";

interface VectorViewportProps {
  geometry: GeometryCollection;
  diagnostics: EvaluationDiagnostic[];
  documentTitle: string;
}

export const VectorViewport = ({ geometry, diagnostics, documentTitle }: VectorViewportProps) => {
  const [importedGeometry, setImportedGeometry] = useState<GeometryCollection | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeGeometry = importedGeometry ?? geometry;
  const activeDiagnostics = useMemo<EvaluationDiagnostic[]>(
    () => [
      ...diagnostics,
      ...importWarnings.map((message) => ({
        severity: "warning" as const,
        message,
      })),
    ],
    [diagnostics, importWarnings],
  );

  const exportSvg = () => {
    const svgMarkup = geometryToSvgMarkup(activeGeometry, `${documentTitle} export`);
    saveAs(
      new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }),
      `${slugifyFilename(documentTitle || "vector-output")}.svg`,
    );
  };

  const importSvg = async (file: File) => {
    const markup = await file.text();
    const result = svgMarkupToGeometry(markup);
    setImportedGeometry(result.geometry);
    setImportWarnings(result.warnings);
  };

  return (
    <div className="vector-viewport">
      <div className="vector-viewport__toolbar">
        <button type="button" onClick={() => void exportSvg()}>
          Export SVG
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Import SVG
        </button>
        {importedGeometry ? (
          <button
            type="button"
            onClick={() => {
              setImportedGeometry(null);
              setImportWarnings([]);
            }}
          >
            Back to graph output
          </button>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }
            void importSvg(file);
            event.target.value = "";
          }}
        />
      </div>
      <svg className="vector-viewport__svg" viewBox="-420 -300 840 600" role="img" aria-label="Evaluated vector output">
        <defs>
          <pattern id="viewport-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="-420" y="-300" width="840" height="600" fill="url(#viewport-grid)" />
        <line x1="-420" y1="0" x2="420" y2="0" className="axis-line" />
        <line x1="0" y1="-300" x2="0" y2="300" className="axis-line" />
        {activeGeometry.shapes.map((shape) => (
          <PathRenderer key={shape.id} shape={shape} />
        ))}
      </svg>
      {activeDiagnostics.length > 0 ? (
        <div className="diagnostics">
          {activeDiagnostics.slice(0, 4).map((diagnostic, index) => (
            <span key={`${diagnostic.message}:${index}`} className={`diagnostic diagnostic--${diagnostic.severity}`}>
              {diagnostic.message}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const slugifyFilename = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "vector-output";
