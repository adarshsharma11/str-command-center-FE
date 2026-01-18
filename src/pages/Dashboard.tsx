import { Layout } from '@/components/Layout';
import { KPICard } from '@/components/KPICard';
import { PriorityTaskWidget } from '@/components/PriorityTaskWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Sparkles, Loader2 } from 'lucide-react';
import { useDashboardMetricsQuery } from '@/lib/api/dashboard';
import { KPI, Task, Priority, TaskType, TaskStatus } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useDashboardMetricsQuery();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-6 w-32 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0,1].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-56 bg-muted rounded" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="h-4 w-40 bg-muted rounded" />
                      <div className="h-4 w-20 bg-muted rounded" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !dashboardData?.data) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-red-500">Error loading dashboard data: {error?.message || 'Unknown error'}</div>
        </div>
      </Layout>
    );
  }

  const { data } = dashboardData;

  // Map API data to KPIs
  const kpis: KPI[] = [
    {
      label: 'Total Revenue',
      value: `$${data.total_revenue.value.toLocaleString()}`,
      change: data.total_revenue.percentage_change,
      changeLabel: data.total_revenue.label,
      trend: data.total_revenue.trend_direction,
    },
    {
      label: 'Property Revenue',
      value: `$${data.property_revenue.value.toLocaleString()}`,
      change: data.property_revenue.percentage_change,
      changeLabel: data.property_revenue.label,
      trend: data.property_revenue.trend_direction,
    },
    {
      label: 'Service Revenue',
      value: `$${data.service_revenue.value.toLocaleString()}`,
      change: data.service_revenue.percentage_change,
      changeLabel: data.service_revenue.label,
      trend: data.service_revenue.trend_direction,
    },
    {
      label: 'Active Bookings',
      value: data.active_bookings.value,
      change: data.active_bookings.percentage_change,
      changeLabel: data.active_bookings.label,
      trend: data.active_bookings.trend_direction,
    },
  ];

  // Map API tasks to Task interface
  // Note: API provides a simplified task object, so we map it to the internal Task interface
  // filling in missing required fields with placeholders or derived values.
  const tasks: Task[] = data.priority_tasks.map((t) => ({
    id: t.id.toString(),
    title: t.title,
    type: t.type as TaskType,
    priority: t.priority as Priority,
    status: (t.status === 'urgent' ? 'Pending' : 'In Progress') as TaskStatus, // Mapping status roughly
    dueDate: new Date(t.due_date),
    description: t.title, // Fallback
    propertyId: 'unknown', // Fallback
  }));

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Luxury rental operations overview</p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <KPICard
              key={index}
              kpi={kpi}
              onClick={() => {
                if (kpi.label.includes('Revenue') || kpi.label.includes('Bookings')) {
                  navigate('/bookings');
                }
              }}
            />
          ))}
        </div>

        {/* Top Performing Properties & Services Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Top Performing Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.top_performing_properties.map((property, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{property.name}</p>
                      <p className="text-sm text-muted-foreground">{property.bookings_count} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${property.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Luxury Services Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.luxury_services_revenue.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.bookings_count} bookings</p>
                  </div>
                  <p className="font-semibold text-foreground">${service.revenue.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Guest Location Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Guest Origins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.guest_origins.map((location, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{location.origin}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {location.bookings} bookings
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        ${location.revenue.toLocaleString()}
                      </span>
                      <Badge variant="secondary">{location.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${location.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Tasks */}
        <PriorityTaskWidget
          tasks={tasks}
          onTaskClick={(taskId) => navigate('/crews')}
        />
      </div>
    </Layout>
  );
}
