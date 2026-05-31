import type {
  EvaluationDiagnostic,
  GraphDocument,
  GraphEdge,
  NodeDefinition,
  SocketDefinition,
} from "../types/graph";

export type NodeRegistry = Record<string, NodeDefinition>;

export const validateGraphTypes = (
  document: GraphDocument,
  registry: NodeRegistry,
): EvaluationDiagnostic[] => {
  const diagnostics: EvaluationDiagnostic[] = [];

  Object.values(document.nodes).forEach((node) => {
    if (!registry[node.type]) {
      diagnostics.push({
        nodeId: node.id,
        severity: "error",
        message: `Unknown node type "${node.type}".`,
      });
    }
  });

  Object.values(document.edges).forEach((edge) => {
    const sourceSocket = findSocket(document, registry, edge, "source");
    const targetSocket = findSocket(document, registry, edge, "target");

    if (!sourceSocket || !targetSocket) {
      diagnostics.push({
        edgeId: edge.id,
        severity: "error",
        message: "Edge references a missing node or socket.",
      });
      return;
    }

    if (sourceSocket.dataType !== targetSocket.dataType) {
      diagnostics.push({
        edgeId: edge.id,
        severity: "error",
        message: `Cannot connect ${sourceSocket.dataType} to ${targetSocket.dataType}.`,
      });
    }
  });

  return diagnostics;
};

export const findInputSocket = (
  registry: NodeRegistry,
  nodeType: string,
  socketId: string,
): SocketDefinition | undefined => registry[nodeType]?.inputs.find((socket) => socket.id === socketId);

export const findOutputSocket = (
  registry: NodeRegistry,
  nodeType: string,
  socketId: string,
): SocketDefinition | undefined => registry[nodeType]?.outputs.find((socket) => socket.id === socketId);

const findSocket = (
  document: GraphDocument,
  registry: NodeRegistry,
  edge: GraphEdge,
  side: "source" | "target",
): SocketDefinition | undefined => {
  if (side === "source") {
    const sourceNode = document.nodes[edge.sourceNodeId];
    return sourceNode ? findOutputSocket(registry, sourceNode.type, edge.sourceSocketId) : undefined;
  }

  const targetNode = document.nodes[edge.targetNodeId];
  return targetNode ? findInputSocket(registry, targetNode.type, edge.targetSocketId) : undefined;
};
