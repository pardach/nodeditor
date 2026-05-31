import type { GraphDocument } from "../core/types/graph";
import { parseGraphDocument } from "../core/serialization/graphDocumentSchema";

export const createSampleDocument = (): GraphDocument => {
  const now = new Date().toISOString();

  const sampleDocument = {
    id: "doc:sample",
    schemaVersion: 1,
    title: "Procedural vector study",
    nodes: {
      "node:rectangle": {
        id: "node:rectangle",
        type: "geometry.rectangle",
        label: "Base rectangle",
        position: { x: 48, y: 96 },
        parameters: { width: 320, height: 180 },
      },
      "node:transform": {
        id: "node:transform",
        type: "operation.transform",
        label: "Offset + rotate",
        position: { x: 360, y: 84 },
        parameters: { translateX: 16, translateY: -12, scaleX: 1, scaleY: 1, rotate: -8 },
      },
      "node:fill": {
        id: "node:fill",
        type: "material.fill",
        label: "Warm fill",
        position: { x: 664, y: 100 },
        parameters: { red: 255, green: 122, blue: 86, alpha: 0.78 },
      },
      "node:output": {
        id: "node:output",
        type: "output.document",
        label: "Viewport output",
        position: { x: 956, y: 112 },
        parameters: {},
      },
    },
    edges: {
      "edge:rectangle-transform": {
        id: "edge:rectangle-transform",
        sourceNodeId: "node:rectangle",
        sourceSocketId: "geometry",
        targetNodeId: "node:transform",
        targetSocketId: "geometry",
      },
      "edge:transform-fill": {
        id: "edge:transform-fill",
        sourceNodeId: "node:transform",
        sourceSocketId: "geometry",
        targetNodeId: "node:fill",
        targetSocketId: "geometry",
      },
      "edge:fill-output": {
        id: "edge:fill-output",
        sourceNodeId: "node:fill",
        sourceSocketId: "geometry",
        targetNodeId: "node:output",
        targetSocketId: "geometry",
      },
    },
    activeOutputNodeId: "node:output",
    view: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedNodeIds: ["node:fill"],
      selectedEdgeIds: [],
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
  } satisfies GraphDocument;

  return parseGraphDocument(sampleDocument);
};
