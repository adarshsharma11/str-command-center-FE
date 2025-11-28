import { Layout } from '@/components/Layout';
import { KPICard } from '@/components/KPICard';
import { PriorityTaskWidget } from '@/components/PriorityTaskWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockKPIs, mockTasks, mockServices, mockLocationStats, mockProperties, mockBookings } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, MapPin, Home, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  // TODO: INTEGRATION STUB: Replace with Supabase queries
  const kpis = mockKPIs;
  const tasks = mockTasks.filter(t => t.priority === 'P1' || t.priority === 'P2');
  const services = mockServices;
  const locationStats = mockLocationStats;

  // Calculate top performing properties
  const propertyRevenue = mockBookings.reduce((acc, booking) => {
    if (!acc[booking.propertyId]) {
      acc[booking.propertyId] = { 
        name: booking.propertyName, 
        revenue: 0, 
        bookings: 0 
      };
    }
    acc[booking.propertyId].revenue += booking.totalAmount;
    acc[booking.propertyId].bookings += 1;
    return acc;
  }, {} as Record<string, { name: string; revenue: number; bookings: number }>);

  const topProperties = Object.entries(propertyRevenue)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 3);

  // Calculate service type revenue
  const serviceRevenue = services.reduce((acc, service) => {
    if (!acc[service.type]) {
      acc[service.type] = { count: 0, revenue: 0 };
    }
    acc[service.type].count += 1;
    acc[service.type].revenue += service.price;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  const topServices = Object.entries(serviceRevenue)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

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
              {topProperties.map(([propertyId, data], index) => (
                <div key={propertyId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{data.name}</p>
                      <p className="text-sm text-muted-foreground">{data.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${data.revenue.toLocaleString()}</p>
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
              {topServices.map(([serviceType, data]) => (
                <div key={serviceType} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{serviceType}</p>
                    <p className="text-sm text-muted-foreground">{data.count} bookings</p>
                  </div>
                  <p className="font-semibold text-foreground">${data.revenue.toLocaleString()}</p>
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
              {locationStats.map((location) => (
                <div key={location.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{location.region}</span>
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
