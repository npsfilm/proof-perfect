import { useParams, Navigate } from 'react-router-dom';
import { WorkflowCanvas } from '@/components/admin/workflows/WorkflowCanvas';

export default function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/admin/workflows" replace />;
  }

  return (
    <div className="h-screen bg-background">
      <WorkflowCanvas workflowId={id} />
    </div>
  );
}
