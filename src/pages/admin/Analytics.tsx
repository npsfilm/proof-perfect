import { useAnalytics } from '@/hooks/useAnalytics';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Clock, Wand2, Users, MousePointer, Monitor, Smartphone, Tablet, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#233C63', '#4A90E2', '#7CB342', '#FFA726', '#EF5350'];
const FUNNEL_COLORS = ['#233C63', '#3A5A80', '#5279A0', '#6E99C0'];

export default function Analytics() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: userAnalytics, isLoading: userAnalyticsLoading } = useUserAnalytics(30);

  const isLoading = analyticsLoading || userAnalyticsLoading;

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

  const deviceIcons: Record<string, typeof Monitor> = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  return (
    <PageContainer size="full">
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Analytik-Dashboard"
          description="Leistungskennzahlen, User-Tracking und Hürden-Erkennung"
          breadcrumbs={[{ label: 'Analytik' }]}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="behavior">User-Verhalten</TabsTrigger>
            <TabsTrigger value="hurdles">Hürden-Analyse</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
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

            {/* User Analytics Summary */}
            {userAnalytics && (
              <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Sessions (30 Tage)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userAnalytics.totalSessions}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {userAnalytics.uniqueUsers} aktive Nutzer
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Ø Session-Dauer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.floor(userAnalytics.averageSessionDuration / 60)}m {Math.floor(userAnalytics.averageSessionDuration % 60)}s
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-primary" />
                      Sessions bis Abschluss
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userAnalytics.averageSessionsToFinalize.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ø Besuche pro Galerie
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Zeit bis 1. Besuch
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userAnalytics.averageTimeToFirstVisit > 24
                        ? `${(userAnalytics.averageTimeToFirstVisit / 24).toFixed(1)}d`
                        : `${userAnalytics.averageTimeToFirstVisit.toFixed(1)}h`}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      nach Galerie-Erstellung
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Galerie-Statusverteilung</CardTitle>
                  <CardDescription>Aufschlüsselung nach aktuellem Status</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.galleriesByStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
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

              <Card>
                <CardHeader>
                  <CardTitle>Staging-Stil-Präferenzen</CardTitle>
                  <CardDescription>Meistangefragte Staging-Stile</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.stagingRequests.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.stagingRequests}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="stagingStyle" />
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
                  <ResponsiveContainer width="100%" height={250}>
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
          </TabsContent>

          {/* User Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4 md:space-y-6">
            {userAnalytics ? (
              <>
                {/* Conversion Funnel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion-Funnel</CardTitle>
                    <CardDescription>Wie viele Galerien durchlaufen jeden Schritt?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userAnalytics.conversionFunnel.some(f => f.count > 0) ? (
                      <div className="space-y-4">
                        {userAnalytics.conversionFunnel.map((step, index) => (
                          <div key={step.step} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{step.step}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{step.count}</span>
                                {step.dropOffRate > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    -{step.dropOffRate.toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-500"
                                style={{
                                  width: `${userAnalytics.conversionFunnel[0].count > 0 
                                    ? (step.count / userAnalytics.conversionFunnel[0].count) * 100 
                                    : 0}%`,
                                  backgroundColor: FUNNEL_COLORS[index],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Noch keine Funnel-Daten</p>
                    )}
                  </CardContent>
                </Card>

                {/* Device Stats */}
                <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Gerätenutzung</CardTitle>
                      <CardDescription>Welche Geräte nutzen Ihre Kunden?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userAnalytics.deviceStats.length > 0 ? (
                        <div className="space-y-4">
                          {userAnalytics.deviceStats.map((device) => {
                            const Icon = deviceIcons[device.device] || Monitor;
                            return (
                              <div key={device.device} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                  <span className="capitalize">{device.device}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-semibold">{device.count}</span>
                                  <Badge variant="outline">
                                    {device.conversionRate.toFixed(1)}% Conv.
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-12">Keine Gerätedaten</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lightbox-Interaktionen</CardTitle>
                      <CardDescription>Wie nutzen Kunden die Bildvorschau?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Ø Betrachtungszeit</span>
                          <span className="font-semibold">
                            {userAnalytics.averageLightboxDuration.toFixed(0)}s
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Zoom-Nutzung</span>
                          <span className="font-semibold">
                            {userAnalytics.zoomUsageRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Event Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ereignisse pro Tag</CardTitle>
                    <CardDescription>User-Interaktionen der letzten 30 Tage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userAnalytics.eventsByDay.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={userAnalytics.eventsByDay}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => new Date(date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(date) => new Date(date).toLocaleDateString('de-DE')}
                            formatter={(value) => [value, 'Ereignisse']}
                          />
                          <Bar dataKey="count" fill="#233C63" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">Keine Ereignisdaten</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Keine User-Analytics verfügbar. Aktivieren Sie das Tracking.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Hurdles Analysis Tab */}
          <TabsContent value="hurdles" className="space-y-4 md:space-y-6">
            {userAnalytics ? (
              <>
                {/* Stuck Galleries Alert */}
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Galerien mit Hürden
                    </CardTitle>
                    <CardDescription>
                      Galerien mit 3+ Sessions ohne Finalisierung – hier stockt der Prozess
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userAnalytics.stuckGalleries.length > 0 ? (
                      <div className="space-y-3">
                        {userAnalytics.stuckGalleries.map((gallery) => (
                          <div
                            key={gallery.gallery_id}
                            className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{gallery.gallery_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Erstellt vor {gallery.days_since_sent} Tagen
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {gallery.session_count} Sessions
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Keine Galerien mit Hürden erkannt
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Most Clicked Without Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Oft geklickt, nie ausgewählt</CardTitle>
                    <CardDescription>
                      Diese Fotos werden häufig angeschaut aber nicht ausgewählt – mögliche Qualitätsprobleme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userAnalytics.mostClickedWithoutSelection.length > 0 ? (
                      <div className="space-y-3">
                        {userAnalytics.mostClickedWithoutSelection.map((photo) => (
                          <div
                            key={photo.photo_id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <p className="font-mono text-sm">{photo.photo_id.slice(0, 8)}...</p>
                              <p className="text-xs text-muted-foreground">
                                Galerie: {photo.gallery_id.slice(0, 8)}...
                              </p>
                            </div>
                            <Badge variant="outline">
                              {photo.click_count}× angeschaut
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Keine auffälligen Fotos erkannt
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Peak Usage Heatmap */}
                <Card>
                  <CardHeader>
                    <CardTitle>Nutzungszeiten</CardTitle>
                    <CardDescription>
                      Wann sind Ihre Makler am aktivsten?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userAnalytics.peakUsageHours.length > 0 ? (
                      <div className="space-y-2">
                        {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day, dayIndex) => {
                          const dayHours = userAnalytics.peakUsageHours.filter(h => h.day === dayIndex);
                          const maxCount = Math.max(...userAnalytics.peakUsageHours.map(h => h.count), 1);
                          return (
                            <div key={day} className="flex items-center gap-2">
                              <span className="w-8 text-xs text-muted-foreground">{day}</span>
                              <div className="flex gap-0.5 flex-1">
                                {Array.from({ length: 24 }, (_, hour) => {
                                  const hourData = dayHours.find(h => h.hour === hour);
                                  const intensity = hourData ? hourData.count / maxCount : 0;
                                  return (
                                    <div
                                      key={hour}
                                      className="h-4 flex-1 rounded-sm"
                                      style={{
                                        backgroundColor: intensity > 0 
                                          ? `rgba(35, 60, 99, ${0.2 + intensity * 0.8})`
                                          : 'rgb(var(--muted))',
                                      }}
                                      title={`${day} ${hour}:00 - ${hourData?.count || 0} Events`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex items-center gap-2 mt-4">
                          <span className="w-8" />
                          <div className="flex justify-between flex-1 text-xs text-muted-foreground">
                            <span>0h</span>
                            <span>6h</span>
                            <span>12h</span>
                            <span>18h</span>
                            <span>24h</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Noch keine Nutzungsdaten
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Keine Hürden-Analyse verfügbar. Aktivieren Sie das Tracking.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
