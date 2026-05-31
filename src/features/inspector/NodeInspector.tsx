import { getNodeDefinition } from "../../core/nodes/registry";
import type { GraphEvaluationResult, GraphValue } from "../../core/types/graph";
import { useDocumentStore } from "../../store/documentStore";

interface NodeInspectorProps {
  evaluation: GraphEvaluationResult;
}

export const NodeInspector = ({ evaluation }: NodeInspectorProps) => {
  const { document, dispatchCommand } = useDocumentStore();
  const selectedNodeId = document.view.selectedNodeIds[0];
  const selectedNode = selectedNodeId ? document.nodes[selectedNodeId] : undefined;
  const definition = selectedNode ? getNodeDefinition(selectedNode.type) : undefined;

  if (!selectedNode || !definition) {
    return (
      <div>
        <div className="panel__header">
          <div>
            <span className="eyebrow">Properties</span>
            <h2>Inspector</h2>
          </div>
        </div>
        <p className="muted">یک نود را انتخاب کنید تا پارامترها و خروجی ارزیابی‌شده دیده شود.</p>
      </div>
    );
  }

  const nodeResult = evaluation.nodeResults[selectedNode.id];

  return (
    <div className="inspector">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Properties</span>
          <h2>{selectedNode.label ?? definition.label}</h2>
        </div>
      </div>
      <p className="muted">{definition.description}</p>

      <div className="inspector-section">
        <h3>Parameters</h3>
        {definition.parameters.length === 0 ? <p className="muted">این نود پارامتر مستقیم ندارد.</p> : null}
        {definition.parameters.map((parameter) => (
          <label className="param-row" key={parameter.id}>
            <span>{parameter.label}</span>
            <input
              type="number"
              min={parameter.min}
              max={parameter.max}
              step={parameter.step ?? 1}
              value={numberValue(selectedNode.parameters[parameter.id] ?? parameter.defaultValue)}
              onChange={(event) =>
                dispatchCommand({
                  kind: "update-node-parameter",
                  nodeId: selectedNode.id,
                  parameterId: parameter.id,
                  value: Number(event.target.value),
                })
              }
            />
          </label>
        ))}
      </div>

      <div className="inspector-section">
        <h3>Evaluation</h3>
        <dl className="evaluation-list">
          <div>
            <dt>Outputs</dt>
            <dd>{Object.keys(nodeResult?.outputs ?? {}).join(", ") || "none"}</dd>
          </div>
          <div>
            <dt>Diagnostics</dt>
            <dd>{nodeResult?.diagnostics.length ?? 0}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

const numberValue = (value: GraphValue) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
