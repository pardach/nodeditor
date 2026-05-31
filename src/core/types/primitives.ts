export interface Vec2 {
  x: number;
  y: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Transform {
  translate: Vec2;
  scale: Vec2;
  rotate: number;
}

export type PathCommand =
  | { kind: "move"; to: Vec2 }
  | { kind: "line"; to: Vec2 }
  | { kind: "cubic"; cp1: Vec2; cp2: Vec2; to: Vec2 }
  | { kind: "close" };

export interface VectorPath {
  id: string;
  commands: PathCommand[];
  closed: boolean;
}

export interface VectorStyle {
  fill?: Color;
  stroke?: Color;
  strokeWidth?: number;
}

export interface VectorShape {
  id: string;
  path: VectorPath;
  style: VectorStyle;
  transform?: Transform;
}

export interface GeometryCollection {
  shapes: VectorShape[];
}

export const identityTransform: Transform = {
  translate: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  rotate: 0,
};

export const transparentColor: Color = { r: 0, g: 0, b: 0, a: 0 };
