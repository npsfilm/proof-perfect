import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { CONDITION_OPERATORS, type ConditionOperator } from '@/types/workflows';

interface ConditionNodeData {
  label?: string;
  node_config?: {
    field?: string;
    operator?: ConditionOperator;
    value?: string;
  };
}

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ConditionNodeData;
  const config = nodeData.node_config || {};
  const field = config.field || 'Variable';
  const operator = config.operator || 'equals';
  const operatorLabel = CONDITION_OPERATORS.find((o) => o.value === operator)?.label || operator;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md min-w-[200px] transition-all ${
        selected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-500/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-purple-500/10">
          <GitBranch className="h-4 w-4 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Bedingung</p>
          <p className="text-sm font-semibold truncate">
            {field} {operatorLabel}
          </p>
        </div>
      </div>

      {/* True branch - left */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-background !left-[30%]"
      />
      <div className="absolute -bottom-5 left-[30%] -translate-x-1/2 text-[10px] font-medium text-green-600">
        Ja
      </div>

      {/* False branch - right */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-background !left-[70%]"
      />
      <div className="absolute -bottom-5 left-[70%] -translate-x-1/2 text-[10px] font-medium text-red-600">
        Nein
      </div>
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
