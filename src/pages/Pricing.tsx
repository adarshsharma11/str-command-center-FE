import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Settings,
  RefreshCw,
  Info,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Circle,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/dashboardCalculations';
import { usePropertiesQuery, propertyMappers, type PropertyView } from '@/lib/api/property';
import { useBookingsQuery } from '@/lib/api/booking';
import {
  fetchPricingSettings,
  updatePricingSettings,
  type PricingSettings as PricingConfig,
} from '@/lib/api/pricing';
import { PricingPageSkeleton } from '@/components/skeletons/PricingSkeleton';
import {
  format,
  addDays,
  addMonths,
  subMonths,
  isWeekend,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getDay,
  isBefore,
  startOfDay,
} from 'date-fns';

// Seasonality configuration (month -> multiplier)
const SEASONALITY: Record<number, number> = {
  0: 0.85,  // January - low
  1: 0.90,  // February - low
  2: 1.00,  // March - normal
  3: 1.10,  // April - spring break
  4: 1.15,  // May - high
  5: 1.30,  // June - peak
  6: 1.40,  // July - peak
  7: 1.35,  // August - peak
  8: 1.10,  // September - shoulder
  9: 1.00,  // October - normal
  10: 0.95, // November - low
  11: 1.20, // December - holidays
};

// Day of week multipliers (0 = Sunday, 6 = Saturday)
const DAY_OF_WEEK_MULTIPLIERS: Record<number, number> = {
  0: 1.05,  // Sunday
  1: 0.90,  // Monday
  2: 0.90,  // Tuesday
  3: 0.92,  // Wednesday
  4: 0.95,  // Thursday
  5: 1.15,  // Friday
  6: 1.20,  // Saturday
};

const DEFAULT_CONFIG: PricingConfig = {
  weekend_boost: 20,
  seasonal_strength: 75,
  island_discount: 10,
};


/**
 * Detect if a date is an "island" - isolated available nights between bookings
 * Returns island size (1, 2, or 3) or 0 if not an island
 */
function detectIslandSize(
  date: Date,
  bookedDates: string[],
  lookAhead: number = 7
): number {
  const dateStr = format(date, 'yyyy-MM-dd');

  // If this date is booked, it's not an island
  if (bookedDates.includes(dateStr)) return 0;

  // Check consecutive available nights starting from this date
  let consecutiveAvailable = 0;
  for (let i = 0; i < lookAhead; i++) {
    const checkDate = addDays(date, i);
    const checkStr = format(checkDate, 'yyyy-MM-dd');
    if (bookedDates.includes(checkStr)) break;
    consecutiveAvailable++;
  }

  // Check if there's a booking before this date (within 3 days)
  let hasBookingBefore = false;
  for (let i = 1; i <= 3; i++) {
    const checkDate = addDays(date, -i);
    const checkStr = format(checkDate, 'yyyy-MM-dd');
    if (bookedDates.includes(checkStr)) {
      hasBookingBefore = true;
      break;
    }
  }

  // Check if there's a booking after the available stretch (within 1 day)
  const nextBookedDate = addDays(date, consecutiveAvailable);
  const nextStr = format(nextBookedDate, 'yyyy-MM-dd');
  const hasBookingAfter = bookedDates.includes(nextStr);

  // It's an island if there are bookings on both sides and 1-3 nights available
  if (hasBookingBefore && hasBookingAfter && consecutiveAvailable <= 3) {
    return consecutiveAvailable;
  }

  return 0;
}

/**
 * AI Pricing Algorithm
 */
function calculateAIPrice(
  basePrice: number,
  date: Date,
): { price: number; factors: string[] } {
  let multiplier = 1;
  const factors: string[] = [];

  const month = date.getMonth();
  const seasonMultiplier = SEASONALITY[month];
  multiplier *= seasonMultiplier;

  if (seasonMultiplier >= 1.30) {
    factors.push('Peak Season');
  } else if (seasonMultiplier >= 1.10) {
    factors.push('High Season');
  } else if (seasonMultiplier <= 0.90) {
    factors.push('Low Season');
  }

  const dayOfWeek = getDay(date);
  const dayMultiplier = DAY_OF_WEEK_MULTIPLIERS[dayOfWeek];
  multiplier *= dayMultiplier;

  if (dayOfWeek === 5 || dayOfWeek === 6) {
    factors.push('Weekend');
  } else if (dayOfWeek === 1 || dayOfWeek === 2) {
    factors.push('Midweek');
  }

  const today = startOfDay(new Date());
  const daysUntil = differenceInDays(date, today);

  if (daysUntil <= 3 && daysUntil >= 0) {
    multiplier *= 0.90;
    factors.push('Last Minute');
  } else if (daysUntil >= 60) {
    multiplier *= 1.05;
    factors.push('Early Bird');
  }

  const monthDay = `${month + 1}-${date.getDate()}`;
  const holidays = ['12-24', '12-25', '12-31', '1-1', '7-4', '11-25', '11-26'];
  if (holidays.includes(monthDay)) {
    multiplier *= 1.25;
    factors.push('Holiday');
  }

  let finalPrice = basePrice * multiplier;
  finalPrice = Math.max(basePrice * 0.70, Math.min(basePrice * 1.50, finalPrice));

  return {
    price: Math.round(finalPrice),
    factors,
  };
}

