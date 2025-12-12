import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, ListOrdered, Tags, FileText } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Send, Clock, Users } from 'lucide-react';
import { EmailTemplateList } from '@/components/admin/email-settings/EmailTemplateList';
import { TagList, SequenceList } from '@/components/admin/newsletter';

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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Newsletter-Kampagnen</CardTitle>
                    <CardDescription>
                      Erstelle und versende Newsletter an deine Kunden
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Neue Kampagne
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Newspaper className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Noch keine Kampagnen</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Erstelle deine erste Newsletter-Kampagne, um Kunden über Neuigkeiten und Angebote zu informieren.
                  </p>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Erste Kampagne erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
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
