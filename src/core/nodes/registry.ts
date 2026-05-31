import type { NodeDefinition } from "../types/graph";
import { fillNode } from "./definitions/fill";
import { rectangleNode } from "./definitions/rectangle";
import { transformNode } from "./definitions/transform";
import { documentOutputNode } from "./definitions/output";

export const nodeDefinitions = [rectangleNode, transformNode, fillNode, documentOutputNode] as const;

export const defaultRegistry: Record<string, NodeDefinition> = Object.fromEntries(
  nodeDefinitions.map((definition) => [definition.type, definition]),
);

export const getNodeDefinition = (nodeType: string): NodeDefinition | undefined => defaultRegistry[nodeType];
