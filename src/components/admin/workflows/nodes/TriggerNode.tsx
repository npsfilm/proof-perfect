import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap } from 'lucide-react';
import { getTriggerDefinition, type TriggerEvent } from '@/types/workflows';

interface TriggerNodeData {
  trigger_event?: TriggerEvent;
  label?: string;
}

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as TriggerNodeData;
  const triggerDef = nodeData.trigger_event ? getTriggerDefinition(nodeData.trigger_event) : null;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md min-w-[180px] transition-all ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-primary/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-primary/10">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Trigger</p>
          <p className="text-sm font-semibold truncate">
            {triggerDef?.label || nodeData.label || 'Event auswählen'}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
