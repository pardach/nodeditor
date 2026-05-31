import type { NodeDefinition } from "../../types/graph";
import { emptyGeometry, transformGeometry } from "../../geometry/pathOps";
import type { GeometryCollection, Transform } from "../../types/primitives";

export const transformNode: NodeDefinition = {
  type: "operation.transform",
  label: "Transform",
  category: "operation",
  description: "Applies translate, scale, and rotation to incoming vector geometry.",
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
    { id: "translateX", label: "Translate X", dataType: "number", defaultValue: 0, step: 1 },
    { id: "translateY", label: "Translate Y", dataType: "number", defaultValue: 0, step: 1 },
    { id: "scaleX", label: "Scale X", dataType: "number", defaultValue: 1, step: 0.05 },
    { id: "scaleY", label: "Scale Y", dataType: "number", defaultValue: 1, step: 0.05 },
    { id: "rotate", label: "Rotate", dataType: "number", defaultValue: 0, step: 1 },
  ],
  evaluate: ({ inputs, parameters }) => {
    const geometry = inputs.geometry as GeometryCollection | undefined;
    const transform: Transform = {
      translate: { x: Number(parameters.translateX), y: Number(parameters.translateY) },
      scale: { x: Number(parameters.scaleX), y: Number(parameters.scaleY) },
      rotate: Number(parameters.rotate),
    };

    return {
      outputs: {
        geometry: transformGeometry(geometry ?? emptyGeometry(), transform),
      },
    };
  },
};
