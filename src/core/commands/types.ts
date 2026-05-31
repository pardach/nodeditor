import type { GraphDocument } from '../document/types.js';

export interface Command {
  readonly name: string;
  apply(doc: GraphDocument): GraphDocument;
  revert(doc: GraphDocument): GraphDocument;
}

export interface CommandStack {
  past: Command[];
  future: Command[];
}

export function createStack(): CommandStack {
  return { past: [], future: [] };
}

export function execute(stack: CommandStack, doc: GraphDocument, cmd: Command): {
  doc: GraphDocument;
  stack: CommandStack;
} {
  return {
    doc: cmd.apply(doc),
    stack: { past: [...stack.past, cmd], future: [] },
  };
}

export function undo(stack: CommandStack, doc: GraphDocument): {
  doc: GraphDocument;
  stack: CommandStack;
} | null {
  const cmd = stack.past[stack.past.length - 1];
  if (!cmd) return null;
  return {
    doc: cmd.revert(doc),
    stack: {
      past: stack.past.slice(0, -1),
      future: [cmd, ...stack.future],
    },
  };
}

export function redo(stack: CommandStack, doc: GraphDocument): {
  doc: GraphDocument;
  stack: CommandStack;
} | null {
  const cmd = stack.future[0];
  if (!cmd) return null;
  return {
    doc: cmd.apply(doc),
    stack: {
      past: [...stack.past, cmd],
      future: stack.future.slice(1),
    },
  };
}
