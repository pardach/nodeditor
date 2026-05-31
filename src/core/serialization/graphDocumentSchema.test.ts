import { describe, expect, test } from "vitest";
import { parseGraphDocument, safeParseGraphDocument } from "./graphDocumentSchema";
import type { GraphDocument } from "../types/graph";

const createValidDocument = (): GraphDocument => {
  const now = new Date().toISOString();

  return {
    id: "doc:test",
    schemaVersion: 1,
    title: "Test document",
    nodes: {
      "node:output": {
        id: "node:output",
        type: "output.document",
        label: "Output",
        position: { x: 0, y: 0 },
        parameters: {},
      },
    },
    edges: {},
    activeOutputNodeId: "node:output",
    view: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedNodeIds: [],
      selectedEdgeIds: [],
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
  };
};

describe("graphDocumentSchema", () => {
  test("parses the sample document", () => {
    const sample = createValidDocument();
    const parsed = parseGraphDocument(sample);

    expect(parsed.id).toBe("doc:test");
    expect(parsed.schemaVersion).toBe(1);
    expect(Object.keys(parsed.nodes)).toContain("node:output");
  });

  test("rejects edge references to missing nodes", () => {
    const sample = createValidDocument();
    const brokenDocument = {
      ...sample,
      edges: {
        ...sample.edges,
        broken: {
          id: "broken",
          sourceNodeId: "missing-node",
          sourceSocketId: "geometry",
          targetNodeId: "node:output",
          targetSocketId: "geometry",
        },
      },
    };

    const result = safeParseGraphDocument(brokenDocument);

    expect(result.success).toBe(false);
  });

  test("rejects mismatched record keys and node ids", () => {
    const sample = createValidDocument();
    const node = sample.nodes["node:output"];
    const brokenDocument = {
      ...sample,
      nodes: {
        ...sample.nodes,
        "node:output": {
          ...node,
          id: "node:changed",
        },
      },
    };

    const result = safeParseGraphDocument(brokenDocument);

    expect(result.success).toBe(false);
  });
});
