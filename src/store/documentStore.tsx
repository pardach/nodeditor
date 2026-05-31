import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { defaultRegistry } from "../core/nodes/registry";
import type { GraphDocument, GraphNode, GraphValue, NodeId, NodeType } from "../core/types/graph";
import type { Vec2 } from "../core/types/primitives";
import { createSampleDocument } from "./sampleDocument";

export type DocumentCommand =
  | { kind: "select-node"; nodeId: NodeId }
  | { kind: "update-node-parameter"; nodeId: NodeId; parameterId: string; value: GraphValue }
  | { kind: "move-node"; nodeId: NodeId; position: Vec2 }
  | { kind: "add-node"; nodeType: NodeType; position: Vec2 };

interface DocumentHistoryState {
  past: GraphDocument[];
  present: GraphDocument;
  future: GraphDocument[];
}

interface DocumentStoreValue {
  document: GraphDocument;
  dispatchCommand: (command: DocumentCommand) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DocumentStoreContext = createContext<DocumentStoreValue | undefined>(undefined);

export const DocumentStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(documentReducer, undefined, () => ({
    past: [],
    present: createSampleDocument(),
    future: [],
  }));

  const dispatchCommand = useCallback((command: DocumentCommand) => dispatch({ type: "command", command }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const value = useMemo<DocumentStoreValue>(
    () => ({
      document: state.present,
      dispatchCommand,
      undo,
      redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [dispatchCommand, redo, state.future.length, state.past.length, state.present, undo],
  );

  return <DocumentStoreContext.Provider value={value}>{children}</DocumentStoreContext.Provider>;
};

export const useDocumentStore = () => {
  const value = useContext(DocumentStoreContext);
  if (!value) {
    throw new Error("useDocumentStore must be used within DocumentStoreProvider.");
  }

  return value;
};

type ReducerAction =
  | { type: "command"; command: DocumentCommand }
  | { type: "undo" }
  | { type: "redo" };

const documentReducer = (state: DocumentHistoryState, action: ReducerAction): DocumentHistoryState => {
  switch (action.type) {
    case "command": {
      const nextDocument = applyCommand(state.present, action.command);
      if (nextDocument === state.present) {
        return state;
      }

      return {
        past: [...state.past, state.present],
        present: nextDocument,
        future: [],
      };
    }
    case "undo": {
      const previous = state.past.at(-1);
      if (!previous) {
        return state;
      }

      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      const next = state.future[0];
      if (!next) {
        return state;
      }

      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
  }
};

const applyCommand = (document: GraphDocument, command: DocumentCommand): GraphDocument => {
  switch (command.kind) {
    case "select-node":
      return touchDocument({
        ...document,
        view: {
          ...document.view,
          selectedNodeIds: [command.nodeId],
          selectedEdgeIds: [],
        },
      });
    case "update-node-parameter": {
      const node = document.nodes[command.nodeId];
      if (!node) {
        return document;
      }

      return touchDocument({
        ...document,
        nodes: {
          ...document.nodes,
          [node.id]: {
            ...node,
            parameters: {
              ...node.parameters,
              [command.parameterId]: command.value,
            },
          },
        },
      });
    }
    case "move-node": {
      const node = document.nodes[command.nodeId];
      if (!node) {
        return document;
      }

      return touchDocument({
        ...document,
        nodes: {
          ...document.nodes,
          [node.id]: {
            ...node,
            position: command.position,
          },
        },
      });
    }
    case "add-node": {
      const definition = defaultRegistry[command.nodeType];
      if (!definition) {
        return document;
      }

      const node = createGraphNode(command.nodeType, command.position);

      return touchDocument({
        ...document,
        nodes: {
          ...document.nodes,
          [node.id]: node,
        },
        view: {
          ...document.view,
          selectedNodeIds: [node.id],
          selectedEdgeIds: [],
        },
      });
    }
  }
};

const createGraphNode = (nodeType: NodeType, position: Vec2): GraphNode => {
  const definition = defaultRegistry[nodeType];
  const id = `node:${nodeType}:${createId()}`;

  return {
    id,
    type: nodeType,
    label: definition.label,
    position,
    parameters: Object.fromEntries(
      definition.parameters.map((parameter) => [parameter.id, parameter.defaultValue]),
    ),
  };
};

const touchDocument = (document: GraphDocument): GraphDocument => ({
  ...document,
  metadata: {
    ...document.metadata,
    updatedAt: new Date().toISOString(),
  },
});

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
