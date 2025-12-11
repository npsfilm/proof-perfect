import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CircleStop } from 'lucide-react';

interface EndNodeData {
  label?: string;
}

export const EndNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as EndNodeData;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md min-w-[120px] transition-all ${
        selected ? 'border-gray-500 ring-2 ring-gray-500/20' : 'border-gray-400/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-500 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-gray-500/10">
          <CircleStop className="h-4 w-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{nodeData.label || 'Ende'}</p>
        </div>
      </div>
    </div>
  );
});

EndNode.displayName = 'EndNode';
