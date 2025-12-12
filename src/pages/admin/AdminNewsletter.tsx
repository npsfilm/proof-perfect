import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, ListOrdered, Tags, FileText } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Send, Clock, Users } from 'lucide-react';
import { EmailTemplateList } from '@/components/admin/email-settings/EmailTemplateList';

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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>E-Mail-Sequenzen</CardTitle>
                    <CardDescription>
                      Automatisierte E-Mail-Abfolgen für verschiedene Auslöser
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Neue Sequenz
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <ListOrdered className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Noch keine Sequenzen</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Erstelle automatische E-Mail-Sequenzen, die z.B. nach einer Registrierung oder Buchung gestartet werden.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
                    <Card className="p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Willkommen</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        E-Mail-Serie für neue Kunden
                      </p>
                    </Card>
                    <Card className="p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Send className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Nach Buchung</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Follow-up nach Aufträgen
                      </p>
                    </Card>
                    <Card className="p-4 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Reaktivierung</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Inaktive Kunden ansprechen
                      </p>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="segments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kundensegmente & Tags</CardTitle>
                    <CardDescription>
                      Segmentiere Kunden nach Verhalten und Eigenschaften
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Neuer Tag
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Tags className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Keine Segmente definiert</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Erstelle Tags und Segmente, um Kunden nach Kriterien wie Umsatz, Buchungsverhalten oder Servicenutzung zu gruppieren.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Vielbucher</span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">Hoher Umsatz</span>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">Staging-Kunde</span>
                    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm">Inaktiv</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm">Blue Hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateList category="newsletter" />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
