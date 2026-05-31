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

export const transformGeometry = (geometry: GeometryCollection, transform: Transform): GeometryCollection => ({
  shapes: geometry.shapes.map((shape) => ({
    ...shape,
    path: transformPath(shape.path, transform),
  })),
});

export const transformPath = (path: VectorPath, transform: Transform): VectorPath => ({
  ...path,
  commands: path.commands.map((command) => transformCommand(command, transform)),
});

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

const transformCommand = (command: PathCommand, transform: Transform): PathCommand => {
  switch (command.kind) {
    case "move":
      return { ...command, to: transformPoint(command.to, transform) };
    case "line":
      return { ...command, to: transformPoint(command.to, transform) };
    case "cubic":
      return {
        ...command,
        cp1: transformPoint(command.cp1, transform),
        cp2: transformPoint(command.cp2, transform),
        to: transformPoint(command.to, transform),
      };
    case "close":
      return command;
  }
};

const transformPoint = (point: Vec2, transform: Transform): Vec2 => {
  const scaledX = point.x * transform.scale.x;
  const scaledY = point.y * transform.scale.y;
  const radians = (transform.rotate * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: scaledX * cos - scaledY * sin + transform.translate.x,
    y: scaledX * sin + scaledY * cos + transform.translate.y,
  };
};

const round = (value: number) => Math.round(value * 1000) / 1000;

const clampColor = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
