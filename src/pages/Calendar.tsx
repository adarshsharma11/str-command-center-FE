import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Plus, Settings } from 'lucide-react';
import { mockCalendarEvents, mockProperties, defaultEventCategories } from '@/lib/mockData';
import type { EventCategory, EventCategoryConfig } from '@/types';

export default function Calendar() {
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [categoryColors, setCategoryColors] = useState<EventCategoryConfig[]>(defaultEventCategories);
  const [showColorSettings, setShowColorSettings] = useState(false);

  // TODO: INTEGRATION STUB: Replace with Supabase query
  const events = mockCalendarEvents.filter(e => {
    const matchesProperty = selectedProperty === 'all' || e.propertyId === selectedProperty;
    return matchesProperty;
  });

  const getCategoryConfig = (category: EventCategory) => {
    return categoryColors.find(c => c.category === category) || defaultEventCategories[0];
  };

  const updateCategoryColor = (category: EventCategory, color: string) => {
    setCategoryColors(prev => 
      prev.map(c => c.category === category ? { ...c, color } : c)
    );
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">View and manage all events</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showColorSettings} onOpenChange={setShowColorSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Category Colors
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Customize Category Colors</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {categoryColors.map((config) => (
                    <div key={config.category} className="space-y-2">
                      <Label>{config.label}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={config.color}
                          onChange={(e) => updateCategoryColor(config.category, e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={config.color}
                          onChange={(e) => updateCategoryColor(config.category, e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {mockProperties.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Events List View */}
            <div className="space-y-3">
              {events.map((event) => {
                const config = getCategoryConfig(event.category);
                return (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-card border border-border hover:shadow-md transition-shadow"
                    style={{ borderLeftWidth: '4px', borderLeftColor: config.color }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary"
                            style={{ backgroundColor: `${config.color}20`, color: config.color }}
                          >
                            {config.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.startDate.toLocaleDateString()} 
                          {event.startDate.toDateString() !== event.endDate.toDateString() && 
                            ` → ${event.endDate.toLocaleDateString()}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {categoryColors.map((config) => (
                <div key={config.category} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-sm text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
