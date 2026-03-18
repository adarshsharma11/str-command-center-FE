// Added by Agent 2
import { useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, ClipboardList, ListChecks, Wifi } from 'lucide-react';
import { TaskList } from '@/components/dispatch/TaskList';
import { ResponseLog } from '@/components/dispatch/ResponseLog';
import { ServiceCategoryManager } from '@/components/dispatch/ServiceCategoryManager';
import {
  useTaskStatusQuery,
  useResponseLogQuery,
  createResponseStream,
} from '@/lib/api/dispatch';
import { useQueryClient } from '@tanstack/react-query';

export default function ServiceDispatch() {
  const queryClient = useQueryClient();
  const { data: tasksData, isLoading: tasksLoading } = useTaskStatusQuery();
  const { data: responsesData, isLoading: responsesLoading } =
    useResponseLogQuery();

  const sseRef = useRef<EventSource | null>(null);

  // SSE real-time updates
  useEffect(() => {
    const es = createResponseStream(
      () => {
        queryClient.invalidateQueries({ queryKey: ['dispatch-tasks'] });
        queryClient.invalidateQueries({ queryKey: ['dispatch-responses'] });
      },
      () => {
        // EventSource auto-reconnects on error
      }
    );
    sseRef.current = es;
    return () => es.close();
  }, [queryClient]);

  const tasks = tasksData?.data || [];
  const responses = responsesData?.data || [];

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const acceptedCount = tasks.filter((t) => t.status === 'accepted').length;
  const rejectedCount = tasks.filter((t) => t.status === 'rejected').length;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Service Dispatch
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage cleaning and service tasks for providers
            </p>
          </div>
          <Badge
            variant="outline"
            className="gap-1 text-green-700 border-green-300"
          >
            <Wifi className="h-3 w-3" />
            Live
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Send className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <ListChecks className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedCount}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <ClipboardList className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
            <TabsTrigger value="responses">Response Log</TabsTrigger>
            <TabsTrigger value="categories">Service Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskList tasks={tasks} isLoading={tasksLoading} />
          </TabsContent>

          <TabsContent value="responses">
            <ResponseLog
              responses={responses}
              isLoading={responsesLoading}
            />
          </TabsContent>

          <TabsContent value="categories">
            <ServiceCategoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
