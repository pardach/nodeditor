import { colord } from "colord";
import { makeAbsolute, parseSVG, type CommandMadeAbsolute } from "svg-path-parser";
import { colorToCss, pathToSvgD } from "../geometry/pathOps";
import type { Color, GeometryCollection, PathCommand, Vec2, VectorStyle } from "../types/primitives";

const DEFAULT_VIEW_BOX = "-420 -300 840 600";

export interface SvgImportResult {
  geometry: GeometryCollection;
  warnings: string[];
}

export const geometryToSvgMarkup = (geometry: GeometryCollection, title = "Node Vector Studio Export"): string => {
  const viewBox = computeViewBox(geometry);
  const escapedTitle = escapeXml(title);
  const shapeMarkup = geometry.shapes
    .map((shape) => {
      const fill = colorToCss(shape.style.fill, "none");
      const stroke = colorToCss(shape.style.stroke, "none");
      const strokeWidth = shape.style.strokeWidth ?? 1.5;

      return `<path d="${escapeXml(pathToSvgD(shape.path))}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" vector-effect="non-scaling-stroke" />`;
    })
    .join("\n  ");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none">`,
    `  <title>${escapedTitle}</title>`,
    `  <g id="nodeditor-export">`,
    shapeMarkup ? `  ${shapeMarkup}` : "",
    "  </g>",
    "</svg>",
  ]
    .filter(Boolean)
    .join("\n");
};

export const svgMarkupToGeometry = (svgMarkup: string): SvgImportResult => {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgMarkup, "image/svg+xml");
  const parserError = document.querySelector("parsererror");
  if (parserError) {
    return {
      geometry: { shapes: [] },
      warnings: ["SVG parser failed: invalid markup."],
    };
  }

  const warnings: string[] = [];
  const shapes = Array.from(document.querySelectorAll("path"))
    .map((pathElement, index) => {
      const d = pathElement.getAttribute("d");
      if (!d) {
        warnings.push(`Path #${index + 1} skipped: missing "d" attribute.`);
        return undefined;
      }

      const pathCommands = parseSvgPathCommands(d, warnings, index);
      if (pathCommands.length === 0) {
        return undefined;
      }

      const style = readStyle(pathElement);

      return {
        id: `imported:path:${index}`,
        path: {
          id: `imported:path-data:${index}`,
          commands: pathCommands,
          closed: pathCommands.some((command) => command.kind === "close"),
        },
        style,
      };
    })
    .filter((shape): shape is GeometryCollection["shapes"][number] => Boolean(shape));

  if (shapes.length === 0) {
    warnings.push("No importable <path> elements were found in this SVG file.");
  }

  return {
    geometry: { shapes },
    warnings,
  };
};

const parseSvgPathCommands = (d: string, warnings: string[], index: number): PathCommand[] => {
  let absoluteCommands: CommandMadeAbsolute[];

  try {
    absoluteCommands = makeAbsolute(parseSVG(d));
  } catch (_error) {
    warnings.push(`Path #${index + 1} skipped: invalid path syntax.`);
    return [];
  }

  const commands: PathCommand[] = [];
  let currentPoint: Vec2 = { x: 0, y: 0 };
  let previousCubicControl: Vec2 | undefined;
  let previousQuadraticControl: Vec2 | undefined;

  absoluteCommands.forEach((command) => {
    switch (command.code) {
      case "M": {
        currentPoint = { x: command.x, y: command.y };
        commands.push({ kind: "move", to: currentPoint });
        previousCubicControl = undefined;
        previousQuadraticControl = undefined;
        return;
      }
      case "L":
      case "H":
      case "V": {
        currentPoint = { x: command.x, y: command.y };
        commands.push({ kind: "line", to: currentPoint });
        previousCubicControl = undefined;
        previousQuadraticControl = undefined;
        return;
      }
      case "C": {
        currentPoint = { x: command.x, y: command.y };
        const cp1 = { x: command.x1, y: command.y1 };
        const cp2 = { x: command.x2, y: command.y2 };
        commands.push({
          kind: "cubic",
          cp1,
          cp2,
          to: currentPoint,
        });
        previousCubicControl = cp2;
        previousQuadraticControl = undefined;
        return;
      }
      case "S": {
        const cp1 = previousCubicControl ? reflectPoint(previousCubicControl, currentPoint) : currentPoint;
        const cp2 = { x: command.x2, y: command.y2 };
        currentPoint = { x: command.x, y: command.y };
        commands.push({
          kind: "cubic",
          cp1,
          cp2,
          to: currentPoint,
        });
        previousCubicControl = cp2;
        previousQuadraticControl = undefined;
        return;
      }
      case "Q": {
        const control = { x: command.x1, y: command.y1 };
        const end = { x: command.x, y: command.y };
        const cubic = quadraticToCubic(currentPoint, control, end);
        commands.push(cubic);
        currentPoint = end;
        previousQuadraticControl = control;
        previousCubicControl = undefined;
        return;
      }
      case "T": {
        const control = previousQuadraticControl
          ? reflectPoint(previousQuadraticControl, currentPoint)
          : { ...currentPoint };
        const end = { x: command.x, y: command.y };
        const cubic = quadraticToCubic(currentPoint, control, end);
        commands.push(cubic);
        currentPoint = end;
        previousQuadraticControl = control;
        previousCubicControl = undefined;
        return;
      }
      case "A": {
        warnings.push(`Path #${index + 1} includes arcs; converted to straight line segments.`);
        currentPoint = { x: command.x, y: command.y };
        commands.push({ kind: "line", to: currentPoint });
        previousCubicControl = undefined;
        previousQuadraticControl = undefined;
        return;
      }
      case "Z": {
        commands.push({ kind: "close" });
        currentPoint = { x: command.x, y: command.y };
        previousCubicControl = undefined;
        previousQuadraticControl = undefined;
        return;
      }
    }
  });

  return commands;
};

