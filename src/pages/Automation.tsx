import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Zap, Pencil } from 'lucide-react';
import { mockExecutionLogs } from '@/lib/mockData';
import { useActivityRulesQuery, useUpdateActivityRuleStatusMutation, type ActivityRule } from '@/lib/api/activity-rules';
import { ActivityRuleDialog } from '@/components/automation/ActivityRuleDialog';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export default function Automation() {
  const { data: rulesData, isLoading, error } = useActivityRulesQuery();
  const updateStatusMutation = useUpdateActivityRuleStatusMutation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<ActivityRule | null>(null);

  // Use mock logs for now as there is no API for logs yet
  const logs = mockExecutionLogs;

  const handleCreateRule = () => {
    setRuleToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: ActivityRule) => {
    setRuleToEdit(rule);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (rule: ActivityRule, checked: boolean) => {
    updateStatusMutation.mutate(
      { id: rule.id, enable: checked },
      {
        onSuccess: () => {
          toast({
            title: 'Status Updated',
            description: `Rule "${rule.rule_name}" is now ${checked ? 'active' : 'inactive'}.`,
          });
          queryClient.invalidateQueries({ queryKey: ['activity-rules'] });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update rule status.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoading) return <Layout><div>Loading rules...</div></Layout>;
  if (error) return <Layout><div>Error loading rules: {error.message}</div></Layout>;

  const rules = rulesData?.data || [];

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Automation Center</h1>
            <p className="text-muted-foreground">Create and manage automation rules</p>
          </div>
          <Button className="gap-2" onClick={handleCreateRule}>
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
              {rules.length === 0 ? (
                <p className="text-muted-foreground">No rules found. Create one to get started.</p>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{rule.rule_name}</h3>
                          <Switch
                            checked={rule.status}
                            onCheckedChange={(checked) => handleStatusChange(rule, checked)}
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap mb-2">
                          <Badge variant="outline">Priority: {rule.priority}</Badge>
                          <Badge variant="secondary">Slug: {rule.slug_name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Condition: {rule.condition.field} {rule.condition.operator} {rule.condition.value}
                        </p>
                        {rule.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                            {rule.description}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(rule.created_at).toLocaleDateString()}
                        </p>
                      </div>
                       <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                 {logs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                        <TableCell>{log.ruleName}</TableCell>
                        <TableCell>{log.outcome}</TableCell>
                    </TableRow>
                 ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ActivityRuleDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            ruleToEdit={ruleToEdit}
        />
      </div>
    </Layout>
  );
}