/**
 * Manual Config Price Calculator
 * Island Discount: base discount for 3-night islands, 1.33x for 2-night, 1.5x for 1-night
 */
function calculateManualPrice(
  basePrice: number,
  date: Date,
  config: PricingConfig,
  bookedDates: string[] = [],
): { price: number; factors: string[]; isIsland: boolean } {
  let multiplier = 1;
  const factors: string[] = [];
  let isIsland = false;

  // 1. Seasonal adjustment
  const month = date.getMonth();
  const rawSeasonMultiplier = SEASONALITY[month];
  const seasonEffect = (rawSeasonMultiplier - 1) * (config.seasonal_strength / 100);
  multiplier *= (1 + seasonEffect);

  if (seasonEffect > 0.1) {
    factors.push('Peak Season');
  } else if (seasonEffect < -0.05) {
    factors.push('Low Season');
  }

  // 2. Weekend boost
  if (isWeekend(date) && config.weekend_boost > 0) {
    multiplier *= (1 + config.weekend_boost / 100);
    factors.push(`Weekend +${config.weekend_boost}%`);
  }

  // 3. Island Discount
  const islandSize = detectIslandSize(date, bookedDates);
  if (islandSize > 0 && config.island_discount > 0) {
    isIsland = true;
    // Base discount for 3-night island, increased for smaller islands
    let discountMultiplier = 1;
    if (islandSize === 1) {
      discountMultiplier = 1.5;  // 1-night island gets 1.5x the discount
    } else if (islandSize === 2) {
      discountMultiplier = 1.33; // 2-night island gets 1.33x the discount
    }
    // islandSize === 3 uses base discount (1x)

    const effectiveDiscount = config.island_discount * discountMultiplier;
    multiplier *= (1 - effectiveDiscount / 100);
    factors.push(`Island ${islandSize}d -${Math.round(effectiveDiscount)}%`);
  }

  let finalPrice = basePrice * multiplier;

  // Apply reasonable bounds
  finalPrice = Math.max(basePrice * 0.50, Math.min(basePrice * 1.50, finalPrice));

  return {
    price: Math.round(finalPrice),
    factors,
    isIsland,
  };
}

