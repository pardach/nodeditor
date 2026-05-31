import { applyToPoint, compose, rotateDEG, scale, translate, type Matrix } from "transformation-matrix";
import type {
  Color,
  GeometryCollection,
  PathCommand,
  Transform,
  Vec2,
  VectorPath,
  VectorShape,
  VectorStyle,
} from "../types/primitives";
import { identityTransform } from "../types/primitives";

export const emptyGeometry = (): GeometryCollection => ({ shapes: [] });

export const rectanglePath = (id: string, width: number, height: number): VectorPath => {
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  return {
    id,
    closed: true,
    commands: [
      { kind: "move", to: { x: -halfWidth, y: -halfHeight } },
      { kind: "line", to: { x: halfWidth, y: -halfHeight } },
      { kind: "line", to: { x: halfWidth, y: halfHeight } },
      { kind: "line", to: { x: -halfWidth, y: halfHeight } },
      { kind: "close" },
    ],
  };
};

export const shapeFromPath = (id: string, path: VectorPath, style: VectorStyle = {}): VectorShape => ({
  id,
  path,
  style,
  transform: identityTransform,
});

export const mergeGeometry = (...collections: GeometryCollection[]): GeometryCollection => ({
  shapes: collections.flatMap((collection) => collection.shapes),
});

export const applyFill = (geometry: GeometryCollection, fill: Color): GeometryCollection => ({
  shapes: geometry.shapes.map((shape) => ({
    ...shape,
    style: {
      ...shape.style,
      fill,
    },
  })),
});

export const transformGeometry = (geometry: GeometryCollection, transform: Transform): GeometryCollection => {
  const matrix = transformToMatrix(transform);

  return {
    shapes: geometry.shapes.map((shape) => ({
      ...shape,
      path: transformPathWithMatrix(shape.path, matrix),
    })),
  };
};

export const transformPath = (path: VectorPath, transform: Transform): VectorPath =>
  transformPathWithMatrix(path, transformToMatrix(transform));

export const transformToMatrix = (transform: Transform): Matrix =>
  compose(
    translate(transform.translate.x, transform.translate.y),
    rotateDEG(transform.rotate),
    scale(transform.scale.x, transform.scale.y),
  );

export const pathToSvgD = (path: VectorPath): string =>
  path.commands
    .map((command) => {
      switch (command.kind) {
        case "move":
          return `M ${round(command.to.x)} ${round(command.to.y)}`;
        case "line":
          return `L ${round(command.to.x)} ${round(command.to.y)}`;
        case "cubic":
          return `C ${round(command.cp1.x)} ${round(command.cp1.y)} ${round(command.cp2.x)} ${round(
            command.cp2.y,
          )} ${round(command.to.x)} ${round(command.to.y)}`;
        case "close":
          return "Z";
      }
    })
    .join(" ");

export const colorToCss = (color: Color | undefined, fallback = "transparent"): string => {
  if (!color) {
    return fallback;
  }

  return `rgba(${clampColor(color.r)}, ${clampColor(color.g)}, ${clampColor(color.b)}, ${Math.max(
    0,
    Math.min(1, color.a),
  )})`;
};

const transformPathWithMatrix = (path: VectorPath, matrix: Matrix): VectorPath => ({
  ...path,
  commands: path.commands.map((command) => transformCommand(command, matrix)),
});

const transformCommand = (command: PathCommand, matrix: Matrix): PathCommand => {
  switch (command.kind) {
    case "move":
      return { ...command, to: transformPoint(command.to, matrix) };
    case "line":
      return { ...command, to: transformPoint(command.to, matrix) };
    case "cubic":
      return {
        ...command,
        cp1: transformPoint(command.cp1, matrix),
        cp2: transformPoint(command.cp2, matrix),
        to: transformPoint(command.to, matrix),
      };
    case "close":
      return command;
  }
};

const transformPoint = (point: Vec2, matrix: Matrix): Vec2 => {
  const transformed = applyToPoint(matrix, point);

  return {
    x: transformed.x,
    y: transformed.y,
  };
};

const round = (value: number) => Math.round(value * 1000) / 1000;

const clampColor = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
