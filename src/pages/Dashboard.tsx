import { Layout } from '@/components/Layout';
import { KPICard } from '@/components/KPICard';
import { PriorityTaskWidget } from '@/components/PriorityTaskWidget';
import { AlertFeed } from '@/components/AlertFeed';
import { mockKPIs, mockTasks, mockAlerts } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // TODO: INTEGRATION STUB: Replace with Supabase queries
  const kpis = mockKPIs;
  const tasks = mockTasks;
  const alerts = mockAlerts;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your rental operations</p>
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

        {/* Priority Tasks and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriorityTaskWidget
            tasks={tasks}
            onTaskClick={(taskId) => navigate('/crews')}
          />
          <AlertFeed alerts={alerts} />
        </div>
      </div>
    </Layout>
  );
}