// Calendar component for AI Optimization tab
function PricingCalendar({
  property,
  currentMonth,
  bookedDates,
}: {
  property: PropertyView;
  currentMonth: Date;
  bookedDates: string[];
}) {

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const paddingDays = Array(startDay).fill(null);
  const today = startOfDay(new Date());

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
          {day}
        </div>
      ))}
      {paddingDays.map((_, i) => (
        <div key={`pad-${i}`} className="h-20" />
      ))}
      {days.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isBooked = bookedDates.includes(dateStr);
        const isPast = isBefore(date, today);
        const basePrice = property.basePrice || 250;
        const { price } = calculateAIPrice(basePrice, date);
        const diff = price - basePrice;
        const diffPct = Math.round((diff / basePrice) * 100);

        return (
          <div
            key={dateStr}
            className={`h-20 p-1 border rounded-lg text-center flex flex-col justify-between ${
              isBooked
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200'
                : isPast
                ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 opacity-50'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200'
            } ${isToday(date) ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-xs font-medium">{format(date, 'd')}</div>
            {isBooked ? (
              <div className="text-xs font-medium text-red-600">Booked</div>
            ) : isPast ? (
              <div className="text-xs text-muted-foreground">-</div>
            ) : (
              <>
                <div className="text-sm font-bold text-green-700 dark:text-green-400">
                  ${price}
                </div>
                <div className={`text-[10px] ${diffPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {diffPct >= 0 ? '+' : ''}{diffPct}%
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Pricing() {
  const queryClient = useQueryClient();
  const { data: properties, isLoading: isLoadingProperties } = usePropertiesQuery();
  const { data: bookings, isLoading: isLoadingBookings } = useBookingsQuery();
  
  // Fetch settings from API
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['pricing-settings'],
    queryFn: fetchPricingSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updatePricingSettings,
    onSuccess: () => {
      toast.success('Pricing settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['pricing-settings'] });
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  const propertyList = useMemo(() => 
    (properties?.data ?? []).map(propertyMappers.toViewProperty),
    [properties]
  );
  
  const [selectedProperty, setSelectedProperty] = useState<PropertyView | null>(null);
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_CONFIG);
  const [autoSync, setAutoSync] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sync local config with API data when it arrives
  useEffect(() => {
    if (settingsData?.data) {
      setConfig(settingsData.data);
    }
  }, [settingsData]);

    const bookedDates = useMemo(() => {
    if (!bookings?.data?.bookings || !selectedProperty) return [];

    const dates: string[] = [];

    bookings.data.bookings.forEach((booking) => {
      if (String(booking.property_id) !== String(selectedProperty.id)) return;
      if (!booking.check_in_date || !booking.check_out_date) return;

      const start = startOfDay(new Date(booking.check_in_date));
      const end = startOfDay(new Date(booking.check_out_date));

      const days = eachDayOfInterval({
        start,
        end: addDays(end, -1),
      });

      days.forEach((d) => {
        dates.push(format(d, "yyyy-MM-dd"));
      });
    });

    return dates;
  }, [bookings, selectedProperty]);

  useEffect(() => {
  if (propertyList.length && !selectedProperty) {
    setSelectedProperty(propertyList[0]);
  }
}, [propertyList]);

const basePrice = selectedProperty?.basePrice || 250;
  // Generate next 14 days of pricing
const pricingPreview = useMemo(() => {
  if (!selectedProperty) return [];

  const today = new Date();

  return Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i);

    const manual = calculateManualPrice(
      basePrice,
      date,
      config,
      bookedDates
    );

    const ai = calculateAIPrice(basePrice, date);

    return {
      date,
      ...manual,
      aiPrice: ai.price,
      aiFactors: ai.factors,
    };
  });
}, [selectedProperty, config, bookedDates]);

  const avgOptimizedPrice = Math.round(
    pricingPreview.reduce((sum, p) => sum + p.price, 0) / pricingPreview.length
  );

  const potentialRevenue = avgOptimizedPrice * 30 * 0.75;
  const baselineRevenue = basePrice * 30 * 0.75;
  const revenueIncrease = ((potentialRevenue - baselineRevenue) / baselineRevenue) * 100;

  if (isLoadingProperties || isLoadingBookings || !selectedProperty) {
  return (
    <Layout>
      <PricingPageSkeleton />
    </Layout>
  );
}

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <DollarSign className="h-6 w-6" />
              Dynamic Pricing
            </h1>
            <p className="text-muted-foreground">
              Optimize your nightly rates to maximize revenue
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              <Label className="text-sm">Auto-sync to channels</Label>
            </div>
            <Button disabled={!autoSync}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Prices
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Optimization
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              My Settings
            </TabsTrigger>
          </TabsList>

          {/* AI Optimization Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Property Selection Sidebar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Select Property</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {propertyList && propertyList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProperty(p)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedProperty.id === p.id
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Base: {formatCurrency(p.basePrice || 250)}/night
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Calendar View */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        AI-Optimized Prices - {selectedProperty.name}
                      </CardTitle>
                      <CardDescription>
                        Prices calculated based on seasonality, day of week, and demand
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm font-medium w-32 text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <PricingCalendar
                    property={selectedProperty}
                    currentMonth={currentMonth}
                    bookedDates={bookedDates}
                  />
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded ring-2 ring-primary" />
                      <span>Today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Algorithm Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  How AI Pricing Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4 text-sm">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="font-medium mb-1">Seasonality</div>
                    <p className="text-xs text-muted-foreground">
                      Summer +40%, Holidays +20%, Winter -15%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="font-medium mb-1">Day of Week</div>
                    <p className="text-xs text-muted-foreground">
                      Sat +20%, Fri +15%, Mon/Tue -10%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="font-medium mb-1">Lead Time</div>
                    <p className="text-xs text-muted-foreground">
                      Last minute -10%, 60+ days +5%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="font-medium mb-1">Holidays</div>
                    <p className="text-xs text-muted-foreground">
                      Christmas, NYE, July 4th +25%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manual Configuration Tab - SIMPLIFIED */}
          <TabsContent value="manual" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Simple Controls */}
              <div className="space-y-6">
                {/* Property Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Select Property</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={selectedProperty.id}
                      onValueChange={(id) =>
                        setSelectedProperty(propertyList.find((p) => p.id === id)!)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyList && propertyList.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - {formatCurrency(p.basePrice)}/night
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Price</span>
                        <span className="font-medium">{formatCurrency(basePrice)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3 Simple Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Your Pricing Rules
                    </CardTitle>
                    <CardDescription>3 simple controls to customize your prices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Control 1: Weekend Boost */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Sun className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Weekend Boost</Label>
                            <p className="text-xs text-muted-foreground">Fri & Sat nights</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-base font-bold">
                          +{config.weekend_boost}%
                        </Badge>
                      </div>
                      <Slider
                        value={[config.weekend_boost]}
                        onValueChange={([v]) => setConfig({ ...config, weekend_boost: v })}
                        max={50}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>No boost</span>
                        <span>+50%</span>
                      </div>
                    </div>

                    {/* Control 2: Seasonal Strength */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Seasonal Adjustment</Label>
                            <p className="text-xs text-muted-foreground">Follow peak/low seasons</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-base font-bold">
                          {config.seasonal_strength}%
                        </Badge>
                      </div>
                      <Slider
                        value={[config.seasonal_strength]}
                        onValueChange={([v]) => setConfig({ ...config, seasonal_strength: v })}
                        max={100}
                        step={10}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Ignore seasons</span>
                        <span>Full adjustment</span>
                      </div>
                    </div>

                    {/* Control 3: Island Discount */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Circle className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Label className="text-sm font-medium">Island Discount</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm">
                                    "Islands" are isolated available nights between bookings.
                                    Discount them to fill gaps in your calendar.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-base font-bold">
                          -{config.island_discount}%
                        </Badge>
                      </div>
                      <Slider
                        value={[config.island_discount]}
                        onValueChange={([v]) => setConfig({ ...config, island_discount: v })}
                        max={30}
                        step={5}
                        className="py-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>No discount</span>
                        <span>-30%</span>
                      </div>
                    </div>

                    {/* Island Discount Explanation */}
                    <div className="p-3 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                          How Island Discount Works
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>3-night island:</span>
                          <span className="font-medium">-{config.island_discount}% (base)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2-night island:</span>
                          <span className="font-medium">-{Math.round(config.island_discount * 1.33)}% (1.33x)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>1-night island:</span>
                          <span className="font-medium">-{Math.round(config.island_discount * 1.5)}% (1.5x)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setConfig(DEFAULT_CONFIG)}
                      >
                        Reset
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => updateSettingsMutation.mutate(config)}
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Save Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview & Results */}
              <div className="lg:col-span-2 space-y-6">
                {/* Revenue Impact */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Avg Rate</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{formatCurrency(avgOptimizedPrice)}</p>
                      <p className="text-xs text-muted-foreground">
                        vs {formatCurrency(basePrice)} base
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Monthly Est.</span>
                      </div>
                      <p className="text-2xl font-bold mt-2">{formatCurrency(potentialRevenue)}</p>
                      <p className="text-xs text-muted-foreground">at 75% occupancy</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-400">
                          Revenue Change
                        </span>
                      </div>
                      <p className="text-2xl font-bold mt-2 text-green-600">
                        {revenueIncrease >= 0 ? '+' : ''}{revenueIncrease.toFixed(1)}%
                      </p>
                      <p className="text-xs text-green-600">
                        {revenueIncrease >= 0 ? '+' : ''}{formatCurrency(potentialRevenue - baselineRevenue)}/mo
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 14-Day Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      14-Day Price Preview
                    </CardTitle>
                    <CardDescription>
                      Compare your settings with AI recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead className="text-right">Base</TableHead>
                          <TableHead className="text-right">
                            <span className="flex items-center justify-end gap-1">
                              <Sparkles className="h-3 w-3 text-yellow-500" />
                              AI
                            </span>
                          </TableHead>
                          <TableHead className="text-right">Yours</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pricingPreview.map(({ date, price, factors, aiPrice, isIsland }) => {
                          const diff = price - basePrice;
                          const diffPct = ((diff / basePrice) * 100).toFixed(0);
                          const aiDiff = aiPrice - basePrice;
                          const aiDiffPct = ((aiDiff / basePrice) * 100).toFixed(0);
                          return (
                            <TableRow key={date.toISOString()} className={isIsland ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}>
                              <TableCell className="font-medium">
                                {format(date, 'MMM d')}
                                {isIsland && <Circle className="inline h-2 w-2 ml-1 text-purple-500 fill-purple-500" />}
                              </TableCell>
                              <TableCell>{format(date, 'EEE')}</TableCell>
                              <TableCell className="text-right text-muted-foreground">
                                {formatCurrency(basePrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-yellow-600">{formatCurrency(aiPrice)}</span>
                                <span className={`ml-1 text-xs ${aiDiff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {aiDiff >= 0 ? '+' : ''}{aiDiffPct}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-medium">{formatCurrency(price)}</span>
                                <span className={`ml-1 text-xs ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {diff >= 0 ? '+' : ''}{diffPct}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {factors.map((f, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {f}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
