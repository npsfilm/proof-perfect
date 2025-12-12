import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, ListOrdered, Tags, FileText } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { EmailTemplateList } from '@/components/admin/email-settings/EmailTemplateList';
import { TagList, SequenceList, CampaignList } from '@/components/admin/newsletter';

export default function AdminNewsletter() {
  return (
    <PageContainer size="lg">
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Newsletter"
          description="Kampagnen, Sequenzen und Kundensegmente verwalten"
          breadcrumbs={[{ label: 'Newsletter' }]}
        />

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="campaigns" className="flex items-center gap-2 py-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Kampagnen</span>
            </TabsTrigger>
            <TabsTrigger value="sequences" className="flex items-center gap-2 py-2">
              <ListOrdered className="h-4 w-4" />
              <span className="hidden sm:inline">Sequenzen</span>
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-2 py-2">
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Segmente</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 py-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <CampaignList />
          </TabsContent>

          <TabsContent value="sequences">
            <SequenceList />
          </TabsContent>

          <TabsContent value="segments">
            <TagList />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateList category="newsletter" />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}