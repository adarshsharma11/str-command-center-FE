import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  useCreateActivityRuleMutation,
  useUpdateActivityRuleMutation,
  type ActivityRule,
  type ActivityRuleCondition,
} from '@/lib/api/activity-rules';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  rule_name: z.string().min(1, 'Rule name is required'),
  slug_name: z.string().min(1, 'Slug name is required'),
  priority: z.string().min(1, 'Priority is required'),
  description: z.string().optional(),
  condition_field: z.string().optional(),
  condition_operator: z.string().optional(),
  condition_value: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ActivityRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleToEdit: ActivityRule | null;
}

export function ActivityRuleDialog({
  open,
  onOpenChange,
  ruleToEdit,
}: ActivityRuleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rule_name: '',
      slug_name: '',
      priority: 'medium',
      description: '',
      condition_field: 'total_amount',
      condition_operator: 'gte',
      condition_value: '',
    },
  });

  useEffect(() => {
    if (ruleToEdit) {
      form.reset({
        rule_name: ruleToEdit.rule_name,
        slug_name: ruleToEdit.slug_name,
        priority: ruleToEdit.priority,
        description: ruleToEdit.description || '',
        condition_field: ruleToEdit.condition?.field || 'total_amount',
        condition_operator: ruleToEdit.condition?.operator || 'gte',
        condition_value: ruleToEdit.condition?.value !== undefined ? String(ruleToEdit.condition.value) : '',
      });
    } else {
      form.reset({
        rule_name: '',
        slug_name: '',
        priority: 'medium',
        description: '',
        condition_field: 'total_amount',
        condition_operator: 'gte',
        condition_value: '',
      });
    }
  }, [ruleToEdit, form, open]);

  const createMutation = useCreateActivityRuleMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Activity rule created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['activity-rules'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create activity rule',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useUpdateActivityRuleMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Activity rule updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['activity-rules'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update activity rule',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    let finalCondition: ActivityRuleCondition | undefined;

    if (values.condition_field && values.condition_operator && values.condition_value) {
        let finalValue: string | number | boolean = values.condition_value;
        if (values.condition_field === 'total_amount' || values.condition_field === 'guests' || values.condition_field === 'nights') {
            const num = parseFloat(values.condition_value);
            if (!isNaN(num)) finalValue = num;
        }
        if (values.condition_value === 'true') finalValue = true;
        if (values.condition_value === 'false') finalValue = false;

        finalCondition = {
            field: values.condition_field,
            operator: values.condition_operator,
            value: finalValue
        };
    }

    const payload = {
        rule_name: values.rule_name,
        slug_name: values.slug_name,
        priority: values.priority,
        description: values.description,
        status: ruleToEdit ? ruleToEdit.status : true,
        condition: finalCondition
    };

    if (ruleToEdit) {
      updateMutation.mutate({ id: ruleToEdit.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{ruleToEdit ? 'Edit Activity Rule' : 'Create Activity Rule'}</DialogTitle>
          <DialogDescription>
            {ruleToEdit ? 'Update the details of the activity rule.' : 'Add a new activity rule to automate your workflow.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rule_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rule Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. High Value Booking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. high-value-booking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2">
                <FormField
                control={form.control}
                name="condition_field"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Condition Field</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="total_amount">Total Amount</SelectItem>
                        <SelectItem value="guests">Guests</SelectItem>
                        <SelectItem value="nights">Nights</SelectItem>
                        <SelectItem value="source">Source</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="condition_operator"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Operator</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Op" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="eq">Equals</SelectItem>
                        <SelectItem value="neq">Not Equals</SelectItem>
                        <SelectItem value="gt">Greater Than</SelectItem>
                        <SelectItem value="gte">Greater/Equal</SelectItem>
                        <SelectItem value="lt">Less Than</SelectItem>
                        <SelectItem value="lte">Less/Equal</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="condition_value"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                        <Input placeholder="Value" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this rule does..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : (ruleToEdit ? 'Update Rule' : 'Create Rule')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
