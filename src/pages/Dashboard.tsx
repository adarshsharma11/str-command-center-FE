import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { KPICard } from '@/components/KPICard';
import { PriorityTaskWidget } from '@/components/PriorityTaskWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Sparkles, TrendingUp, Percent, DollarSign } from 'lucide-react';
import { useDashboardExtendedQuery } from '@/lib/api/dashboard';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import {
  DashboardHeader,
  DashboardSection,
  DashboardCustomizer,
  RevenueTrendChart,
  OccupancyChart,
  RevenueByChannelChart,
  UpcomingEventsWidget,
  RevenueForecastCard,
  PaymentStatusCard,
} from '@/components/dashboard';
import { KPI, Task, Priority, TaskType, TaskStatus } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Date range filter
  const dateFilter = useDateRangeFilter({ defaultPreset: 'thisMonth' });

  // Dashboard section preferences
  const dashboardPrefs = useDashboardPreferences();
  const { isSectionVisible } = dashboardPrefs;

  // Fetch extended dashboard data
  const { data: dashboardData, isLoading, error } = useDashboardExtendedQuery(dateFilter.apiParams);

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              <div className="h-10 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 w-56 bg-muted rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Use empty defaults when API fails so the dashboard still renders
  const emptyMetric = { value: 0, percentage_change: 0, trend_direction: 'neutral' as const, label: '' };
  const data = dashboardData?.data ?? {
    total_revenue: emptyMetric,
    property_revenue: emptyMetric,
    service_revenue: emptyMetric,
    active_bookings: emptyMetric,
    average_daily_rate: emptyMetric,
    overall_occupancy_rate: emptyMetric,
    pending_payments: emptyMetric,
    top_performing_properties: [],
    luxury_services_revenue: [],
    guest_origins: [],
    priority_tasks: [],
    revenue_forecast: [],
    revenue_trends: { current_period: [], last_year_period: [] },
    occupancy_by_property: [],
    revenue_by_channel: [],
    payment_collection: { paid: 0, partial: 0, pending: 0, total: 0 },
    upcoming_check_ins: [],
    upcoming_check_outs: [],
  };

  // Map API data to KPIs (simplified - no comparison labels)
  const kpis: KPI[] = [
    { label: 'Total Revenue', value: `$${(data.total_revenue?.value ?? 0).toLocaleString()}` },
    { label: 'Property Revenue', value: `$${(data.property_revenue?.value ?? 0).toLocaleString()}` },
    { label: 'Service Revenue', value: `$${(data.service_revenue?.value ?? 0).toLocaleString()}` },
    { label: 'Occupancy Rate', value: `${data.overall_occupancy_rate?.value ?? 0}%` },
    { label: 'Avg Daily Rate', value: `$${(data.average_daily_rate?.value ?? 0).toLocaleString()}` },
    { label: 'Pending Payments', value: `$${(data.pending_payments?.value ?? 0).toLocaleString()}` },
  ];

  // Map API tasks to Task interface
  const tasks: Task[] = (data.priority_tasks ?? []).map((t) => ({
    id: t.id.toString(),
    title: t.title,
    type: t.type as TaskType,
    priority: t.priority as Priority,
    status: (t.status === 'urgent' ? 'Pending' : 'In Progress') as TaskStatus,
    dueDate: new Date(t.due_date),
    description: t.title,
    propertyId: 'unknown',
  }));

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header with date range picker and customize button */}
        <DashboardHeader
          dateFilter={dateFilter}
          onOpenCustomizer={() => setCustomizerOpen(true)}
        />

        {/* Dashboard Customizer Sheet */}
        <DashboardCustomizer
          open={customizerOpen}
          onOpenChange={setCustomizerOpen}
          preferences={dashboardPrefs}
        />

        {/* KPI Cards Grid - Extended to 6 cards */}
        {isSectionVisible('kpis') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
        )}

        {/* Revenue Forecast + Payment Status Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueForecastCard forecast={data.revenue_forecast ?? []} />
          <PaymentStatusCard payments={data.payment_collection ?? { paid: 0, partial: 0, pending: 0, total: 0 }} />
        </div>

        {/* Revenue Trends - Full Width */}
        {isSectionVisible('revenueTrends') && (
          <DashboardSection title="Revenue Trends" description="Compare revenue with same period last year">
            <RevenueTrendChart
              currentPeriod={data.revenue_trends?.current_period ?? []}
              lastYearPeriod={data.revenue_trends?.last_year_period ?? []}
            />
          </DashboardSection>
        )}

        {/* Occupancy & Channel Revenue Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isSectionVisible('occupancyByProperty') && (
            <DashboardSection title="Occupancy by Property" description="Property occupancy rates this period">
              <OccupancyChart data={data.occupancy_by_property ?? []} />
            </DashboardSection>
          )}

          {isSectionVisible('revenueByChannel') && (
            <DashboardSection title="Revenue by Channel" description="Booking platform distribution">
              <RevenueByChannelChart data={data.revenue_by_channel ?? []} />
            </DashboardSection>
          )}
        </div>

        {/* Upcoming Events */}
        {isSectionVisible('upcomingEvents') && (
          <DashboardSection title="Upcoming Check-ins & Check-outs" description="Today and tomorrow's arrivals and departures">
            <UpcomingEventsWidget
              checkIns={data.upcoming_check_ins ?? []}
              checkOuts={data.upcoming_check_outs ?? []}
            />
          </DashboardSection>
        )}

        {/* Top Performing Properties & Services Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isSectionVisible('topProperties') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Top Performing Properties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(data.top_performing_properties ?? []).map((property, index) => (
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
                      <p className="font-semibold text-foreground">${(property.revenue ?? 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {isSectionVisible('servicesRevenue') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Luxury Services Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data.luxury_services_revenue ?? []).map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.bookings_count} bookings</p>
                    </div>
                    <p className="font-semibold text-foreground">${(service.revenue ?? 0).toLocaleString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Guest Location Analytics */}
        {isSectionVisible('guestOrigins') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Guest Origins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(data.guest_origins ?? []).map((location, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{location.origin}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {location.bookings} bookings
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          ${(location.revenue ?? 0).toLocaleString()}
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
        )}

        {/* Priority Tasks */}
        {isSectionVisible('priorityTasks') && (
          <PriorityTaskWidget
            tasks={tasks}
            onTaskClick={(taskId) => navigate('/crews')}
          />
        )}
      </div>
    </Layout>
  );
}
