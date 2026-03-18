import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { respondToServiceBooking } from '@/lib/api/service-bookings';
import { getToken } from '@/lib/auth/token';
import confetti from 'canvas-confetti';

type Status = 'loading' | 'success' | 'rejected' | 'error';

export default function ServiceBookingRespond() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [isLoggedIn] = useState(!!getToken());
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  // Initial confetti on success
  useEffect(() => {
    if (status === 'success') {
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5, angle: 60, spread: 55, origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6', '#eab308']
        });
        confetti({
          particleCount: 5, angle: 120, spread: 55, origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6', '#eab308']
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [status]);

  // 3D tilt effect and confetti cannon on click
  useEffect(() => {
    if (status !== 'success') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleClickConfetti = (e: MouseEvent) => {
      // Don't fire if clicking a button/link
      if ((e.target as HTMLElement).closest('button, a')) return;
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x, y },
        colors: ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#a855f7']
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClickConfetti);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClickConfetti);
    };
  }, [status]);

  // Calculate 3D tilt transform
  const getCardTransform = () => {
    if (status !== 'success' || !cardRef.current) return '';
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = mousePos.x - centerX;
    const mouseY = mousePos.y - centerY;
    
    const maxRotate = 12; // Maximum rotation in degrees
    const rotateY = (mouseX / (window.innerWidth / 2)) * maxRotate;
    const rotateX = -(mouseY / (window.innerHeight / 2)) * maxRotate;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Global custom cursor mapping to party popper ONLY when success */}
      {status === 'success' && (
        <style>{`
          body {
            /* Replace mouse entirely with emoji Party Popper */
            cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='52' viewport='0 0 100 100' style='fill:black;font-size:36px;'><text y='50%'>🎉</text></svg>") 16 26, auto !important;
          }
          /* Ensure clickable areas keep standard pointer */
           a, button, [role="button"] {
            cursor: pointer !important;
          }
        `}</style>
      )}

      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ perspective: '1200px' }}>
        <div ref={cardRef} style={{ transform: getCardTransform(), transition: 'transform 0.1s ease-out', transformStyle: 'preserve-3d' }}>
          <Card className={`shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow duration-500 border-none bg-white/90 backdrop-blur-md relative overflow-hidden ${status === 'success' ? 'hover:shadow-[0_40px_80px_rgba(34,197,94,0.15)] shadow-[0_20px_50px_rgba(34,197,94,0.1)] ring-1 ring-green-100/50' : ''}`}>
            
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
                  <div className="bg-green-100 p-6 rounded-full ring-[12px] ring-green-50 animate-bounce-in">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                )}
                {status === 'rejected' && (
                  <div className="bg-orange-100 p-6 rounded-full ring-[12px] ring-orange-50 animate-bounce-in">
                    <XCircle className="h-16 w-16 text-orange-600" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="bg-red-100 p-6 rounded-full ring-[12px] ring-red-50 animate-shake">
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
                      <Button asChild className="w-full h-14 text-lg font-semibold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <Link to="/dashboard">
                          Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full h-14 text-lg font-semibold rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all">
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
    </div>
  );
}
