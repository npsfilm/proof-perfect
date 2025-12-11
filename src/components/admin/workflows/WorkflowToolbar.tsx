import { DragEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NODE_DEFINITIONS, type NodeType } from '@/types/workflows';
import { Zap, Play, Clock, GitBranch, CircleStop } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Play,
  Clock,
  GitBranch,
  CircleStop,
};

const colorMap: Record<NodeType, string> = {
  trigger: 'border-primary/30 hover:border-primary/60 bg-primary/5',
  action: 'border-green-500/30 hover:border-green-500/60 bg-green-500/5',
  delay: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5',
  condition: 'border-purple-500/30 hover:border-purple-500/60 bg-purple-500/5',
  end: 'border-gray-500/30 hover:border-gray-500/60 bg-gray-500/5',
};

const iconColorMap: Record<NodeType, string> = {
  trigger: 'text-primary',
  action: 'text-green-600',
  delay: 'text-amber-600',
  condition: 'text-purple-600',
  end: 'text-gray-600',
};

interface WorkflowToolbarProps {
  onAddNode?: (type: NodeType, position: { x: number; y: number }) => void;
}

export function WorkflowToolbar({ onAddNode }: WorkflowToolbarProps) {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Filter out trigger since it should only exist once at start
  const availableNodes = NODE_DEFINITIONS.filter((n) => n.type !== 'trigger');

  return (
    <Card className="h-full">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium">Bausteine</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        {availableNodes.map((nodeDef) => {
          const Icon = iconMap[nodeDef.icon] || Play;
          return (
            <div
              key={nodeDef.type}
              draggable
              onDragStart={(e) => onDragStart(e, nodeDef.type)}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all ${colorMap[nodeDef.type]}`}
            >
              <Icon className={`h-5 w-5 ${iconColorMap[nodeDef.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{nodeDef.label}</p>
                <p className="text-xs text-muted-foreground truncate">{nodeDef.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
