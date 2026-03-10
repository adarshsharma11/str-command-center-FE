import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, User, Home, Mail, Phone, Plus, Trash2, Send, CheckCircle2, AlertCircle, Loader2, RefreshCw, DollarSign } from 'lucide-react';
import { useAllPropertiesQuery } from '@/lib/api/property';

// ============================================================
// TYPES
// ============================================================
type ServiceEntry = {
  id: string;
  service_name: string;
  service_date: string;
  time: string;
  provider_name: string;
  provider_email: string;
  price: string;
};

type TestBooking = {
  bookingSource: string;
  propertyId: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  guestEmail: string;
  guestPhone: string;
  guestName: string;
  totalAmount: string;
  numberOfGuests: string;
  services: ServiceEntry[];
};

type LogEntry = {
  id: string;
  timestamp: Date;
  type: 'email-provider' | 'email-guest' | 'booking-created' | 'system' | 'status-update';
  status: 'success' | 'pending' | 'error';
  message: string;
  details?: string;
};

type ServiceBooking = {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  service_name: string;
  provider_name: string;
  provider_email: string;
  guest_name: string;
  guest_email: string;
  property_name: string;
  service_date: string;
  service_time: string;
  price: number;
  email_sent: boolean;
  email_error?: string;
  created_at: string;
  responded_at: string | null;
};

// ============================================================
// MOCK DATA
// ============================================================
const MOCK_PROPERTIES = [
  { id: 'prop-1', name: 'Ocean View Villa' },
  { id: 'prop-2', name: 'Mountain Retreat' },
  { id: 'prop-3', name: 'Downtown Loft' },
  { id: 'prop-4', name: 'Beachfront Bungalow' },
];

const BOOKING_SOURCES = [
  { id: 'airbnb', name: 'Airbnb' },
  { id: 'vrbo', name: 'Vrbo' },
  { id: 'booking', name: 'Booking.com' },
  { id: 'direct', name: 'Direct Booking' },
];

const SAMPLE_SERVICES = [
  'Private Chef',
  'Spa & Massage',
  'Yacht Charter',
  'Airport Transfer',
  'Photography Session',
  'Guided Tour',
  'Bartender',
  'Concierge',
];

