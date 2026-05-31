import { registerNode } from '../registry.js';

registerNode({
  typeId: 'utility.reroute',
  label: 'Reroute',
  category: 'utility',
  workspace: ['shape', 'style', 'export'],
  inputs: [{ id: 'in', label: '', dataType: 'any', optional: true }],
  outputs: [{ id: 'out', label: '', dataType: 'any' }],
  defaultParams: {},
  evaluate(ctx) {
    return { out: ctx.inputs.in ?? null };
  },
});
