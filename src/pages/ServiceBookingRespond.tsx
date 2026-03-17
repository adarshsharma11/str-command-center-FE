import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Home, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { respondToServiceBooking } from '@/lib/api/service-bookings';
import { getToken } from '@/lib/auth/token';

type Status = 'loading' | 'success' | 'rejected' | 'error';

export default function ServiceBookingRespond() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [isLoggedIn] = useState(!!getToken());

  const taskId = searchParams.get('task_id');
  const type = searchParams.get('type');
  const action = searchParams.get('action');
  const expiresAt = searchParams.get('expires_at');

  useEffect(() => {
    async function handleResponse() {
      if (!taskId || !type || !action || (action !== 'accept' && action !== 'reject')) {
        setStatus('error');
        setMessage('This link appears to be invalid or incomplete.');
        return;
      }

      // Check for link expiration
      if (expiresAt) {
        try {
          const expiryDate = new Date(expiresAt);
          if (expiryDate.getTime() < Date.now()) {
            setStatus('error');
            setMessage('This link has expired. Please contact support for a new one.');
            return;
          }
        } catch (e) {
          console.error('Invalid expires_at format', e);
        }
      }

      try {
        const response = await respondToServiceBooking(taskId, type, action as 'accept' | 'reject');
        if (response.success) {
          setStatus(action === 'accept' ? 'success' : 'rejected');
          setMessage(response.message || (action === 'accept' ? 'You have successfully accepted the task.' : 'You have declined the task.'));
        } else {
          setStatus('error');
          setMessage(response.message || 'We could not process your response at this time.');
        }
      } catch (error) {
        setStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Connection error. Please check your internet and try again.';
        setMessage(errorMessage);
      }
    }

    const timer = setTimeout(handleResponse, 1200);
    return () => clearTimeout(timer);
  }, [taskId, type, action, expiresAt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-none overflow-hidden bg-white/90 backdrop-blur-md relative">
          {/* Status Progress Bar */}
          <div className={`absolute top-0 left-0 h-1.5 transition-all duration-1000 ease-in-out ${
            status === 'loading' ? 'w-full bg-primary animate-pulse' : 
            status === 'success' ? 'w-full bg-green-500' : 
            status === 'rejected' ? 'w-full bg-orange-500' : 'w-full bg-red-500'
          }`} />
          
          <CardHeader className="text-center pt-14 pb-6 px-8">
            <div className="flex justify-center mb-8">
              {status === 'loading' && (
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                </div>
              )}
              {status === 'success' && (
                <div className="bg-green-100 p-6 rounded-full ring-[12px] ring-green-50 animate-in zoom-in duration-500">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              )}
              {status === 'rejected' && (
                <div className="bg-orange-100 p-6 rounded-full ring-[12px] ring-orange-50 animate-in zoom-in duration-500">
                  <XCircle className="h-16 w-16 text-orange-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-100 p-6 rounded-full ring-[12px] ring-red-50 animate-in zoom-in duration-500">
                  <AlertTriangle className="h-16 w-16 text-red-600" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              {status === 'loading' && 'Updating Task Status'}
              {status === 'success' && 'Confirmation Received'}
              {status === 'rejected' && 'Response Recorded'}
              {status === 'error' && 'Action Required'}
            </CardTitle>
            
            <CardDescription className="text-lg text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
              {status === 'loading' && 'Please wait while we sync your response with our team.'}
              {status !== 'loading' && message}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 pb-14 pt-4">
            {status !== 'loading' && (
              <div className="space-y-8 animate-in fade-in duration-700 delay-300">
                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-sm">
                  <p className="text-slate-600 text-sm leading-relaxed text-center">
                    {status === 'success' && 'The system has been updated. Our operations team will contact you with further details if necessary.'}
                    {status === 'rejected' && 'We have updated our records. Thank you for your prompt response, this helps us manage our schedule effectively.'}
                    {status === 'error' && 'There was an issue processing this request. This could be due to an expired link or a network problem.'}
                  </p>
                </div>
                
                <div className="flex flex-col gap-4">
                  {isLoggedIn ? (
                    <Button asChild className="w-full h-14 text-lg font-semibold rounded-xl shadow-xl shadow-primary/20 hover:translate-y-[-2px] active:translate-y-[0] transition-all">
                      <Link to="/dashboard">
                        Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" className="w-full h-14 text-lg font-semibold rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all">
                      <Link to="/auth">
                        Sign In to Portal <ExternalLink className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

