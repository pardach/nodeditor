import type { Color, GeometryCollection, Transform, Vec2 } from "./primitives";

export type NodeId = string;
export type EdgeId = string;
export type SocketId = string;
export type NodeType = string;

export type SocketDirection = "input" | "output";

export type GraphDataType =
  | "geometry"
  | "path"
  | "number"
  | "color"
  | "transform"
  | "boolean"
  | "string";

export type GraphValue =
  | GeometryCollection
  | number
  | Color
  | Transform
  | boolean
  | string
  | undefined;

export interface SocketDefinition {
  id: SocketId;
  label: string;
  direction: SocketDirection;
  dataType: GraphDataType;
  required?: boolean;
  defaultValue?: GraphValue;
}

export interface NodeParameterDefinition {
  id: string;
  label: string;
  dataType: GraphDataType;
  defaultValue: GraphValue;
  min?: number;
  max?: number;
  step?: number;
}

export interface NodeDefinition {
  type: NodeType;
  label: string;
  category: "input" | "geometry" | "operation" | "material" | "output";
  description: string;
  inputs: SocketDefinition[];
  outputs: SocketDefinition[];
  parameters: NodeParameterDefinition[];
  evaluate: (context: NodeEvaluationContext) => NodeEvaluation;
}

export interface NodeEvaluationContext {
  node: GraphNode;
  inputs: Record<SocketId, GraphValue>;
  parameters: Record<string, GraphValue>;
}

export interface NodeEvaluation {
  outputs: Record<SocketId, GraphValue>;
  diagnostics?: EvaluationDiagnostic[];
}

export interface GraphNode {
  id: NodeId;
  type: NodeType;
  label?: string;
  position: Vec2;
  parameters: Record<string, GraphValue>;
}

export interface GraphEdge {
  id: EdgeId;
  sourceNodeId: NodeId;
  sourceSocketId: SocketId;
  targetNodeId: NodeId;
  targetSocketId: SocketId;
}

export interface GraphViewState {
  zoom: number;
  pan: Vec2;
  selectedNodeIds: NodeId[];
  selectedEdgeIds: EdgeId[];
}

export interface GraphDocument {
  id: string;
  schemaVersion: number;
  title: string;
  nodes: Record<NodeId, GraphNode>;
  edges: Record<EdgeId, GraphEdge>;
  activeOutputNodeId?: NodeId;
  view: GraphViewState;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface EvaluationDiagnostic {
  nodeId?: NodeId;
  edgeId?: EdgeId;
  severity: "info" | "warning" | "error";
  message: string;
}

export interface NodeEvaluationResult {
  nodeId: NodeId;
  outputs: Record<SocketId, GraphValue>;
  diagnostics: EvaluationDiagnostic[];
}

export interface GraphEvaluationResult {
  nodeResults: Record<NodeId, NodeEvaluationResult>;
  outputGeometry: GeometryCollection;
  diagnostics: EvaluationDiagnostic[];
  evaluationOrder: NodeId[];
}
