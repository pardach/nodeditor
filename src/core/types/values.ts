import type { PortDataType } from './ports.js';

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

/** دستورات SVG-style؛ هستهٔ path نهایی */
export type PathCommand =
  | { op: 'M'; x: number; y: number }
  | { op: 'L'; x: number; y: number }
  | { op: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { op: 'Z' };

export interface Path2D {
  commands: PathCommand[];
  closed: boolean;
}

export interface Shape2D {
  paths: Path2D[];
  windingRule: 'nonzero' | 'evenodd';
}

export interface StrokeStyle {
  color: Color;
  width: number;
  dash?: number[];
}

export interface FillStyle {
  color?: Color;
  /** مرجع به نود gradient — فاز بعد */
  gradientId?: string;
}

export interface StyledShape {
  shape: Shape2D;
  fill?: FillStyle;
  stroke?: StrokeStyle;
}

export type PortValue =
  | number
  | Vec2
  | Color
  | boolean
  | Path2D
  | Shape2D
  | StyledShape
  | null;

export type PortValues = Record<string, PortValue>;

export function valueTypeOf(v: PortValue): PortDataType {
  if (v === null) return 'any';
  if (typeof v === 'number') return 'float';
  if (typeof v === 'boolean') return 'bool';
  if ('commands' in v && Array.isArray((v as Path2D).commands)) return 'path';
  if ('paths' in v && !('shape' in v)) return 'shape';
  if ('shape' in v) return 'style';
  if ('r' in v && 'g' in v) return 'color';
  if ('x' in v && 'y' in v) return 'vec2';
  return 'any';
}
