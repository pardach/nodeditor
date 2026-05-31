import type { Edge, GraphDocument, NodeInstance } from './types.js';
import type { PortRef } from '../types/ports.js';

export function createEmptyDocument(name = 'Untitled'): GraphDocument {
  const now = new Date().toISOString();
  return {
    format: 'vector-node-doc',
    version: 1,
    meta: { name, workspace: 'shape', createdAt: now, modifiedAt: now },
    nodes: {},
    edges: {},
    groups: {},
    view: { pan: { x: 0, y: 0 }, zoom: 1, selectedNodeIds: [] },
  };
}

export function getNode(doc: GraphDocument, id: string): NodeInstance | undefined {
  return doc.nodes[id];
}

export function getEdgesTo(doc: GraphDocument, nodeId: string): Edge[] {
  return Object.values(doc.edges).filter((e) => e.to.nodeId === nodeId);
}

export function getEdgesFrom(doc: GraphDocument, nodeId: string): Edge[] {
  return Object.values(doc.edges).filter((e) => e.from.nodeId === nodeId);
}

export function getDownstreamNodeIds(doc: GraphDocument, startId: string): Set<string> {
  const visited = new Set<string>();
  const queue = [startId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const e of getEdgesFrom(doc, id)) {
      queue.push(e.to.nodeId);
    }
  }
  visited.delete(startId);
  return visited;
}

export function findEdgeToPort(doc: GraphDocument, ref: PortRef): Edge | undefined {
  return Object.values(doc.edges).find(
    (e) => e.to.nodeId === ref.nodeId && e.to.portId === ref.portId,
  );
}

/** مرتب‌سازی توپولوژیک؛ در صورت cycle آرایهٔ خالی + false */
export function topologicalSort(
  doc: GraphDocument,
  nodeIds: Iterable<string>,
): { order: string[]; hasCycle: boolean } {
  const ids = new Set(nodeIds);
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of ids) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const edge of Object.values(doc.edges)) {
    const { from, to } = edge;
    if (!ids.has(from.nodeId) || !ids.has(to.nodeId)) continue;
    adj.get(from.nodeId)!.push(to.nodeId);
    inDegree.set(to.nodeId, (inDegree.get(to.nodeId) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const order: string[] = [];
  while (queue.length > 0) {
    const n = queue.shift()!;
    order.push(n);
    for (const m of adj.get(n) ?? []) {
      const d = (inDegree.get(m) ?? 1) - 1;
      inDegree.set(m, d);
      if (d === 0) queue.push(m);
    }
  }

  return { order, hasCycle: order.length !== ids.size };
}
