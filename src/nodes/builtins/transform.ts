import { registerNode } from '../registry.js';
import type { Path2D, Shape2D } from '../../core/types/values.js';

function translatePath(path: Path2D, dx: number, dy: number): Path2D {
  const commands = path.commands.map((c) => {
    switch (c.op) {
      case 'M':
      case 'L':
        return { ...c, x: c.x + dx, y: c.y + dy };
      case 'C':
        return {
          ...c,
          x: c.x + dx,
          y: c.y + dy,
          x1: c.x1 + dx,
          y1: c.y1 + dy,
          x2: c.x2 + dx,
          y2: c.y2 + dy,
        };
      default:
        return c;
    }
  });
  return { ...path, commands };
}

registerNode({
  typeId: 'transform.translate',
  label: 'Translate',
  category: 'utility',
  workspace: ['shape'],
  inputs: [
    {
      id: 'shape',
      label: 'Shape',
      dataType: 'shape',
      optional: false,
    },
  ],
  outputs: [{ id: 'shape', label: 'Shape', dataType: 'shape' }],
  defaultParams: { dx: 0, dy: 0 },
  paramSchema: [
    { key: 'dx', type: 'float', label: 'X' },
    { key: 'dy', type: 'float', label: 'Y' },
  ],
  evaluate(ctx) {
    const shape = ctx.inputs.shape as Shape2D | undefined;
    if (!shape) return { shape: null };
    const node = ctx.document.nodes[ctx.nodeId];
    const dx = Number(node?.params.dx ?? 0);
    const dy = Number(node?.params.dy ?? 0);
    const out: Shape2D = {
      ...shape,
      paths: shape.paths.map((p) => translatePath(p, dx, dy)),
    };
    return { shape: out };
  },
});
