import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, User, Home, Mail, Phone, Plus, Trash2, Send, CheckCircle2, AlertCircle } from 'lucide-react';

// ============================================================
// TESTING PAGE
// This page allows developers to simulate bookings and test
// all the integrations (calendar blocking, guest messages,
// crew notifications, service provider notifications)
// 
// TODO: Your coders will need to hook these up to actual APIs
// ============================================================

// ============================================================
// TYPES FOR TEST BOOKING
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
  additionalServices: AdditionalService[];
};

// ============================================================
// MOCK DATA - Replace with real data from your API
// ============================================================
const MOCK_PROPERTIES = [
  { id: 'prop-1', name: 'Ocean View Villa' },
  { id: 'prop-2', name: 'Mountain Retreat' },
  { id: 'prop-3', name: 'Downtown Loft' },
  { id: 'prop-4', name: 'Beachfront Bungalow' },
];

const MOCK_SERVICES = [
  { id: 'service-chef', name: 'Private Chef', defaultDuration: '3 hours' },
  { id: 'service-massage', name: 'Massage Therapy', defaultDuration: '1 hour' },
  { id: 'service-transport', name: 'Airport Transfer', defaultDuration: '1 hour' },
  { id: 'service-concierge', name: 'Concierge Service', defaultDuration: '2 hours' },
  { id: 'service-bartender', name: 'Bartender', defaultDuration: '4 hours' },
  { id: 'service-photography', name: 'Photography Session', defaultDuration: '2 hours' },
];

const BOOKING_SOURCES = [
  { id: 'airbnb', name: 'Airbnb' },
  { id: 'vrbo', name: 'Vrbo' },
  { id: 'booking', name: 'Booking.com' },
  { id: 'direct', name: 'Direct Booking' },
];

// ============================================================
// LOG ENTRY TYPE - For showing test results
// ============================================================
type LogEntry = {
  id: string;
  timestamp: Date;
  type: 'calendar' | 'guest-message' | 'crew-message' | 'service-message';
  status: 'success' | 'pending' | 'error';
  message: string;
  details?: string;
};

