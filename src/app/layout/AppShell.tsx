import { useMemo } from "react";
import { evaluateGraph } from "../../core/evaluator/evaluateGraph";
import { NodeGraphCanvas } from "../../features/nodeGraph/NodeGraphCanvas";
import { NodePalette } from "../../features/nodeGraph/NodePalette";
import { NodeInspector } from "../../features/inspector/NodeInspector";
import { VectorViewport } from "../../features/viewport/VectorViewport";
import { useDocumentStore } from "../../store/documentStore";

export const AppShell = () => {
  const { document, undo, redo, canUndo, canRedo } = useDocumentStore();
  const evaluation = useMemo(() => evaluateGraph(document), [document]);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <span className="eyebrow">Node Vector Studio</span>
          <h1>{document.title}</h1>
        </div>
        <div className="top-bar__actions">
          <button type="button" onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          <button type="button" onClick={redo} disabled={!canRedo}>
            Redo
          </button>
        </div>
      </header>

      <section className="workspace-grid">
        <aside className="panel panel--palette">
          <NodePalette />
        </aside>

        <section className="panel panel--graph">
          <div className="panel__header">
            <div>
              <span className="eyebrow">DAG</span>
              <h2>Node Graph</h2>
            </div>
            <span className="status-pill">{evaluation.evaluationOrder.length} evaluated</span>
          </div>
          <NodeGraphCanvas evaluation={evaluation} />
        </section>

        <section className="panel panel--viewport">
          <div className="panel__header">
            <div>
              <span className="eyebrow">Evaluated scene</span>
              <h2>2D Vector Viewport</h2>
            </div>
            <span className="status-pill">{evaluation.outputGeometry.shapes.length} shape(s)</span>
          </div>
          <VectorViewport geometry={evaluation.outputGeometry} diagnostics={evaluation.diagnostics} />
        </section>

        <aside className="panel panel--inspector">
          <NodeInspector evaluation={evaluation} />
        </aside>
      </section>
    </main>
  );
};
