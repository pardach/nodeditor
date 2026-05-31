import { describe, expect, it } from "vitest";
import { pathToSvgD, rectanglePath, shapeFromPath, transformGeometry, transformPath } from "./pathOps";

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

  it("composes affine transforms in scale, rotate, translate order", () => {
    const path = {
      id: "curve",
      closed: true,
      commands: [
        { kind: "move" as const, to: { x: 1, y: 2 } },
        {
          kind: "cubic" as const,
          cp1: { x: 0, y: 0 },
          cp2: { x: 1, y: 0 },
          to: { x: 1, y: 1 },
        },
        { kind: "close" as const },
      ],
    };

    const transformed = transformPath(path, {
      translate: { x: 10, y: -5 },
      scale: { x: 2, y: 3 },
      rotate: 90,
    });

    expect(pathToSvgD(transformed)).toBe("M 4 -3 C 10 -5 10 -3 7 -3 Z");
  });
});
