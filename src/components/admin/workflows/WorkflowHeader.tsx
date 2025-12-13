import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ArrowLeft, FlaskConical, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkflowHeaderProps {
  workflowName: string;
  onNameChange: (name: string) => void;
  showTestPanel: boolean;
  onToggleTestPanel: () => void;
  isSaving: boolean;
  onSave: () => void;
}

export function WorkflowHeader({
  workflowName,
  onNameChange,
  showTestPanel,
  onToggleTestPanel,
  isSaving,
  onSave,
}: WorkflowHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/workflows')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Input
          value={workflowName}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 w-[300px]"
          placeholder="Workflow-Name"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant={showTestPanel ? "default" : "outline"} 
          onClick={onToggleTestPanel}
        >
          {showTestPanel ? (
            <X className="h-4 w-4 mr-2" />
          ) : (
            <FlaskConical className="h-4 w-4 mr-2" />
          )}
          {showTestPanel ? 'Schließen' : 'Testen'}
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Speichern...' : 'Speichern'}
        </Button>
      </div>
    </div>
  );
}
