import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Clock, Wand2, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';

const COLORS = ['#233C63', '#4A90E2', '#7CB342', '#FFA726', '#EF5350'];

export default function Analytics() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Keine Analysedaten verfügbar</p>
      </div>
    );
  }

  return (
    <PageContainer size="full">
      <div className="space-y-6">
        <PageHeader
          title="Analytik-Dashboard"
          description="Leistungskennzahlen und Einblicke"
          breadcrumbs={[{ label: 'Analytik' }]}
        />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Galerien gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGalleries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Durchschn. Auswahlrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageSelectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              der Zielpaketgröße
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Durchschn. Prüfzeit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageReviewTime > 24
                ? `${(analytics.averageReviewTime / 24).toFixed(1)}d`
                : `${analytics.averageReviewTime.toFixed(1)}h`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              von gesendet bis geprüft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Staging-Anfragen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.stagingRequests.reduce((sum, s) => sum + s.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fotos mit Staging gesamt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gallery Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Galerie-Statusverteilung</CardTitle>
            <CardDescription>Aufschlüsselung nach aktuellem Status</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.galleriesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.galleriesByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.galleriesByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Keine Daten verfügbar</p>
            )}
          </CardContent>
        </Card>

        {/* Staging Styles */}
        <Card>
          <CardHeader>
            <CardTitle>Staging-Stil-Präferenzen</CardTitle>
            <CardDescription>Meistangefragte Staging-Stile</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.stagingRequests.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.stagingRequests}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="style" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#233C63" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">Noch keine Staging-Anfragen</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Galerie-Aktivität (Letzte 30 Tage)</CardTitle>
          <CardDescription>Gesendete, geprüfte und ausgelieferte Galerien im Zeitverlauf</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString('de-DE')}
                />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#4A90E2" name="Gesendet" />
                <Line type="monotone" dataKey="reviewed" stroke="#FFA726" name="Geprüft" />
                <Line type="monotone" dataKey="delivered" stroke="#7CB342" name="Ausgeliefert" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">Keine aktuellen Aktivitäten</p>
          )}
        </CardContent>
      </Card>

      {/* Top Engaged Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top engagierte Kunden</CardTitle>
          <CardDescription>Aktivste Kunden nach Galerie-Anzahl und Auswahlen</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topEngagedClients.length > 0 ? (
            <div className="space-y-4">
              {analytics.topEngagedClients.map((client, index) => (
                <div
                  key={client.email}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{client.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.comments} {client.comments !== 1 ? 'Kommentare' : 'Kommentar'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-semibold">{client.galleries}</p>
                      <p className="text-xs text-muted-foreground">Galerien</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{client.selections}</p>
                      <p className="text-xs text-muted-foreground">Auswahlen</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">Keine Kundendaten verfügbar</p>
          )}
        </CardContent>
      </Card>
      </div>
    </PageContainer>
  );
}