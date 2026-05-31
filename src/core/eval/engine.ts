import { findEdgeToPort, getDownstreamNodeIds, topologicalSort } from '../document/graph.js';
import type { GraphDocument } from '../document/types.js';
import { getNodeDefinition } from '../../nodes/registry.js';
import type { EvalContext, NodeEvalResult } from './context.js';
import type { PortValues } from '../types/values.js';

export interface EvalCache {
  /** nodeId → portId → value */
  outputs: Map<string, PortValues>;
  errors: Map<string, string>;
}

export interface EvalResult {
  cache: EvalCache;
  /** نودی که برای viewport استفاده می‌شود */
  previewNodeId?: string;
  hasCycle: boolean;
}

function resolveInputs(
  doc: GraphDocument,
  nodeId: string,
  cache: EvalCache,
): PortValues {
  const def = getNodeDefinition(doc.nodes[nodeId]!.typeId);
  if (!def) return {};

  const inputs: PortValues = {};
  for (const port of def.inputs) {
    const edge = findEdgeToPort(doc, { nodeId, portId: port.id });
    if (edge) {
      const upstream = cache.outputs.get(edge.from.nodeId);
      const val = upstream?.[edge.from.portId];
      if (val !== undefined) inputs[port.id] = val;
      else if (port.optional && port.defaultValue !== undefined) {
        inputs[port.id] = port.defaultValue as PortValues[string];
      }
    } else if (port.defaultValue !== undefined) {
      inputs[port.id] = port.defaultValue as PortValues[string];
    }
  }
  return inputs;
}

function evaluateNode(doc: GraphDocument, nodeId: string, cache: EvalCache): NodeEvalResult {
  const node = doc.nodes[nodeId];
  if (!node) return { outputs: {}, error: 'Node not found' };

  const def = getNodeDefinition(node.typeId);
  if (!def) return { outputs: {}, error: `Unknown type: ${node.typeId}` };

  if (node.flags?.muted || node.flags?.bypass) {
    const inputs = resolveInputs(doc, nodeId, cache);
    const passPort = def.inputs[0]?.id;
    const passVal = passPort ? inputs[passPort] : null;
    const out: PortValues = {};
    if (def.outputs[0]) out[def.outputs[0].id] = passVal ?? null;
    return { outputs: out };
  }

  const ctx: EvalContext = {
    document: doc,
    nodeId,
    definition: def,
    inputs: resolveInputs(doc, nodeId, cache),
    getCachedOutput: (id) => cache.outputs.get(id),
  };

  try {
    return { outputs: def.evaluate(ctx) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { outputs: {}, error: msg };
  }
}

/** ارزیابی کامل یا فقط زیردرخت dirty */
export function evaluateGraph(
  doc: GraphDocument,
  options?: { dirtyRoots?: string[] },
): EvalResult {
  const cache: EvalCache = { outputs: new Map(), errors: new Map() };

  let nodeSet: Set<string>;
  if (options?.dirtyRoots?.length) {
    nodeSet = new Set(options.dirtyRoots);
    for (const root of options.dirtyRoots) {
      for (const id of getDownstreamNodeIds(doc, root)) nodeSet.add(id);
    }
    for (const id of options.dirtyRoots) nodeSet.add(id);
  } else {
    nodeSet = new Set(Object.keys(doc.nodes));
  }

  const { order, hasCycle } = topologicalSort(doc, nodeSet);
  if (hasCycle) {
    return { cache, hasCycle: true, previewNodeId: doc.view.previewNodeId };
  }

  for (const nodeId of order) {
    const { outputs, error } = evaluateNode(doc, nodeId, cache);
    cache.outputs.set(nodeId, outputs);
    if (error) cache.errors.set(nodeId, error);
  }

  return {
    cache,
    previewNodeId: doc.view.previewNodeId,
    hasCycle: false,
  };
}

export function getPreviewValue(result: EvalResult): PortValues | undefined {
  const id = result.previewNodeId;
  if (!id) return undefined;
  return result.cache.outputs.get(id);
}
