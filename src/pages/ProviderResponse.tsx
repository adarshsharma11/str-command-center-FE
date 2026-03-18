// Added by Agent 2
// PUBLIC page — no auth required. Mobile-first design.
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { respondToTask } from '@/lib/api/dispatch';

type ResponseState = 'idle' | 'loading' | 'success' | 'error';

export default function ProviderResponse() {
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('task_id');
  const type = searchParams.get('type') as 'cleaning' | 'service' | null;

  const [state, setState] = useState<ResponseState>('idle');
  const [resultMessage, setResultMessage] = useState('');
  const [chosenAction, setChosenAction] = useState<'accept' | 'reject' | null>(
    null
  );

  const handleRespond = async (action: 'accept' | 'reject') => {
    if (!taskId || !type) return;
    setChosenAction(action);
    setState('loading');
    try {
      const res = await respondToTask(taskId, type, action);
      setResultMessage(res.message || `Task ${action}ed successfully`);
      setState('success');
    } catch (err) {
      setResultMessage((err as Error).message || 'Something went wrong');
      setState('error');
    }
  };

  // Missing params
  if (!taskId || !type) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-semibold">Invalid Link</h2>
            <p className="text-muted-foreground">
              This link is missing required parameters. Please check the link
              you received and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already responded
  if (state === 'success') {
    const isAccepted = chosenAction === 'accept';
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            {isAccepted ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            )}
            <h2 className="text-xl font-semibold">
              {isAccepted ? 'Task Accepted!' : 'Task Declined'}
            </h2>
            <p className="text-muted-foreground">{resultMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold">Something Went Wrong</h2>
            <p className="text-muted-foreground">{resultMessage}</p>
            <Button
              variant="outline"
              onClick={() => setState('idle')}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main action screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">MOMA.HOUSE</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Service Provider Response
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Task Info */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Task ID</span>
              <span className="font-mono font-medium">#{taskId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{type}</span>
            </div>
          </div>

          {/* Action Prompt */}
          <p className="text-center text-sm text-muted-foreground">
            Would you like to accept or decline this task?
          </p>

          {/* Action Buttons — Big & touch-friendly */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-16 text-lg bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleRespond('accept')}
              disabled={state === 'loading'}
            >
              {state === 'loading' && chosenAction === 'accept' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Accept
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="destructive"
              className="h-16 text-lg"
              onClick={() => handleRespond('reject')}
              disabled={state === 'loading'}
            >
              {state === 'loading' && chosenAction === 'reject' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  Decline
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
