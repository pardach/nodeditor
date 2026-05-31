import type { GraphDocument, NodeInstance } from '../document/types.js';
import type { Command } from './types.js';

function touch(doc: GraphDocument): GraphDocument {
  return {
    ...doc,
    meta: { ...doc.meta, modifiedAt: new Date().toISOString() },
  };
}

export function addNodeCommand(node: NodeInstance): Command {
  return {
    name: 'addNode',
    apply(doc) {
      return touch({
        ...doc,
        nodes: { ...doc.nodes, [node.id]: node },
      });
    },
    revert(doc) {
      const { [node.id]: _, ...rest } = doc.nodes;
      return touch({ ...doc, nodes: rest });
    },
  };
}

export function setNodeParamsCommand(
  nodeId: string,
  params: Record<string, unknown>,
  prevParams: Record<string, unknown>,
): Command {
  return {
    name: 'setNodeParams',
    apply(doc) {
      const n = doc.nodes[nodeId];
      if (!n) return doc;
      return touch({
        ...doc,
        nodes: { ...doc.nodes, [nodeId]: { ...n, params: { ...n.params, ...params } } },
      });
    },
    revert(doc) {
      const n = doc.nodes[nodeId];
      if (!n) return doc;
      return touch({
        ...doc,
        nodes: { ...doc.nodes, [nodeId]: { ...n, params: prevParams } },
      });
    },
  };
}