const readStyle = (pathElement: Element): VectorStyle => {
  const inlineStyles = parseInlineStyle(pathElement.getAttribute("style"));
  const fill = parseColor(pathElement.getAttribute("fill") ?? inlineStyles.fill);
  const stroke = parseColor(pathElement.getAttribute("stroke") ?? inlineStyles.stroke);
  const strokeWidth = parsePositiveNumber(pathElement.getAttribute("stroke-width") ?? inlineStyles["stroke-width"]);

  return {
    fill,
    stroke,
    strokeWidth,
  };
};

const parseInlineStyle = (inlineStyle: string | null): Record<string, string> => {
  if (!inlineStyle) {
    return {};
  }

  return inlineStyle
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((styleMap, entry) => {
      const separatorIndex = entry.indexOf(":");
      if (separatorIndex === -1) {
        return styleMap;
      }

      const key = entry.slice(0, separatorIndex).trim().toLowerCase();
      const value = entry.slice(separatorIndex + 1).trim();
      styleMap[key] = value;
      return styleMap;
    }, {});
};

const parseColor = (value: string | null | undefined): Color | undefined => {
  if (!value || value.toLowerCase() === "none") {
    return undefined;
  }

  const parsed = colord(value);
  if (!parsed.isValid()) {
    return undefined;
  }

  const { r, g, b, a } = parsed.toRgb();
  return { r, g, b, a };
};

const parsePositiveNumber = (value: string | null | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

const quadraticToCubic = (start: Vec2, control: Vec2, end: Vec2): PathCommand => ({
  kind: "cubic",
  cp1: {
    x: start.x + (2 / 3) * (control.x - start.x),
    y: start.y + (2 / 3) * (control.y - start.y),
  },
  cp2: {
    x: end.x + (2 / 3) * (control.x - end.x),
    y: end.y + (2 / 3) * (control.y - end.y),
  },
  to: end,
});

const reflectPoint = (point: Vec2, around: Vec2): Vec2 => ({
  x: 2 * around.x - point.x,
  y: 2 * around.y - point.y,
});

const computeViewBox = (geometry: GeometryCollection): string => {
  const points = geometry.shapes.flatMap((shape) =>
    shape.path.commands.flatMap((command) => {
      switch (command.kind) {
        case "move":
        case "line":
          return [command.to];
        case "cubic":
          return [command.cp1, command.cp2, command.to];
        case "close":
          return [];
      }
    }),
  );

  if (points.length === 0) {
    return DEFAULT_VIEW_BOX;
  }

  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  const padding = 24;

  return `${minX - padding} ${minY - padding} ${Math.max(1, maxX - minX + padding * 2)} ${Math.max(1, maxY - minY + padding * 2)}`;
};

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
