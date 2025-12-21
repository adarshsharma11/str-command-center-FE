import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PlatformType, PlatformCredentials } from '@/lib/api/integrations';

const platformCredentialsSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

type PlatformCredentialsFormData = yup.InferType<typeof platformCredentialsSchema>;

type PlatformConfigModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PlatformType;
  platformName: string;
  currentEmail?: string;
  isConnected: boolean;
  onConnect: (credentials: PlatformCredentials) => Promise<void>;
  onTestConnection?: (credentials: PlatformCredentials) => Promise<boolean>;
  onDisconnect: () => Promise<void>;
};

export function PlatformConfigModal({
  open,
  onOpenChange,
  platform,
  platformName,
  currentEmail,
  isConnected,
  onConnect,
  onTestConnection,
  onDisconnect,
}: PlatformConfigModalProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string }>({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PlatformCredentialsFormData>({
    resolver: yupResolver(platformCredentialsSchema),
    defaultValues: {
      email: currentEmail || '',
      password: '',
    },
  });

  const handleClose = () => {
    reset();
    setTestResult({});
    onOpenChange(false);
  };

  const onSubmit = async (data: PlatformCredentialsFormData) => {
    try {
      await onConnect(data as PlatformCredentials);
      handleClose();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleTestConnection = async () => {
    const formData = {
      email: (document.getElementById('email') as HTMLInputElement)?.value || '',
      password: (document.getElementById('password') as HTMLInputElement)?.value || '',
    };

    if (!formData.email || !formData.password) {
      setTestResult({
        success: false,
        message: 'Please enter both email and password to test the connection.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult({});

    try {
      if (onTestConnection) {
        const success = await onTestConnection(formData as PlatformCredentials);
        setTestResult({
          success,
          message: success 
            ? 'Connection test successful! You can now connect.' 
            : 'Connection test failed. Please check your credentials.',
        });
      } else {
        // Default test connection logic
        const success = await onConnect(formData as PlatformCredentials);
        await onDisconnect(); // Disconnect after test
        setTestResult({
          success: true,
          message: 'Connection test successful! You can now connect.',
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed. Please check your credentials.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await onDisconnect();
      handleClose();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isConnected ? `${platformName} Configuration` : `Connect ${platformName}`}
          </DialogTitle>
          <DialogDescription>
            {isConnected 
              ? 'Update your platform credentials or disconnect'
              : 'Enter your platform credentials to establish a connection.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your-email@example.com"
              {...register('email')}
              disabled={isSubmitting || isTesting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {isConnected ? 'New Password (leave blank to keep current)' : 'Password'}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              disabled={isSubmitting || isTesting}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {testResult.message && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            {!isConnected && (
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isSubmitting || isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
            )}

            {isConnected && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDisconnect}
                disabled={isSubmitting || isTesting}
              >
                Disconnect
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || isTesting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isConnected ? 'Updating...' : 'Connecting...'}
                </>
              ) : (
                isConnected ? 'Update Connection' : 'Connect'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}