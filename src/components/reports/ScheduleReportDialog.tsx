import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateScheduledReportMutation } from '@/lib/api/reports';
import type { ReportType, ReportFilters, ScheduleFrequency } from '@/types/reports';

interface ScheduleReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType | null;
  filters: ReportFilters;
}

const REPORT_TITLES: Record<ReportType, string> = {
  'owner-statement': 'Owner Statement',
  'booking-summary': 'Booking Summary',
  'service-revenue': 'Service Revenue',
  'service-provider': 'Service Provider Statement',
  'occupancy': 'Occupancy Report',
  'performance': 'Performance Comparison',
};

const formSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  frequency: z.enum(['weekly', 'monthly', 'quarterly']),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function ScheduleReportDialog({
  open,
  onOpenChange,
  reportType,
  filters,
}: ScheduleReportDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emailInput, setEmailInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: reportType ? `${REPORT_TITLES[reportType]} - Automated` : '',
      frequency: 'monthly',
      recipients: [],
    },
  });

  const createMutation = useCreateScheduledReportMutation({
    onSuccess: () => {
      toast({
        title: 'Schedule Created',
        description: 'Your report has been scheduled successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule report',
        variant: 'destructive',
      });
    },
  });

  const recipients = form.watch('recipients');

  const addRecipient = () => {
    const email = emailInput.trim();
    if (email && z.string().email().safeParse(email).success) {
      if (!recipients.includes(email)) {
        form.setValue('recipients', [...recipients, email]);
      }
      setEmailInput('');
    }
  };

  const removeRecipient = (email: string) => {
    form.setValue(
      'recipients',
      recipients.filter((r) => r !== email)
    );
  };

  const onSubmit = (values: FormValues) => {
    if (!reportType) return;

    createMutation.mutate({
      report_type: reportType,
      name: values.name,
      frequency: values.frequency as ScheduleFrequency,
      recipients: values.recipients,
      filters,
    });
  };

  if (!reportType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Report
          </DialogTitle>
          <DialogDescription>
            Set up automatic delivery of {REPORT_TITLES[reportType]} reports.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Monthly Owner Statement" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this scheduled report.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly (Every Monday)</SelectItem>
                      <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipients"
              render={() => (
                <FormItem>
                  <FormLabel>Recipients</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRecipient();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addRecipient}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recipients.map((email) => (
                        <Badge key={email} variant="secondary" className="gap-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => removeRecipient(email)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription>
                    Add email addresses to receive this report automatically.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
