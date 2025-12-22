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
import { Calendar, Clock, User, Home, Mail, Phone, Plus, Trash2, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { fetchServiceCategories, useServiceCategoriesQuery, type ServiceCategory } from '@/lib/api/service-category';
import { useAllPropertiesQuery } from '@/lib/api/property';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { env } from '@/config/env';
import { getToken } from '@/lib/auth/token';

// ============================================================
// TESTING PAGE
// This page allows developers to simulate bookings and test
// all the integrations (calendar blocking, guest messages,
// crew notifications, service provider notifications)
// 
// TODO: Your coders will need to hook these up to actual APIs
// 
// RECENT UPDATES:
// - Added email and phone fields to Service Category API
// - Service categories now support contact information
// - Replaced MOCK_SERVICES with real Service Category API
// - Service selection now uses actual service categories from backend
// - Added Total Amount and Number of Guests fields to form
// - Form now captures all payload fields for complete booking testing
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
  totalAmount: string;
  numberOfGuests: string;
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
  type: 'calendar' | 'guest-message' | 'crew-message' | 'service-message' | 'database' | 'system';
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
    totalAmount: '',
    numberOfGuests: '',
    additionalServices: [],
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Test State
  const [fetchedCategories, setFetchedCategories] = useState<ServiceCategory[] | null>(null);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [bookingTestResult, setBookingTestResult] = useState<unknown>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

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

  const { data: propertiesData, isLoading: isLoadingProperties } = useAllPropertiesQuery();
  const properties = (Array.isArray(propertiesData?.data) ? propertiesData.data : propertiesData?.data?.data) || [];

  // Fetch service categories for service selection
  const { data: serviceCategoriesData, isLoading: isLoadingServiceCategories } = useServiceCategoriesQuery();
  const serviceCategories = serviceCategoriesData?.data || [];

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

    const propertyName = properties.find(p => String(p.id) === booking.propertyId)?.name || 
                        MOCK_PROPERTIES.find(p => p.id === booking.propertyId)?.name || 
                        'Unknown Property';

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
          const serviceName = serviceCategories.find(c => String(c.id) === service.serviceType)?.category_name || 'Service';
          
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

  const getLogIcon = (log: LogEntry) => {
    if (log.status === 'success') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (log.status === 'error') return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />;
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
                    <SelectValue placeholder={isLoadingProperties ? "Loading properties..." : "Select property"} />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.length > 0 ? (
                      properties.map(property => (
                        <SelectItem key={property.id} value={String(property.id)}>
                          {property.name}
                        </SelectItem>
                      ))
                    ) : (
                      MOCK_PROPERTIES.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} (Mock)
                        </SelectItem>
                      ))
                    )}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Guests</Label>
                  <Input
                    type="number"
                    min="1"
                    value={booking.numberOfGuests}
                    onChange={(e) => updateBooking('numberOfGuests', e.target.value)}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount (USD)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={booking.totalAmount}
                    onChange={(e) => updateBooking('totalAmount', e.target.value)}
                    placeholder="100.00"
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

        {/* API Tests */}
        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
            <CardDescription>Directly test API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">GET /service-categories</h3>
                  <p className="text-sm text-muted-foreground">Fetch all service categories</p>
                </div>
                <Button onClick={handleTestFetchCategories} disabled={isFetchingCategories}>
                  {isFetchingCategories && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Fetch Categories
                </Button>
              </div>

              {fetchedCategories && (
                <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-60">
                  <pre className="text-xs">{JSON.stringify(fetchedCategories, null, 2)}</pre>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">POST /api/v1/bookings</h3>
                  <p className="text-sm text-muted-foreground">Create a test booking using form data above</p>
                </div>
                <Button onClick={handleTestCreateBooking} disabled={isCreatingBooking}>
                  {isCreatingBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Booking (from Form)
                </Button>
              </div>

              {bookingTestResult && (
                <div className="mt-4 p-4 bg-muted rounded-md overflow-auto max-h-60">
                  <pre className="text-xs">{JSON.stringify(bookingTestResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