export default function Testing() {
  // ============================================================
  // STATE - Form data and test results
  // ============================================================
  const [booking, setBooking] = useState<TestBooking>({
    bookingSource: '',
    propertyId: '',
    checkInDate: '',
    checkOutDate: '',
    guestEmail: '',
    guestPhone: '',
    guestName: '',
    additionalServices: [],
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // HANDLERS - Form updates
  // ============================================================
  const updateBooking = (field: keyof TestBooking, value: string) => {
    setBooking(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    const newService: AdditionalService = {
      id: `service-${Date.now()}`,
      serviceType: '',
      date: '',
      time: '',
    };
    setBooking(prev => ({
      ...prev,
      additionalServices: [...prev.additionalServices, newService],
    }));
  };

  const updateService = (serviceId: string, field: keyof AdditionalService, value: string) => {
    setBooking(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.map(s =>
        s.id === serviceId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const removeService = (serviceId: string) => {
    setBooking(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter(s => s.id !== serviceId),
    }));
  };

  // ============================================================
  // SUBMIT HANDLER
  // This is where your coders will hook up the actual API calls
  // Currently it just simulates what SHOULD happen
  // ============================================================
  const handleSubmitBooking = async () => {
    // Validate required fields
    if (!booking.bookingSource || !booking.propertyId || !booking.checkInDate || !booking.checkOutDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setLogs([]); // Clear previous logs

    const propertyName = MOCK_PROPERTIES.find(p => p.id === booking.propertyId)?.name || 'Unknown Property';

    try {
      // ============================================================
      // STEP 1: Block dates on calendar
      // TODO: Your coders will call the actual calendar blocking API here
      // Example: await calendarApi.blockDates({ propertyId, checkIn, checkOut })
      // ============================================================
      addLog({
        type: 'calendar',
        status: 'pending',
        message: `Blocking dates on calendar for ${propertyName}`,
        details: `${booking.checkInDate} to ${booking.checkOutDate}`,
      });
      
      // Simulate API call delay
      await simulateDelay(800);
      
      updateLogStatus('calendar', 'success', `Dates blocked on calendar for ${propertyName}`);

      // ============================================================
      // STEP 2: Send welcome message to guest
      // TODO: Your coders will call the messaging API here
      // Example: await messagingApi.sendWelcome({ email, phone, guestName, propertyName })
      // ============================================================
      addLog({
        type: 'guest-message',
        status: 'pending',
        message: `Sending welcome message to guest`,
        details: `Email: ${booking.guestEmail || 'N/A'}, Phone: ${booking.guestPhone || 'N/A'}`,
      });
      
      await simulateDelay(600);
      
      updateLogStatus('guest-message', 'success', 'Welcome message sent to guest');

      // ============================================================
      // STEP 3: Send checkout notification to cleaning crew
      // TODO: Your coders will call the crew notification API here
      // Example: await crewApi.notifyCleaningCrew({ propertyId, checkoutDate, time: '12:00' })
      // ============================================================
      addLog({
        type: 'crew-message',
        status: 'pending',
        message: `Scheduling cleaning crew for checkout`,
        details: `Date: ${booking.checkOutDate} at 12:00 midday`,
      });
      
      await simulateDelay(700);
      
      updateLogStatus('crew-message', 'success', `Cleaning crew notified for ${booking.checkOutDate} at 12:00`);

      // ============================================================
      // STEP 4: Send notifications to service providers
      // TODO: Your coders will call the service provider API here
      // Example: for each service -> await serviceApi.notifyProvider({ serviceType, date, time })
      // ============================================================
      for (const service of booking.additionalServices) {
        if (service.serviceType && service.date && service.time) {
          const serviceName = MOCK_SERVICES.find(s => s.id === service.serviceType)?.name || 'Service';
          
          addLog({
            type: 'service-message',
            status: 'pending',
            message: `Notifying ${serviceName} provider`,
            details: `Date: ${service.date} at ${service.time}`,
          });
          
          await simulateDelay(500);
          
          // Update the most recent service-message log
          setLogs(prev => {
            const lastServiceIndex = prev.map((l, i) => ({ l, i }))
              .filter(({ l }) => l.type === 'service-message' && l.status === 'pending')
              .pop()?.i;
            
            if (lastServiceIndex !== undefined) {
              const updated = [...prev];
              updated[lastServiceIndex] = {
                ...updated[lastServiceIndex],
                status: 'success',
                message: `${serviceName} provider notified`,
              };
              return updated;
            }
            return prev;
          });
        }
      }

      toast.success('Test booking submitted successfully! Check the logs below.');
      
    } catch (error) {
      toast.error('Error submitting test booking');
      console.error('Test booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs(prev => [...prev, {
      ...log,
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }]);
  };

  const updateLogStatus = (type: LogEntry['type'], status: LogEntry['status'], message: string) => {
    setLogs(prev => prev.map(log =>
      log.type === type && log.status === 'pending'
        ? { ...log, status, message }
        : log
    ));
  };

  const getLogIcon = (log: LogEntry) => {
    if (log.status === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (log.status === 'error') return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
  };

  const getLogTypeLabel = (type: LogEntry['type']) => {
    switch (type) {
      case 'calendar': return 'Calendar';
      case 'guest-message': return 'Guest';
      case 'crew-message': return 'Crew';
      case 'service-message': return 'Service';
      default: return 'Unknown';
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Testing Console</h1>
          <p className="text-muted-foreground">
            Simulate bookings to test calendar blocking, guest messages, and crew notifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Simulate Booking
              </CardTitle>
              <CardDescription>
                Enter booking details to test the full booking flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Source */}
              <div className="space-y-2">
                <Label>Booking Source *</Label>
                <Select value={booking.bookingSource} onValueChange={(v) => updateBooking('bookingSource', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_SOURCES.map(source => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Booked Property *
                </Label>
                <Select value={booking.propertyId} onValueChange={(v) => updateBooking('propertyId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PROPERTIES.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date *</Label>
                  <Input
                    type="date"
                    value={booking.checkInDate}
                    onChange={(e) => updateBooking('checkInDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date *</Label>
                  <Input
                    type="date"
                    value={booking.checkOutDate}
                    onChange={(e) => updateBooking('checkOutDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Guest Info */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Guest Name
                </Label>
                <Input
                  value={booking.guestName}
                  onChange={(e) => updateBooking('guestName', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Guest Email
                  </Label>
                  <Input
                    type="email"
                    value={booking.guestEmail}
                    onChange={(e) => updateBooking('guestEmail', e.target.value)}
                    placeholder="guest@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Guest Phone
                  </Label>
                  <Input
                    type="tel"
                    value={booking.guestPhone}
                    onChange={(e) => updateBooking('guestPhone', e.target.value)}
                    placeholder="+1 555 123 4567"
                  />
                </div>
              </div>

              <Separator />

              {/* Additional Services */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Additional Services</Label>
                  <Button variant="outline" size="sm" onClick={addService}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Service
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(service.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Service Type</Label>
                        <Select
                          value={service.serviceType}
                          onValueChange={(v) => updateService(service.id, 'serviceType', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_SERVICES.map(s => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} ({s.defaultDuration})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={service.date}
                            onChange={(e) => updateService(service.id, 'date', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={service.time}
                            onChange={(e) => updateService(service.id, 'time', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Submit Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Test Booking
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Results Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Test Results Log
              </CardTitle>
              <CardDescription>
                Watch the booking flow in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test results yet.</p>
                  <p className="text-sm">Submit a test booking to see the results here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                    >
                      {getLogIcon(log)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {getLogTypeLabel(log.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Developer Notes */}
              <Separator className="my-6" />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Developer Notes:</h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Calendar blocking: Hook up to your calendar API</li>
                  <li>Guest messages: Connect to email/SMS service (e.g., Resend, Twilio)</li>
                  <li>Crew notifications: Send to crew management system</li>
                  <li>Service providers: Notify via your vendor communication system</li>
                  <li>Check <code className="bg-muted px-1 rounded">handleSubmitBooking()</code> for TODO comments</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
