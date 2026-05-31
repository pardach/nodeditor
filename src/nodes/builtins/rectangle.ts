import { registerNode } from '../registry.js';
import type { Path2D } from '../../core/types/values.js';

function rectPath(w: number, h: number): Path2D {
  return {
    closed: true,
    commands: [
      { op: 'M', x: 0, y: 0 },
      { op: 'L', x: w, y: 0 },
      { op: 'L', x: w, y: h },
      { op: 'L', x: 0, y: h },
      { op: 'Z' },
    ],
  };
}

registerNode({
  typeId: 'primitive.rectangle',
  label: 'Rectangle',
  category: 'primitive',
  workspace: ['shape'],
  inputs: [],
  outputs: [{ id: 'shape', label: 'Shape', dataType: 'shape' }],
  defaultParams: { width: 100, height: 80 },
  paramSchema: [
    { key: 'width', type: 'float', label: 'Width', min: 0 },
    { key: 'height', type: 'float', label: 'Height', min: 0 },
  ],
  evaluate(ctx) {
    const node = ctx.document.nodes[ctx.nodeId];
    const width = Number(node?.params.width ?? ctx.definition.defaultParams.width);
    const height = Number(node?.params.height ?? ctx.definition.defaultParams.height);
    const path = rectPath(width, height);
    const shape: import('../../core/types/values.js').Shape2D = {
      paths: [path],
      windingRule: 'nonzero',
    };
    return { shape };
  },
});
