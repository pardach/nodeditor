import { z } from "zod";
import type { GraphDocument } from "../types/graph";

const isoTimestampSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid timestamp format.");

const vec2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

const colorSchema = z.object({
  r: z.number(),
  g: z.number(),
  b: z.number(),
  a: z.number(),
});

const transformSchema = z.object({
  translate: vec2Schema,
  scale: vec2Schema,
  rotate: z.number(),
});

const pathCommandSchema = z.union([
  z.object({
    kind: z.literal("move"),
    to: vec2Schema,
  }),
  z.object({
    kind: z.literal("line"),
    to: vec2Schema,
  }),
  z.object({
    kind: z.literal("cubic"),
    cp1: vec2Schema,
    cp2: vec2Schema,
    to: vec2Schema,
  }),
  z.object({
    kind: z.literal("close"),
  }),
]);

const vectorPathSchema = z.object({
  id: z.string().min(1),
  commands: z.array(pathCommandSchema),
  closed: z.boolean(),
});

const vectorStyleSchema = z.object({
  fill: colorSchema.optional(),
  stroke: colorSchema.optional(),
  strokeWidth: z.number().optional(),
});

const vectorShapeSchema = z.object({
  id: z.string().min(1),
  path: vectorPathSchema,
  style: vectorStyleSchema,
  transform: transformSchema.optional(),
});

const geometryCollectionSchema = z.object({
  shapes: z.array(vectorShapeSchema),
});

const graphValueSchema = z.union([
  geometryCollectionSchema,
  z.number(),
  colorSchema,
  transformSchema,
  z.boolean(),
  z.string(),
  z.undefined(),
]);

const graphNodeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  label: z.string().optional(),
  position: vec2Schema,
  parameters: z.record(z.string(), graphValueSchema),
});

const graphEdgeSchema = z.object({
  id: z.string().min(1),
  sourceNodeId: z.string().min(1),
  sourceSocketId: z.string().min(1),
  targetNodeId: z.string().min(1),
  targetSocketId: z.string().min(1),
});

const graphViewStateSchema = z.object({
  zoom: z.number(),
  pan: vec2Schema,
  selectedNodeIds: z.array(z.string()),
  selectedEdgeIds: z.array(z.string()),
});

const schemaVersionSchema = z.literal(1);

export const graphDocumentSchema = z
  .object({
    id: z.string().min(1),
    schemaVersion: schemaVersionSchema,
    title: z.string().min(1),
    nodes: z.record(z.string(), graphNodeSchema),
    edges: z.record(z.string(), graphEdgeSchema),
    activeOutputNodeId: z.string().optional(),
    view: graphViewStateSchema,
    metadata: z.object({
      createdAt: isoTimestampSchema,
      updatedAt: isoTimestampSchema,
    }),
  })
  .superRefine((document, context) => {
    for (const [nodeId, node] of Object.entries(document.nodes)) {
      if (node.id !== nodeId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Node key "${nodeId}" does not match node.id "${node.id}".`,
          path: ["nodes", nodeId, "id"],
        });
      }
    }

    for (const [edgeId, edge] of Object.entries(document.edges)) {
      if (edge.id !== edgeId) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge key "${edgeId}" does not match edge.id "${edge.id}".`,
          path: ["edges", edgeId, "id"],
        });
      }

      if (!(edge.sourceNodeId in document.nodes)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge "${edgeId}" references missing source node "${edge.sourceNodeId}".`,
          path: ["edges", edgeId, "sourceNodeId"],
        });
      }

      if (!(edge.targetNodeId in document.nodes)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge "${edgeId}" references missing target node "${edge.targetNodeId}".`,
          path: ["edges", edgeId, "targetNodeId"],
        });
      }
    }

    if (document.activeOutputNodeId && !(document.activeOutputNodeId in document.nodes)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Active output node "${document.activeOutputNodeId}" does not exist.`,
        path: ["activeOutputNodeId"],
      });
    }
  });

export const parseGraphDocument = (input: unknown): GraphDocument => graphDocumentSchema.parse(input);

export const safeParseGraphDocument = (input: unknown) => graphDocumentSchema.safeParse(input);
