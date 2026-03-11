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
import { fetchServiceCategories, useServiceCategoriesQuery, type ServiceCategory } from '@/lib/api/service-category';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { env } from '@/config/env';
import { getToken } from '@/lib/auth/token';

// ============================================================
// TYPES
// ============================================================
type AdditionalService = {
  id: string;
  serviceType: string;
  date: string;
  time: string;
};

type TestBooking = {
  bookingSource: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestEmail: string;
  guestPhone: string;
  guestName: string;
  totalAmount: string;
  numberOfGuests: string;
  additionalServices: AdditionalService[];
};

type LogEntry = {
  id: string;
  timestamp: Date;
  type: 'calendar' | 'guest-message' | 'crew-message' | 'service-message' | 'database' | 'system';
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

export default function Testing() {
  const [booking, setBooking] = useState<TestBooking>({
    bookingSource: 'airbnb',
    propertyId: 'prop-1',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    guestEmail: '',
    guestPhone: '',
    guestName: '',
    totalAmount: '1500',
    numberOfGuests: '4',
    additionalServices: [],
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [recentBookings, setRecentBookings] = useState<ServiceBooking[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  // API Test State
  const [fetchedCategories, setFetchedCategories] = useState<ServiceCategory[] | null>(null);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [bookingTestResult, setBookingTestResult] = useState<unknown>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

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

  // Fetch service categories for service selection
  const { data: serviceCategoriesData, isLoading: isLoadingServiceCategories } = useServiceCategoriesQuery();
  const serviceCategories = serviceCategoriesData?.data || [];

  useEffect(() => {
    pollBookings();
    const interval = setInterval(pollBookings, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [pollBookings]);

  // ── Form handlers ─────────────────────────────────────
  const updateBooking = (field: keyof TestBooking, value: string) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    const newService: AdditionalService = {
      id: `service-${Date.now()}`,
      serviceType: '',
      date: booking.checkInDate,
      time: '10:00',
    };
    setBooking(prev => ({
      ...prev,
      additionalServices: [...prev.additionalServices, newService],
    }));
  };

  const updateService = (id: string, field: keyof AdditionalService, value: string) => {
    setBooking(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const removeService = (id: string) => {
    setBooking(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter(s => s.id !== id),
    }));
  };

  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs(prev => [...prev, { ...log, id: `log-${Date.now()}-${Math.random()}`, timestamp: new Date() }]);
  };

  const handleTestFetchCategories = async () => {
    setIsFetchingCategories(true);
    try {
      const res = await fetchServiceCategories();
      if (res.success) {
        setFetchedCategories(res.data);
        toast.success(`Fetched ${res.data.length} categories`);
      } else {
        toast.error(res.message || 'Failed to fetch');
      }
    } catch (err) {
      toast.error('Error fetching categories');
    } finally {
      setIsFetchingCategories(false);
    }
  };

  const handleTestCreateBooking = async () => {
    setIsCreatingBooking(true);
    setLogs([]); // Clear logs for new test

    // Get property name
    const propertyName = properties.find(p => String(p.id) === booking.propertyId)?.name || 
                        MOCK_PROPERTIES.find(p => p.id === booking.propertyId)?.name || 
                        'Test Property';

    // Map services from the form
    const services = booking.additionalServices.map(s => ({
      service_id: parseInt(s.serviceType) || 1, // Fallback to 1 if not a valid number, as API expects number
      service_date: s.date ? `${s.date}T${s.time || '09:00'}:00` : "2024-01-02T09:00:00",
      time: s.time || "09:00"
    }));

    // Construct payload using form data, falling back to defaults if empty
    const payload = { 
      "reservation_id": String(Date.now()), 
      "platform": booking.bookingSource || "airbnb", 
      "guest_name": booking.guestName || "Test Guest", 
      "check_in_date": booking.checkInDate ? `${booking.checkInDate}T14:00:00` : "2024-01-01T14:00:00", 
      "check_out_date": booking.checkOutDate ? `${booking.checkOutDate}T11:00:00` : "2024-01-05T11:00:00", 
      "services": services.length > 0 ? services : [ 
        { 
          "service_id": 1, 
          "service_date": "2024-01-02T09:00:00", 
          "time": "09:00" 
        } 
      ], 
      "guest_phone": booking.guestPhone || "123-456-7890", 
      "guest_email": booking.guestEmail || "test@example.com", 
      "property_id": booking.propertyId || "prop-123", 
      "property_name": propertyName, 
      "number_of_guests": parseInt(booking.numberOfGuests) || 2, 
      "total_amount": parseFloat(booking.totalAmount) || 100.0, 
      "currency": "USD" 
    };

    const mapStepToType = (step: string): LogEntry['type'] => {
      switch (step) {
        case 'database': return 'database';
        case 'calendar': return 'calendar';
        case 'guest_notification': return 'guest-message';
        case 'crew_notification': return 'crew-message';
        case 'services': return 'service-message';
        case 'complete': return 'system';
        default: return 'system';
      }
    };

    try {
      const token = getToken();
      const response = await fetch(`${env.apiBaseUrl}${ENDPOINTS.BOOKING.LIST}?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setBookingTestResult(errorData);
        throw new Error(errorData.detail?.message || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is not readable');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            
            // Map API response to LogEntry
            const logEntry: LogEntry = {
              id: `log-${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
              type: mapStepToType(data.step),
              status: data.status === 'completed' || data.status === 'success' ? 'success' : 'error',
              message: data.message || `Step ${data.step} ${data.status}`,
              details: data.step === 'complete' ? undefined : JSON.stringify(data, null, 2)
            };

            setLogs(prev => [...prev, logEntry]);
            
            // If complete, set the final result
            if (data.step === 'complete') {
              setBookingTestResult(data);
              toast.success('Test booking completed successfully');
            }
          } catch (e) {
            console.error('Error parsing JSON line:', line, e);
          }
        }
      }
      
    } catch (err) {
      toast.error('Error creating test booking');
      setBookingTestResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsCreatingBooking(false);
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
      case 'calendar': return 'Calendar';
      case 'guest-message': return 'Guest Comm';
      case 'crew-message': return 'Crew Comm';
      case 'service-message': return 'Service Provider';
      case 'database': return 'Database';
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
                      {properties.length > 0 ? (
                        properties.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)
                      ) : (
                        MOCK_PROPERTIES.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                      )}
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
                  <Label className="text-base font-semibold">Additional Services</Label>
                  <Button variant="outline" size="sm" onClick={addService}>
                    <Plus className="h-4 w-4 mr-1" /> Add Service
                  </Button>
                </div>

                {booking.additionalServices.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No additional services added. Click "Add Service" to include extras.
                  </p>
                )}

                {booking.additionalServices.map((service, index) => (
                  <Card key={service.id} className="bg-muted/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Service #{index + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeService(service.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Service Type *</Label>
                        <Select value={service.serviceType} onValueChange={(v) => updateService(service.id, 'serviceType', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingServiceCategories ? "Loading services..." : "Select service"} />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingServiceCategories ? (
                              <SelectItem value="" disabled>Loading services...</SelectItem>
                            ) : serviceCategories.length > 0 ? (
                              serviceCategories.map(category => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                  {category.category_name} 
                                  {category.time && ` (${category.time})`}
                                  {category.price && ` - $${category.price}`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>No services available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input type="date" value={service.date} onChange={(e) => updateService(service.id, 'date', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input type="time" value={service.time} onChange={(e) => updateService(service.id, 'time', e.target.value)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              <Button className="w-full" size="lg" onClick={handleTestCreateBooking} disabled={isCreatingBooking}>
                {isCreatingBooking ? (
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
