import type { NodeDefinition } from "../../types/graph";
import type { GeometryCollection } from "../../types/primitives";
import { rectanglePath, shapeFromPath } from "../../geometry/pathOps";

export const rectangleNode: NodeDefinition = {
  type: "geometry.rectangle",
  label: "Rectangle",
  category: "geometry",
  description: "Creates a centered procedural rectangle path.",
  inputs: [],
  outputs: [{ id: "geometry", label: "Geometry", direction: "output", dataType: "geometry" }],
  parameters: [
    { id: "width", label: "Width", dataType: "number", defaultValue: 320, min: 1, step: 1 },
    { id: "height", label: "Height", dataType: "number", defaultValue: 180, min: 1, step: 1 },
  ],
  evaluate: ({ node, parameters }) => {
    const width = Number(parameters.width);
    const height = Number(parameters.height);
    const path = rectanglePath(`${node.id}:path`, width, height);
    const geometry: GeometryCollection = {
      shapes: [
        shapeFromPath(`${node.id}:shape`, path, {
          fill: { r: 78, g: 161, b: 255, a: 0.28 },
          stroke: { r: 78, g: 161, b: 255, a: 1 },
          strokeWidth: 2,
        }),
      ],
    };

    return { outputs: { geometry } };
  },
};
