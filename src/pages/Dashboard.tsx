import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { KPICard } from '@/components/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Sparkles, TrendingUp, Percent, DollarSign, Calendar, ClipboardList } from 'lucide-react';
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
import { KPI } from '@/types';

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

  // Map API data to KPIs with trend indicators
  const kpis: KPI[] = [
    {
      label: 'Total Revenue',
      value: `$${(data.total_revenue?.value ?? 0).toLocaleString()}`,
      change: data.total_revenue?.percentage_change,
      changeLabel: data.total_revenue?.label,
      trend: data.total_revenue?.trend_direction,
    },
    {
      label: 'Property Revenue',
      value: `$${(data.property_revenue?.value ?? 0).toLocaleString()}`,
      change: data.property_revenue?.percentage_change,
      changeLabel: data.property_revenue?.label,
      trend: data.property_revenue?.trend_direction,
    },
    {
      label: 'Service Revenue',
      value: `$${(data.service_revenue?.value ?? 0).toLocaleString()}`,
      change: data.service_revenue?.percentage_change,
      changeLabel: data.service_revenue?.label,
      trend: data.service_revenue?.trend_direction,
    },
    {
      label: 'Occupancy Rate',
      value: `${data.overall_occupancy_rate?.value ?? 0}%`,
      change: data.overall_occupancy_rate?.percentage_change,
      changeLabel: data.overall_occupancy_rate?.label,
      trend: data.overall_occupancy_rate?.trend_direction,
    },
    {
      label: 'Avg Daily Rate',
      value: `$${(data.average_daily_rate?.value ?? 0).toLocaleString()}`,
      change: data.average_daily_rate?.percentage_change,
      changeLabel: data.average_daily_rate?.label,
      trend: data.average_daily_rate?.trend_direction,
    },
    {
      label: 'Active Bookings',
      value: data.active_bookings?.value ?? 0,
      change: data.active_bookings?.percentage_change,
      changeLabel: data.active_bookings?.label,
      trend: data.active_bookings?.trend_direction,
    },
  ];

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
          <RevenueForecastCard forecast={data.revenue_forecast} />
          <PaymentStatusCard payments={data.payment_collection} />
        </div>

        {/* Revenue Trends - Full Width */}
        {isSectionVisible('revenueTrends') && (
          <DashboardSection title="Revenue Trends" description="Compare revenue with same period last year">
            <RevenueTrendChart
              currentPeriod={data.revenue_trends.current_period}
              lastYearPeriod={data.revenue_trends.last_year_period}
            />
          </DashboardSection>
        )}

        {/* Occupancy & Channel Revenue Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isSectionVisible('occupancyByProperty') && (
            <DashboardSection title="Occupancy by Property" description="Property occupancy rates this period">
              <OccupancyChart data={data.occupancy_by_property} />
            </DashboardSection>
          )}

          {isSectionVisible('revenueByChannel') && (
            <DashboardSection title="Revenue by Channel" description="Booking platform distribution">
              <RevenueByChannelChart data={data.revenue_by_channel} />
            </DashboardSection>
          )}
        </div>

        {/* Upcoming Events */}
        {isSectionVisible('upcomingEvents') && (
          <DashboardSection title="Upcoming Check-ins & Check-outs" description="Today and tomorrow's arrivals and departures">
            <UpcomingEventsWidget
              checkIns={data.upcoming_check_ins}
              checkOuts={data.upcoming_check_outs}
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
                      <p className="font-medium text-foreground">{property.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {property.revenue != null ? `$${property.revenue.toLocaleString()}` : 'N/A'}
                      </p>
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
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="font-semibold text-foreground">${(service.value ?? 0).toLocaleString()}</p>
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
                {(() => {
                  const origins = data.guest_origins ?? [];
                  const total = origins.reduce((sum, o) => sum + (o.value ?? 0), 0);
                  return origins.map((location, index) => {
                    const pct = total > 0 ? ((location.value / total) * 100).toFixed(1) : '0';
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{location.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground">
                              {location.value}%
                            </span>
                            <Badge variant="secondary">{pct}%</Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${location.value}%` }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority Tasks */}
        {isSectionVisible('priorityTasks') && data.priority_tasks && data.priority_tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5 text-orange-500" />
                Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.priority_tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => navigate('/crews')}
                  >
                    <Badge className="bg-orange-500 text-white shrink-0">
                      #{task.reservation_id.slice(-6)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.property}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
