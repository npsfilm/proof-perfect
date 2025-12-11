import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { WorkflowsTab } from '@/components/admin/workflows';

export default function AdminWorkflows() {
  return (
    <PageContainer size="lg">
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Workflows"
          description="Automatisierte Aktionen basierend auf Events konfigurieren"
          breadcrumbs={[{ label: 'Workflows' }]}
        />

        <WorkflowsTab />
      </div>
    </PageContainer>
  );
}
