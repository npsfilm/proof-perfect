import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Clock, Wand2, Users } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Galleries
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
              Avg Selection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageSelectionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of target package size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Avg Review Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageReviewTime > 24
                ? `${(analytics.averageReviewTime / 24).toFixed(1)}d`
                : `${analytics.averageReviewTime.toFixed(1)}h`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              from sent to reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Staging Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.stagingRequests.reduce((sum, s) => sum + s.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              total photos with staging
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gallery Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gallery Status Distribution</CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
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
              <p className="text-center text-muted-foreground py-12">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Staging Styles */}
        <Card>
          <CardHeader>
            <CardTitle>Staging Style Preferences</CardTitle>
            <CardDescription>Most requested staging styles</CardDescription>
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
              <p className="text-center text-muted-foreground py-12">No staging requests yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Activity (Last 30 Days)</CardTitle>
          <CardDescription>Sent, reviewed, and delivered galleries over time</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#4A90E2" name="Sent" />
                <Line type="monotone" dataKey="reviewed" stroke="#FFA726" name="Reviewed" />
                <Line type="monotone" dataKey="delivered" stroke="#7CB342" name="Delivered" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Top Engaged Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Engaged Clients</CardTitle>
          <CardDescription>Most active clients by gallery count and selections</CardDescription>
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
                        {client.comments} comment{client.comments !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-semibold">{client.galleries}</p>
                      <p className="text-xs text-muted-foreground">Galleries</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{client.selections}</p>
                      <p className="text-xs text-muted-foreground">Selections</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No client data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
