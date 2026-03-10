import { Clock, Mail, Trash2, Play, Pause, Calendar, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  useScheduledReportsQuery,
  useDeleteScheduledReportMutation,
  useToggleScheduledReportMutation,
} from '@/lib/api/reports';
import type { ReportType, ScheduleFrequency } from '@/types/reports';
import { format, parseISO } from 'date-fns';

const REPORT_TITLES: Record<ReportType, string> = {
  'owner-statement': 'Owner Statement',
  'booking-summary': 'Booking Summary',
  'service-revenue': 'Service Revenue',
  'service-provider': 'Service Provider Statement',
  'occupancy': 'Occupancy Report',
  'performance': 'Performance Comparison',
};

const FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
};

export function ScheduledReportsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scheduledReports, isLoading, error } = useScheduledReportsQuery();

  const deleteMutation = useDeleteScheduledReportMutation({
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Scheduled report removed successfully.' });
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleMutation = useToggleScheduledReportMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load scheduled reports: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const reports = scheduledReports?.data ?? [];

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scheduled Reports</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't set up any recurring reports yet. Generate a report and click "Schedule"
              to set up automatic delivery.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {reports.length} scheduled report{reports.length !== 1 ? 's' : ''}
        </p>
      </div>

      {reports.map((report) => (
        <Card key={report.id} className={!report.is_active ? 'opacity-60' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{report.name}</h3>
                    <Badge variant="outline">{REPORT_TITLES[report.report_type]}</Badge>
                    <Badge variant="secondary">{FREQUENCY_LABELS[report.frequency]}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next: {format(parseISO(report.next_run), 'MMM d, yyyy')}
                    </span>
                    {report.last_run && (
                      <span>Last: {format(parseISO(report.last_run), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {report.recipients.slice(0, 3).map((email) => (
                      <Badge key={email} variant="secondary" className="text-xs">
                        {email}
                      </Badge>
                    ))}
                    {report.recipients.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{report.recipients.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={report.is_active}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ id: report.id, isActive: checked })
                  }
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteMutation.mutate(report.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
