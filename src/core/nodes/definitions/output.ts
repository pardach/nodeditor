import type { GeometryCollection } from "../../types/primitives";
import type { NodeDefinition } from "../../types/graph";
import { emptyGeometry } from "../../geometry/pathOps";

export const documentOutputNode: NodeDefinition = {
  type: "output.document",
  label: "Document Output",
  category: "output",
  description: "Marks the evaluated geometry that the 2D viewport should render.",
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
  parameters: [],
  evaluate: ({ inputs }) => ({
    outputs: {
      geometry: (inputs.geometry as GeometryCollection | undefined) ?? emptyGeometry(),
    },
  }),
};
