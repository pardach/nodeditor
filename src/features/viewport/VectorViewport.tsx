import type { EvaluationDiagnostic } from "../../core/types/graph";
import type { GeometryCollection } from "../../core/types/primitives";
import { PathRenderer } from "./PathRenderer";

interface VectorViewportProps {
  geometry: GeometryCollection;
  diagnostics: EvaluationDiagnostic[];
}

export const VectorViewport = ({ geometry, diagnostics }: VectorViewportProps) => (
  <div className="vector-viewport">
    <svg className="vector-viewport__svg" viewBox="-420 -300 840 600" role="img" aria-label="Evaluated vector output">
      <defs>
        <pattern id="viewport-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="-420" y="-300" width="840" height="600" fill="url(#viewport-grid)" />
      <line x1="-420" y1="0" x2="420" y2="0" className="axis-line" />
      <line x1="0" y1="-300" x2="0" y2="300" className="axis-line" />
      {geometry.shapes.map((shape) => (
        <PathRenderer key={shape.id} shape={shape} />
      ))}
    </svg>
    {diagnostics.length > 0 ? (
      <div className="diagnostics">
        {diagnostics.slice(0, 3).map((diagnostic, index) => (
          <span key={`${diagnostic.message}:${index}`} className={`diagnostic diagnostic--${diagnostic.severity}`}>
            {diagnostic.message}
          </span>
        ))}
      </div>
    ) : null}
  </div>
);
