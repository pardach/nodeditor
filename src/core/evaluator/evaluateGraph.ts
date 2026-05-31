import { defaultRegistry } from "../nodes/registry";
import type {
  EvaluationDiagnostic,
  GraphDocument,
  GraphEdge,
  GraphEvaluationResult,
  GraphValue,
  NodeEvaluationResult,
  NodeId,
  SocketId,
} from "../types/graph";
import { emptyGeometry } from "../geometry/pathOps";
import { findInputSocket, type NodeRegistry, validateGraphTypes } from "./typeCheck";

export const evaluateGraph = (
  document: GraphDocument,
  registry: NodeRegistry = defaultRegistry,
): GraphEvaluationResult => {
  const diagnostics = validateGraphTypes(document, registry);
  const graphOrder = topologicalSort(document);

  diagnostics.push(...graphOrder.diagnostics);

  const nodeResults: Record<NodeId, NodeEvaluationResult> = {};
  const incomingEdgesByNode = groupIncomingEdges(document);

  for (const nodeId of graphOrder.order) {
    const node = document.nodes[nodeId];
    const definition = registry[node.type];

    if (!definition) {
      continue;
    }

    const inputs: Record<SocketId, GraphValue> = {};

    definition.inputs.forEach((socket) => {
      inputs[socket.id] = socket.defaultValue;
    });

    incomingEdgesByNode[nodeId]?.forEach((edge) => {
      const sourceResult = nodeResults[edge.sourceNodeId];
      const inputSocket = findInputSocket(registry, node.type, edge.targetSocketId);
      if (!sourceResult || !inputSocket) {
        return;
      }

      inputs[edge.targetSocketId] = sourceResult.outputs[edge.sourceSocketId] ?? inputSocket.defaultValue;
    });

    const parameters = resolveParameters(definition.parameters, node.parameters);
    const result = definition.evaluate({ node, inputs, parameters });
    const nodeDiagnostics = result.diagnostics ?? [];

    nodeResults[nodeId] = {
      nodeId,
      outputs: result.outputs,
      diagnostics: nodeDiagnostics,
    };

    diagnostics.push(...nodeDiagnostics.map((diagnostic) => ({ ...diagnostic, nodeId: diagnostic.nodeId ?? nodeId })));
  }

  const activeOutputNodeId = document.activeOutputNodeId ?? findFirstOutputNode(document);
  const activeOutput = activeOutputNodeId ? nodeResults[activeOutputNodeId]?.outputs.geometry : undefined;

  return {
    nodeResults,
    outputGeometry: isGeometryCollection(activeOutput) ? activeOutput : emptyGeometry(),
    diagnostics,
    evaluationOrder: graphOrder.order,
  };
};

const resolveParameters = (
  definitions: { id: string; defaultValue: GraphValue }[],
  values: Record<string, GraphValue>,
): Record<string, GraphValue> =>
  Object.fromEntries(definitions.map((definition) => [definition.id, values[definition.id] ?? definition.defaultValue]));

const groupIncomingEdges = (document: GraphDocument) => {
  const groups: Record<NodeId, GraphEdge[]> = {};

  Object.values(document.edges).forEach((edge) => {
    groups[edge.targetNodeId] = groups[edge.targetNodeId] ?? [];
    groups[edge.targetNodeId].push(edge);
  });

  return groups;
};

const topologicalSort = (
  document: GraphDocument,
): {
  order: NodeId[];
  diagnostics: EvaluationDiagnostic[];
} => {
  const nodeIds = Object.keys(document.nodes);
  const incomingCount = new Map<NodeId, number>(nodeIds.map((nodeId) => [nodeId, 0]));
  const outgoing = new Map<NodeId, NodeId[]>(nodeIds.map((nodeId) => [nodeId, []]));

  Object.values(document.edges).forEach((edge) => {
    if (!document.nodes[edge.sourceNodeId] || !document.nodes[edge.targetNodeId]) {
      return;
    }

    incomingCount.set(edge.targetNodeId, (incomingCount.get(edge.targetNodeId) ?? 0) + 1);
    outgoing.get(edge.sourceNodeId)?.push(edge.targetNodeId);
  });

  const queue = nodeIds.filter((nodeId) => incomingCount.get(nodeId) === 0);
  const order: NodeId[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    order.push(nodeId);

    outgoing.get(nodeId)?.forEach((targetNodeId) => {
      const nextCount = (incomingCount.get(targetNodeId) ?? 0) - 1;
      incomingCount.set(targetNodeId, nextCount);
      if (nextCount === 0) {
        queue.push(targetNodeId);
      }
    });
  }

  if (order.length === nodeIds.length) {
    return { order, diagnostics: [] };
  }

  const cyclicNodeIds = nodeIds.filter((nodeId) => !order.includes(nodeId));

  return {
    order,
    diagnostics: cyclicNodeIds.map((nodeId) => ({
      nodeId,
      severity: "error",
      message: "Cycle detected; procedural vector graphs must stay acyclic.",
    })),
  };
};

const findFirstOutputNode = (document: GraphDocument): NodeId | undefined =>
  Object.values(document.nodes).find((node) => node.type === "output.document")?.id;

const isGeometryCollection = (value: GraphValue): value is ReturnType<typeof emptyGeometry> =>
  typeof value === "object" && value !== null && "shapes" in value && Array.isArray(value.shapes);
