import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { DELAY_UNITS, type DelayUnit } from '@/types/workflows';

interface DelayNodeData {
  label?: string;
  node_config?: {
    delay_value?: number;
    delay_unit?: DelayUnit;
  };
}

export const DelayNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as DelayNodeData;
  const config = nodeData.node_config || {};
  const delayValue = config.delay_value || 1;
  const delayUnit = config.delay_unit || 'hours';
  const unitLabel = DELAY_UNITS.find((u) => u.value === delayUnit)?.label || 'Stunden';

  const displayText = `${delayValue} ${unitLabel}`;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md min-w-[180px] transition-all ${
        selected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-amber-500/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-amber-500/10">
          <Clock className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Verzögerung</p>
          <p className="text-sm font-semibold truncate">{displayText}</p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-background"
      />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';
