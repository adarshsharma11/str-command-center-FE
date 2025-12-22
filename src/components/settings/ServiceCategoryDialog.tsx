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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone } from 'lucide-react';
import {
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  type ServiceCategory,
} from '@/lib/api/service-category';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  category_name: z.string().min(1, 'Category name is required'),
  price: z.string().optional(),
  time: z.string().optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit: ServiceCategory | null;
}

export function ServiceCategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
}: ServiceCategoryDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: '',
      price: '',
      time: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (categoryToEdit) {
      form.reset({
        category_name: categoryToEdit.category_name,
        price: categoryToEdit.price || '',
        time: categoryToEdit.time || '',
        email: categoryToEdit.email || '',
        phone: categoryToEdit.phone || '',
      });
    } else {
      form.reset({
        category_name: '',
        price: '',
        time: '',
        email: '',
        phone: '',
      });
    }
  }, [categoryToEdit, form, open]);

  const createMutation = useCreateServiceCategoryMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Service category created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create service category',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useUpdateServiceCategoryMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Service category updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update service category',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      email: values.email || undefined,
      phone: values.phone || undefined,
    };

    if (categoryToEdit) {
      updateMutation.mutate({
        id: categoryToEdit.id,
        payload,
      });
    } else {
      createMutation.mutate({
        category_name: values.category_name,
        price: values.price,
        time: values.time,
        email: values.email,
        phone: values.phone,
        status: true, // Default status to true
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? 'Edit Service Category' : 'Add Service Category'}
          </DialogTitle>
          <DialogDescription>
            {categoryToEdit
              ? 'Make changes to the service category here.'
              : 'Add a new service category to your list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Cleaning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2h" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="contact@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contact Phone
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="+1 (555) 123-4567" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
