import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, Mail, Webhook, Calendar, Images, RefreshCw, Bell } from 'lucide-react';
import { getActionDefinition, type ActionType } from '@/types/workflows';

interface ActionNodeData {
  action_type?: ActionType;
  label?: string;
  node_config?: Record<string, unknown>;
}

const actionIcons: Record<string, React.ElementType> = {
  send_email: Mail,
  send_webhook: Webhook,
  create_calendar_event: Calendar,
  create_gallery: Images,
  update_gallery_status: RefreshCw,
  notify_admin: Bell,
};

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as ActionNodeData;
  const actionDef = nodeData.action_type ? getActionDefinition(nodeData.action_type) : null;
  const Icon = nodeData.action_type ? actionIcons[nodeData.action_type] || Play : Play;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md min-w-[180px] transition-all ${
        selected ? 'border-green-500 ring-2 ring-green-500/20' : 'border-green-500/50'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-background"
      />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-green-500/10">
          <Icon className="h-4 w-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Aktion</p>
          <p className="text-sm font-semibold truncate">
            {actionDef?.label || nodeData.label || 'Aktion auswählen'}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-background"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';
