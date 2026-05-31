import { colorToCss, pathToSvgD } from "../../core/geometry/pathOps";
import type { VectorShape } from "../../core/types/primitives";

interface PathRendererProps {
  shape: VectorShape;
}

export const PathRenderer = ({ shape }: PathRendererProps) => (
  <path
    d={pathToSvgD(shape.path)}
    fill={colorToCss(shape.style.fill, "rgba(255,255,255,0.18)")}
    stroke={colorToCss(shape.style.stroke, "rgba(255,255,255,0.88)")}
    strokeWidth={shape.style.strokeWidth ?? 1.5}
    vectorEffect="non-scaling-stroke"
  />
);
