import { describe, expect, it } from "vitest";
import { pathToSvgD, rectanglePath, transformGeometry, shapeFromPath } from "./pathOps";

describe("pathOps", () => {
  it("creates SVG path data for procedural rectangles", () => {
    const path = rectanglePath("rect", 100, 50);

    expect(pathToSvgD(path)).toBe("M -50 -25 L 50 -25 L 50 25 L -50 25 Z");
  });

  it("applies transforms to every path point", () => {
    const geometry = {
      shapes: [shapeFromPath("shape", rectanglePath("rect", 10, 10))],
    };

    const transformed = transformGeometry(geometry, {
      translate: { x: 5, y: -3 },
      scale: { x: 2, y: 1 },
      rotate: 0,
    });

    expect(pathToSvgD(transformed.shapes[0].path)).toBe("M -5 -8 L 15 -8 L 15 2 L -5 2 Z");
  });
});
