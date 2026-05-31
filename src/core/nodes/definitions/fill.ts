import type { NodeDefinition } from "../../types/graph";
import type { Color, GeometryCollection } from "../../types/primitives";
import { applyFill, emptyGeometry } from "../../geometry/pathOps";

export const fillNode: NodeDefinition = {
  type: "material.fill",
  label: "Fill",
  category: "material",
  description: "Applies a fill color to incoming geometry without changing topology.",
  inputs: [
    {
      id: "geometry",
      label: "Geometry",
      direction: "input",
      dataType: "geometry",
      required: true,
      defaultValue: emptyGeometry(),
    },
  ],
  outputs: [{ id: "geometry", label: "Geometry", direction: "output", dataType: "geometry" }],
  parameters: [
    { id: "red", label: "Red", dataType: "number", defaultValue: 250, min: 0, max: 255, step: 1 },
    { id: "green", label: "Green", dataType: "number", defaultValue: 120, min: 0, max: 255, step: 1 },
    { id: "blue", label: "Blue", dataType: "number", defaultValue: 88, min: 0, max: 255, step: 1 },
    { id: "alpha", label: "Alpha", dataType: "number", defaultValue: 0.72, min: 0, max: 1, step: 0.01 },
  ],
  evaluate: ({ inputs, parameters }) => {
    const geometry = inputs.geometry as GeometryCollection | undefined;
    const fill: Color = {
      r: Number(parameters.red),
      g: Number(parameters.green),
      b: Number(parameters.blue),
      a: Number(parameters.alpha),
    };

    return {
      outputs: {
        geometry: applyFill(geometry ?? emptyGeometry(), fill),
      },
    };
  },
};
