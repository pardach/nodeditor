import type { PortRef } from '../types/ports.js';

export interface NodeFlags {
  muted?: boolean;
  locked?: boolean;
  preview?: boolean;
  bypass?: boolean;
}

export interface NodeInstance {
  id: string;
  typeId: string;
  params: Record<string, unknown>;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  flags?: NodeFlags;
  /** اگر داخل Group باشد */
  parentGroupId?: string;
}

export interface Edge {
  id: string;
  from: PortRef;
  to: PortRef;
}

/** زیرگراف — معادل سادهٔ Node Group / HDA */
export interface NodeGroup {
  id: string;
  name: string;
  /** نودهای داخل گروه */
  childNodeIds: string[];
  /** نود «ورودی/خروجی» گروه روی مرز */
  interfaceNodeIds: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface GraphViewState {
  pan: { x: number; y: number };
  zoom: number;
  /** نودهای انتخاب‌شده در UI */
  selectedNodeIds: string[];
  /** نودی که preview viewport از آن می‌آید */
  previewNodeId?: string;
}

export type WorkspaceId = 'shape' | 'style' | 'export';

export interface GraphDocument {
  format: 'vector-node-doc';
  version: number;
  meta: {
    name: string;
    workspace: WorkspaceId;
    createdAt: string;
    modifiedAt: string;
  };
  nodes: Record<string, NodeInstance>;
  edges: Record<string, Edge>;
  groups: Record<string, NodeGroup>;
  view: GraphViewState;
}
