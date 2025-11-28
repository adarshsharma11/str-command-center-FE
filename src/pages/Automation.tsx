import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Zap } from 'lucide-react';
import { mockAutomationRules, mockExecutionLogs } from '@/lib/mockData';

export default function Automation() {
  // TODO: INTEGRATION STUB: Replace with Supabase query
  const rules = mockAutomationRules;
  const logs = mockExecutionLogs;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Automation Center</h1>
            <p className="text-muted-foreground">Create and manage automation rules</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>

        {/* Rules List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Active Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{rule.name}</h3>
                        <Switch checked={rule.isActive} />
                      </div>
                      <div className="flex gap-2 flex-wrap mb-2">
                        <Badge variant="outline">Trigger: {rule.triggerEvent}</Badge>
                        <Badge variant="secondary">Action: {rule.action}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Condition: {rule.condition}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Details: {rule.actionDetails}
                      </p>
                      {rule.lastExecuted && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last executed: {rule.lastExecuted.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visual Rule Builder Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Visual rule builder coming soon
              </p>
              <Button variant="outline">Design Your First Rule</Button>
            </div>
          </CardContent>
        </Card>

        {/* Execution Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Execution Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {log.timestamp.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{log.ruleName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.outcome === 'Success'
                            ? 'default'
                            : log.outcome === 'Failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {log.outcome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
