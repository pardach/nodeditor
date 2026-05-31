import type { GeometryCollection, Vec2 } from "./primitives";

export interface Artboard {
  id: string;
  name: string;
  size: Vec2;
  background: string;
}

export interface SceneLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  geometry: GeometryCollection;
}

export interface EvaluatedScene {
  artboard: Artboard;
  layers: SceneLayer[];
}
