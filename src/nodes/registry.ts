import type { PortDefinition } from '../core/types/ports.js';
import type { EvalContext } from '../core/eval/context.js';
import type { PortValues } from '../core/types/values.js';

export interface ParamField {
  key: string;
  type: 'float' | 'int' | 'vec2' | 'color' | 'bool' | 'string';
  label: string;
  min?: number;
  max?: number;
}

export interface NodeDefinition {
  typeId: string;
  label: string;
  category: 'primitive' | 'curve' | 'combine' | 'style' | 'utility';
  workspace: Array<'shape' | 'style' | 'export'>;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  defaultParams: Record<string, unknown>;
  evaluate: (ctx: EvalContext) => PortValues;
  icon?: string;
  paramSchema?: ParamField[];
}

const registry = new Map<string, NodeDefinition>();

export function registerNode(def: NodeDefinition): void {
  registry.set(def.typeId, def);
}

export function getNodeDefinition(typeId: string): NodeDefinition | undefined {
  return registry.get(typeId);
}

export function listNodes(workspace?: 'shape' | 'style' | 'export'): NodeDefinition[] {
  const all = [...registry.values()];
  if (!workspace) return all;
  return all.filter((n) => n.workspace.includes(workspace));
}

/** ثبت نودهای builtin — side-effect import */
export function ensureBuiltinNodes(): void {
  if (registry.size > 0) return;
  // dynamic import avoided; builtins registered via import in index
}
