import { nodeDefinitions } from "../../core/nodes/registry";
import { useDocumentStore } from "../../store/documentStore";

export const NodePalette = () => {
  const { dispatchCommand } = useDocumentStore();

  return (
    <div className="node-palette">
      <div className="panel__header">
        <div>
          <span className="eyebrow">Library</span>
          <h2>Node Palette</h2>
        </div>
      </div>
      <p className="muted">
        نودها مثل Houdini به‌صورت تایپ‌شده و قابل ترکیب تعریف شده‌اند؛ هر نود جدید باید فقط یک تعریف pure
        اضافه کند.
      </p>
      <div className="palette-list">
        {nodeDefinitions.map((definition, index) => (
          <button
            className="palette-card"
            key={definition.type}
            type="button"
            onClick={() =>
              dispatchCommand({
                kind: "add-node",
                nodeType: definition.type,
                position: { x: 120 + index * 40, y: 300 + index * 28 },
              })
            }
          >
            <span>{definition.label}</span>
            <small>{definition.category}</small>
          </button>
        ))}
      </div>
    </div>
  );
};
