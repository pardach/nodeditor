import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { produce } from "immer";
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
  return produce(document, (draft) => {
    switch (command.kind) {
      case "select-node": {
        const isAlreadySelected =
          draft.view.selectedNodeIds.length === 1 &&
          draft.view.selectedNodeIds[0] === command.nodeId &&
          draft.view.selectedEdgeIds.length === 0;
        if (isAlreadySelected) {
          return;
        }

        draft.view.selectedNodeIds = [command.nodeId];
        draft.view.selectedEdgeIds = [];
        markDocumentUpdated(draft);
        return;
      }
      case "update-node-parameter": {
        const node = draft.nodes[command.nodeId];
        if (!node) {
          return;
        }

        if (Object.is(node.parameters[command.parameterId], command.value)) {
          return;
        }

        node.parameters[command.parameterId] = command.value;
        markDocumentUpdated(draft);
        return;
      }
      case "move-node": {
        const node = draft.nodes[command.nodeId];
        if (!node) {
          return;
        }

        const { x, y } = command.position;
        if (node.position.x === x && node.position.y === y) {
          return;
        }

        node.position = command.position;
        markDocumentUpdated(draft);
        return;
      }
      case "add-node": {
        const definition = defaultRegistry[command.nodeType];
        if (!definition) {
          return;
        }

        const node = createGraphNode(command.nodeType, command.position);
        draft.nodes[node.id] = node;
        draft.view.selectedNodeIds = [node.id];
        draft.view.selectedEdgeIds = [];
        markDocumentUpdated(draft);
      }
    }
  });
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

const markDocumentUpdated = (document: GraphDocument): void => {
  document.metadata.updatedAt = new Date().toISOString();
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
