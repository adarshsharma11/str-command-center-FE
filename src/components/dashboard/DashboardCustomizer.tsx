import { RotateCcw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { DashboardSection } from '@/hooks/useDashboardPreferences';
import { SECTION_LABELS, type UseDashboardPreferencesReturn } from '@/hooks/useDashboardPreferences';

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: UseDashboardPreferencesReturn;
}

const SECTION_ORDER: DashboardSection[] = [
  'kpis',
  'revenueTrends',
  'occupancyByProperty',
  'revenueByChannel',
  'upcomingEvents',
  'topProperties',
  'servicesRevenue',
  'guestOrigins',
  'priorityTasks',
];

export function DashboardCustomizer({
  open,
  onOpenChange,
  preferences,
}: DashboardCustomizerProps) {
  const { isSectionVisible, toggleSection, resetToDefaults, showAllSections, hideAllSections } = preferences;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Customize Dashboard</SheetTitle>
          <SheetDescription>
            Choose which sections to display on your dashboard. Your preferences are saved automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={showAllSections}>
              <Eye className="mr-2 h-4 w-4" />
              Show All
            </Button>
            <Button variant="outline" size="sm" onClick={hideAllSections}>
              <EyeOff className="mr-2 h-4 w-4" />
              Hide All
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          <Separator />

          {/* Section Toggles */}
          <div className="space-y-4">
            {SECTION_ORDER.map((section) => (
              <div key={section} className="flex items-center justify-between">
                <Label
                  htmlFor={`section-${section}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {SECTION_LABELS[section]}
                </Label>
                <Switch
                  id={`section-${section}`}
                  checked={isSectionVisible(section)}
                  onCheckedChange={() => toggleSection(section)}
                  disabled={section === 'kpis'} // KPIs always visible
                />
              </div>
            ))}
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">
            Key Metrics section is always visible. Your preferences are saved to your browser and will persist across sessions.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