export default function Testing() {
  const [booking, setBooking] = useState<TestBooking>({
    bookingSource: 'airbnb',
    propertyId: 'prop-1',
    propertyName: 'Ocean View Villa',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    guestEmail: '',
    guestPhone: '',
    guestName: '',
    totalAmount: '1500',
    numberOfGuests: '4',
    services: [],
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentBookings, setRecentBookings] = useState<ServiceBooking[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  // ── Poll for booking status updates ───────────────────
  const pollBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/service-bookings');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecentBookings(data.data);
        }
      }
    } catch {
      // Server might not be running yet
    }
  }, []);

  const { data: propertiesData, isLoading: isLoadingProperties } = useAllPropertiesQuery();
  const properties = (Array.isArray(propertiesData?.data) ? propertiesData.data : []) || [];

  useEffect(() => {
    pollBookings();
    const interval = setInterval(pollBookings, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [pollBookings]);

  // ── Form handlers ─────────────────────────────────────
  const updateBooking = (field: keyof TestBooking, value: string) => {
    setBooking(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'propertyId') {
        const prop = MOCK_PROPERTIES.find(p => p.id === value);
        if (prop) updated.propertyName = prop.name;
      }
      return updated;
    });
  };

  const addService = () => {
    setBooking(prev => ({
      ...prev,
      services: [...prev.services, {
        id: `svc-${Date.now()}`,
        service_name: '',
        service_date: prev.checkInDate,
        time: '10:00',
        provider_name: '',
        provider_email: '',
        price: '',
      }],
    }));
  };

  const updateService = (id: string, field: keyof ServiceEntry, value: string) => {
    setBooking(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const removeService = (id: string) => {
    setBooking(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id),
    }));
  };

  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs(prev => [...prev, { ...log, id: `log-${Date.now()}-${Math.random()}`, timestamp: new Date() }]);
  };

  // ── Submit booking & send emails ──────────────────────
  const handleSubmit = async () => {
    if (!booking.guestName) {
      toast.error('Please enter a guest name');
      return;
    }
    if (booking.services.length === 0) {
      toast.error('Please add at least one service');
      return;
    }
    const servicesWithoutProvider = booking.services.filter(s => !s.provider_email);
    if (servicesWithoutProvider.length > 0) {
      toast.error('Please enter provider email for all services');
      return;
    }

    setIsSubmitting(true);
    setLogs([]);

    addLog({ type: 'system', status: 'pending', message: 'Initiating service booking workflow...' });

    try {
      const payload = {
        guest_name: booking.guestName,
        guest_email: booking.guestEmail,
        guest_phone: booking.guestPhone,
        property_name: booking.propertyName,
        property_id: booking.propertyId,
        check_in_date: `${booking.checkInDate}T14:00:00`,
        check_out_date: `${booking.checkOutDate}T11:00:00`,
        number_of_guests: parseInt(booking.numberOfGuests) || 2,
        total_amount: parseFloat(booking.totalAmount) || 0,
        currency: 'USD',
        services: booking.services.map(s => ({
          service_name: s.service_name,
          service_date: `${s.service_date}T${s.time}:00`,
          time: s.time,
          provider_name: s.provider_name,
          provider_email: s.provider_email,
          price: parseFloat(s.price) || 0,
        })),
      };

      addLog({ type: 'booking-created', status: 'pending', message: 'Sending booking to server...', details: `${booking.services.length} service(s) for ${booking.guestName}` });

      const res = await fetch('/api/v1/service-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Server error');
      }

      addLog({ type: 'booking-created', status: 'success', message: `${data.data.length} service booking(s) created` });

      for (const result of data.data) {
        if (result.email_sent) {
          addLog({
            type: 'email-provider',
            status: 'success',
            message: `Email sent to ${result.provider_name} (${result.provider_email})`,
            details: `Service: ${result.service_name} — Booking ID: ${result.id}`,
          });
        } else {
          addLog({
            type: 'email-provider',
            status: 'error',
            message: `Failed to email ${result.provider_email}`,
            details: result.email_error || 'Unknown error',
          });
        }

        if (booking.guestEmail) {
          addLog({
            type: 'email-guest',
            status: 'success',
            message: `Confirmation email sent to guest: ${booking.guestEmail}`,
            details: `Service: ${result.service_name}`,
          });
        }
      }

      addLog({
        type: 'system',
        status: 'success',
        message: 'Workflow complete! Waiting for provider responses...',
        details: 'Providers will receive an email with Accept/Reject buttons. Check the status panel below.',
      });

      toast.success('Service booking emails sent! Check your inbox.');
      pollBookings();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addLog({ type: 'system', status: 'error', message: `Error: ${message}` });
      toast.error(`Failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ────────────────────────────────────
  const getLogIcon = (log: LogEntry) => {
    if (log.status === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    if (log.status === 'error') return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
    return <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />;
  };

  const getLogTypeLabel = (type: LogEntry['type']) => {
    switch (type) {
      case 'email-provider': return 'Provider Email';
      case 'email-guest': return 'Guest Email';
      case 'booking-created': return 'Booking';
      case 'status-update': return 'Status';
      case 'system': return 'System';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <Badge className="bg-green-500/10 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected': return <Badge className="bg-red-500/10 text-red-700 border-red-200">Rejected</Badge>;
      default: return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Booking Test Console</h1>
          <p className="text-muted-foreground">
            Test the full service booking workflow: Book a service → Email provider → Accept/Reject → Notify guest
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── BOOKING FORM ──────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Create Service Booking
              </CardTitle>
              <CardDescription>
                Fill in the booking details and services. Real emails will be sent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Booking Source & Property */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Booking Source</Label>
                  <Select value={booking.bookingSource} onValueChange={(v) => updateBooking('bookingSource', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BOOKING_SOURCES.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Home className="h-4 w-4" />Property</Label>
                  <Select value={booking.propertyId} onValueChange={(v) => updateBooking('propertyId', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MOCK_PROPERTIES.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input type="date" value={booking.checkInDate} onChange={(e) => updateBooking('checkInDate', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input type="date" value={booking.checkOutDate} onChange={(e) => updateBooking('checkOutDate', e.target.value)} />
                </div>
              </div>

              {/* Guest Info */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User className="h-4 w-4" />Guest Name *</Label>
                <Input value={booking.guestName} onChange={(e) => updateBooking('guestName', e.target.value)} placeholder="John Doe" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="h-4 w-4" />Guest Email *</Label>
                  <Input type="email" value={booking.guestEmail} onChange={(e) => updateBooking('guestEmail', e.target.value)} placeholder="guest@email.com" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="h-4 w-4" />Guest Phone</Label>
                  <Input type="tel" value={booking.guestPhone} onChange={(e) => updateBooking('guestPhone', e.target.value)} placeholder="+1 555 123 4567" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Guests</Label>
                  <Input type="number" min="1" value={booking.numberOfGuests} onChange={(e) => updateBooking('numberOfGuests', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><DollarSign className="h-4 w-4" />Total Amount (USD)</Label>
                  <Input type="number" min="0" value={booking.totalAmount} onChange={(e) => updateBooking('totalAmount', e.target.value)} />
                </div>
              </div>

              <Separator />

              {/* ── SERVICES ──────────────────────────── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Services (with Provider Info)</Label>
                  <Button variant="outline" size="sm" onClick={addService}>
                    <Plus className="h-4 w-4 mr-1" /> Add Service
                  </Button>
                </div>

                {booking.services.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Add services with provider emails. Each provider will receive a booking request email.
                  </p>
                )}

                {booking.services.map((service, index) => (
                  <Card key={service.id} className="bg-muted/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Service #{index + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeService(service.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Service Type *</Label>
                          <Select value={service.service_name} onValueChange={(v) => updateService(service.id, 'service_name', v)}>
                            <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                            <SelectContent>
                              {SAMPLE_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Price (USD)</Label>
                          <Input type="number" min="0" value={service.price} onChange={(e) => updateService(service.id, 'price', e.target.value)} placeholder="500" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Service Date</Label>
                          <Input type="date" value={service.service_date} onChange={(e) => updateService(service.id, 'service_date', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input type="time" value={service.time} onChange={(e) => updateService(service.id, 'time', e.target.value)} />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Provider Name</Label>
                          <Input value={service.provider_name} onChange={(e) => updateService(service.id, 'provider_name', e.target.value)} placeholder="Chef Marco" />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><Mail className="h-3 w-3" />Provider Email *</Label>
                          <Input type="email" value={service.provider_email} onChange={(e) => updateService(service.id, 'provider_email', e.target.value)} placeholder="provider@email.com" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending Emails...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Book Services & Send Emails</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ── WORKFLOW LOG ──────────────────────────── */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Workflow Log
                </CardTitle>
                <CardDescription>
                  Real-time log of the service booking workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity yet.</p>
                    <p className="text-sm">Fill in the form and click "Book Services" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        {getLogIcon(log)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{getLogTypeLabel(log.type)}</Badge>
                            <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm font-medium">{log.message}</p>
                          {log.details && <p className="text-xs text-muted-foreground mt-1">{log.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── BOOKING STATUS TRACKER ──────────────── */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className={`h-5 w-5 ${isPolling ? 'animate-spin' : ''}`} />
                      Provider Response Tracker
                    </CardTitle>
                    <CardDescription>
                      Auto-refreshes every 5 seconds. Provider clicks Accept/Reject in their email.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={pollBookings}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No service bookings yet. Submit a booking above to see results here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((sb) => (
                      <div key={sb.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{sb.service_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Provider: {sb.provider_name || sb.provider_email} · Guest: {sb.guest_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sb.property_name} · {new Date(sb.service_date).toLocaleDateString()} at {sb.service_time}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(sb.status)}
                          {sb.responded_at && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(sb.responded_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
