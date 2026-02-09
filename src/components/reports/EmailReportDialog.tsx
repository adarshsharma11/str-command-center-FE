import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Plus, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useSendReportEmailMutation } from '@/lib/api/reports';
import type { ReportType, ReportFilters } from '@/types/reports';

interface EmailReportDialogProps {
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
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  subject: z.string().optional(),
  message: z.string().optional(),
  attachPdf: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function EmailReportDialog({
  open,
  onOpenChange,
  reportType,
  filters,
}: EmailReportDialogProps) {
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipients: [],
      subject: reportType
        ? `${REPORT_TITLES[reportType]} - ${filters.from} to ${filters.to}`
        : '',
      message: '',
      attachPdf: true,
    },
  });

  const sendMutation = useSendReportEmailMutation({
    onSuccess: () => {
      toast({
        title: 'Email Sent',
        description: 'Your report has been sent successfully.',
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send report',
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

    sendMutation.mutate({
      report_type: reportType,
      filters,
      recipients: values.recipients,
      subject: values.subject,
      message: values.message,
      attach_pdf: values.attachPdf,
    });
  };

  if (!reportType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Report via Email
          </DialogTitle>
          <DialogDescription>
            Send {REPORT_TITLES[reportType]} report to one or more recipients.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject line" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message to include in the email..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachPdf"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attach PDF
                    </FormLabel>
                    <FormDescription>
                      Include the report as a PDF attachment
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={sendMutation.isPending}>
                {sendMutation.isPending ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
