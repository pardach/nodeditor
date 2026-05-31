import { describe, it, expect, beforeAll } from 'vitest';
import { createEmptyDocument } from '../document/graph.js';
import { evaluateGraph } from './engine.js';
import '../../nodes/index.js';

describe('evaluateGraph', () => {
  beforeAll(() => {
    // builtins registered via side-effect import
  });

  it('evaluates rectangle node', () => {
    let doc = createEmptyDocument();
    doc = {
      ...doc,
      nodes: {
        r1: {
          id: 'r1',
          typeId: 'primitive.rectangle',
          params: { width: 50, height: 30 },
          position: { x: 0, y: 0 },
          flags: { preview: true },
        },
      },
      view: { ...doc.view, previewNodeId: 'r1' },
    };

    const result = evaluateGraph(doc);
    expect(result.hasCycle).toBe(false);
    const out = result.cache.outputs.get('r1');
    expect(out?.shape).toBeDefined();
    const shape = out!.shape as { paths: unknown[] };
    expect(shape.paths).toHaveLength(1);
  });

  it('chains translate after rectangle', () => {
    let doc = createEmptyDocument();
    doc = {
      ...doc,
      nodes: {
        r1: {
          id: 'r1',
          typeId: 'primitive.rectangle',
          params: { width: 10, height: 10 },
          position: { x: 0, y: 0 },
        },
        t1: {
          id: 't1',
          typeId: 'transform.translate',
          params: { dx: 5, dy: 5 },
          position: { x: 200, y: 0 },
          flags: { preview: true },
        },
      },
      edges: {
        e1: {
          id: 'e1',
          from: { nodeId: 'r1', portId: 'shape' },
          to: { nodeId: 't1', portId: 'shape' },
        },
      },
      view: { ...doc.view, previewNodeId: 't1' },
    };

    const result = evaluateGraph(doc);
    expect(result.hasCycle).toBe(false);
    const shape = result.cache.outputs.get('t1')?.shape as {
      paths: { commands: { op: string; x?: number; y?: number }[] }[];
    };
    const first = shape.paths[0].commands[0];
    expect(first).toMatchObject({ op: 'M', x: 5, y: 5 });
  });
});
