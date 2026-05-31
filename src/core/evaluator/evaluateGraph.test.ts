import { describe, expect, it } from "vitest";
import { evaluateGraph } from "./evaluateGraph";
import { createSampleDocument } from "../../store/sampleDocument";

describe("evaluateGraph", () => {
  it("evaluates the sample document into viewport geometry", () => {
    const result = evaluateGraph(createSampleDocument());

    expect(result.diagnostics).toEqual([]);
    expect(result.evaluationOrder).toEqual([
      "node:rectangle",
      "node:transform",
      "node:fill",
      "node:output",
    ]);
    expect(result.outputGeometry.shapes).toHaveLength(1);
    expect(result.outputGeometry.shapes[0].style.fill).toMatchObject({
      r: 255,
      g: 122,
      b: 86,
    });
  });

  it("reports cycles instead of evaluating unsafe graph loops", () => {
    const document = createSampleDocument();
    document.edges["edge:cycle"] = {
      id: "edge:cycle",
      sourceNodeId: "node:output",
      sourceSocketId: "geometry",
      targetNodeId: "node:rectangle",
      targetSocketId: "geometry",
    };

    const result = evaluateGraph(document);

    expect(result.diagnostics.some((diagnostic) => diagnostic.message.includes("Cycle detected"))).toBe(true);
    expect(result.outputGeometry.shapes).toHaveLength(0);
  });
});
