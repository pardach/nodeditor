export type NodeTone = "source" | "transform" | "preview" | "analysis" | "output";

export type PortValueKind =
  | "number"
  | "vector-shape"
  | "svg-asset"
  | "pattern"
  | "brush"
  | "document";

export type NodeCapability =
  | "procedural"
  | "non-destructive"
  | "cacheable"
  | "asset-linked"
  | "print-critical"
  | "batchable";

export type NodePort = {
  id: string;
  label: string;
  valueKind: PortValueKind;
};

export type NodeDefinition = {
  type: string;
  title: string;
  subtitle: string;
  tone: NodeTone;
  inputs: NodePort[];
  outputs: NodePort[];
  capabilities: NodeCapability[];
  description: string;
};

export type DesignNodeData = {
  title: string;
  subtitle: string;
  items: string[];
  tone: NodeTone;
  capabilities: NodeCapability[];
};

export type GarmentSpec = {
  artboardWidth: number;
  garmentWidth: number;
  garmentHeight: number;
  neckWidth: number;
  neckDrop: number;
  repeatSize: number;
  brushSpacing: number;
  motifScale: number;
  scatterJitter: number;
  colorways: number;
};

export type ArtboardAnalysis = {
  viewBoxWidth: number;
  viewBoxHeight: number;
  printableArea: number;
  utilization: number;
  brushCount: number;
  estimatedTiles: number;
  exportReadiness: number;
  warnings: string[];
};

export type VectorDocumentSnapshot = {
  version: 1;
  unit: "cm";
  spec: GarmentSpec;
  analysis: ArtboardAnalysis;
};
