import type { GraphDocument } from '../document/types.js';
import type { NodeDefinition } from '../../nodes/registry.js';
import type { PortValues } from '../types/values.js';

export interface EvalContext {
  document: GraphDocument;
  nodeId: string;
  definition: NodeDefinition;
  /** ورودی‌های resolve‌شده از لینک یا default */
  inputs: PortValues;
  /** دسترسی به خروجی نودهای upstream از cache */
  getCachedOutput(upstreamNodeId: string): PortValues | undefined;
}

export interface NodeEvalResult {
  outputs: PortValues;
  error?: string;
}
