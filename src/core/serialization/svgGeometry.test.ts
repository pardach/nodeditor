import { describe, expect, test } from "vitest";
import { geometryToSvgMarkup, svgMarkupToGeometry } from "./svgGeometry";
import type { GeometryCollection } from "../types/primitives";

const geometry: GeometryCollection = {
  shapes: [
    {
      id: "shape:1",
      path: {
        id: "path:1",
        closed: true,
        commands: [
          { kind: "move", to: { x: 0, y: 0 } },
          { kind: "line", to: { x: 120, y: 0 } },
          { kind: "line", to: { x: 120, y: 80 } },
          { kind: "line", to: { x: 0, y: 80 } },
          { kind: "close" },
        ],
      },
      style: {
        fill: { r: 255, g: 0, b: 0, a: 0.4 },
        stroke: { r: 0, g: 0, b: 0, a: 1 },
        strokeWidth: 2,
      },
    },
  ],
};

describe("svgGeometry", () => {
  test("exports geometry as SVG markup", () => {
    const markup = geometryToSvgMarkup(geometry, "Export Title");

    expect(markup).toContain("<svg");
    expect(markup).toContain("<title>Export Title</title>");
    expect(markup).toContain("stroke-width=\"2\"");
    expect(markup).toContain("M 0 0 L 120 0 L 120 80 L 0 80 Z");
  });

  test("imports path geometry from SVG markup", () => {
    const markup = `
      <svg viewBox="0 0 100 100">
        <path d="M 0 0 L 40 0 L 40 40 Z" fill="#00ff00" stroke="rgba(0,0,255,0.5)" stroke-width="3" />
      </svg>
    `;

    const result = svgMarkupToGeometry(markup);

    expect(result.geometry.shapes).toHaveLength(1);
    expect(result.geometry.shapes[0].path.commands[0]).toMatchObject({ kind: "move", to: { x: 0, y: 0 } });
    expect(result.geometry.shapes[0].style.fill).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(result.geometry.shapes[0].style.strokeWidth).toBe(3);
  });

  test("reports warning when no path exists", () => {
    const result = svgMarkupToGeometry("<svg><g /></svg>");

    expect(result.geometry.shapes).toHaveLength(0);
    expect(result.warnings[0]).toContain("No importable <path>");
  });
});
