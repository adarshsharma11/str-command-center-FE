import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { IntegrationUser } from '@/lib/api/integrations';

const formSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface UserIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting?: boolean;
  user?: IntegrationUser | null;
  onTestConnection?: (email: string) => void;
  onConnect?: (email: string) => void;
  isTestingConnection?: boolean;
  isConnecting?: boolean;
}

export function UserIntegrationDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  user,
  onTestConnection,
  onConnect,
  isTestingConnection = false,
  isConnecting = false,
}: UserIntegrationDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (open) {
      setIsEditing(false);
      if (user) {
        form.reset({
          email: user.email,
          password: '',
        });
      } else {
        form.reset({
          email: '',
          password: '',
        });
      }
    }
  }, [open, user, form]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
    if (!user) form.reset();
    if (isEditing) setIsEditing(false);
  };

  const isManageMode = !!user && !isEditing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Integration' : (user ? 'Manage Integration' : 'Add User Integration')}
          </DialogTitle>
          <DialogDescription>
            {isEditing || !user
              ? 'Enter the credentials to connect integration.'
              : 'Manage connection settings for this user.'}
          </DialogDescription>
        </DialogHeader>
        
        {isManageMode ? (
          <div className="space-y-4">
            {user.platform && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Platform</label>
                <Input value={user.platform} disabled />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <Input value={user.email} disabled />
            </div>
            
            <div className="text-sm text-muted-foreground pt-2">
              Status: <span className={(user.status === 'active' || user.status === 'connected') ? 'text-green-600' : 'text-muted-foreground'}>{user.status}</span>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className={(user.status === 'connected' || user.status === 'active') ? 'w-full' : 'flex-1'}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                {(user.status !== 'connected' && user.status !== 'active') && (
                  <Button 
                    type="button" 
                    className="flex-1"
                    onClick={() => onConnect?.(user.email)}
                    disabled={isConnecting}
                  >
                    {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect
                  </Button>
                )}
              </div>
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full"
                onClick={() => onTestConnection?.(user.email)}
                disabled={isTestingConnection}
              >
                {isTestingConnection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (user && isEditing) {
                      setIsEditing(false);
                    } else {
                      onOpenChange(false);
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Add Integration'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
