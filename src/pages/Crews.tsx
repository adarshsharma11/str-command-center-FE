import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mockTasks, mockCrews } from '@/lib/mockData';
import { Users } from 'lucide-react';

export default function Crews() {
  // TODO: INTEGRATION STUB: Replace with Supabase query
  const tasks = mockTasks;
  const crews = mockCrews;

  // Group tasks by priority
  const tasksByPriority = {
    P1: tasks.filter(t => t.priority === 'P1'),
    P2: tasks.filter(t => t.priority === 'P2'),
    P3: tasks.filter(t => t.priority === 'P3'),
    P4: tasks.filter(t => t.priority === 'P4'),
  };

  const priorityColors = {
    P1: 'bg-destructive text-destructive-foreground',
    P2: 'bg-orange-500 text-white',
    P3: 'bg-yellow-500 text-white',
    P4: 'bg-muted text-muted-foreground',
  };

  const priorityLabels = {
    P1: 'Critical',
    P2: 'Urgent',
    P3: 'Routine',
    P4: 'Backlog',
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crews & Vendors</h1>
          <p className="text-muted-foreground">Manage tasks and crew assignments</p>
        </div>

        {/* Crew List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {crews.map((crew) => (
            <Card key={crew.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  {crew.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <p className="text-muted-foreground">Email: {crew.email}</p>
                  <p className="text-muted-foreground">Phone: {crew.phone}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {crew.specialties.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Assigned: {crew.tasksAssigned}</span>
                  <span className="text-green-600">Completed: {crew.tasksCompleted}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task Queue by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Task Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['P1', 'P2']} className="w-full">
              {(Object.keys(tasksByPriority) as Array<keyof typeof tasksByPriority>).map((priority) => (
                <AccordionItem key={priority} value={priority}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge className={priorityColors[priority]}>
                        {priority}
                      </Badge>
                      <span className="font-semibold">{priorityLabels[priority]}</span>
                      <span className="text-sm text-muted-foreground">
                        ({tasksByPriority[priority].length} tasks)
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {tasksByPriority[priority].map((task) => (
                        <div
                          key={task.id}
                          className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow cursor-move"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">{task.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline">{task.type}</Badge>
                                <Badge variant="secondary">{task.status}</Badge>
                                {task.assignedCrewName && (
                                  <Badge variant="default">{task.assignedCrewName}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Due: {task.dueDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {task.completionLog && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground">
                                Completed by {task.completionLog.completedBy} on{' '}
                                {task.completionLog.completedAt.toLocaleString()}
                              </p>
                              {task.completionLog.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Notes: {task.completionLog.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {tasksByPriority[priority].length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tasks in this priority level
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
