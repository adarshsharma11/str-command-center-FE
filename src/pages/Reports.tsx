import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ReportTypeSelector } from '@/components/reports/ReportTypeSelector';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { ScheduleReportDialog } from '@/components/reports/ScheduleReportDialog';
import { EmailReportDialog } from '@/components/reports/EmailReportDialog';
import { ScheduledReportsPanel } from '@/components/reports/ScheduledReportsPanel';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, FileBarChart } from 'lucide-react';
import type { ReportType, ReportFilters as ReportFiltersType } from '@/types/reports';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<string[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const dateFilter = useDateRangeFilter({ defaultPreset: 'lastMonth' });

  // Build filters object for API calls
  const filters: ReportFiltersType = {
    from: dateFilter.apiParams.from,
    to: dateFilter.apiParams.to,
    propertyIds: selectedPropertyIds.length > 0 ? selectedPropertyIds : undefined,
    ownerIds: selectedOwnerIds.length > 0 ? selectedOwnerIds : undefined,
  };

  const handleBackToSelection = () => {
    setSelectedReport(null);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileBarChart className="h-6 w-6" />
              Reports
            </h1>
            <p className="text-muted-foreground">
              Generate and schedule property management reports
            </p>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Generate Report
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Scheduled Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            {!selectedReport ? (
              // Report Type Selection
              <ReportTypeSelector onSelect={setSelectedReport} />
            ) : (
              // Report Generation Flow
              <div className="space-y-6">
                {/* Filters Section */}
                <ReportFilters
                  reportType={selectedReport}
                  dateFilter={dateFilter}
                  selectedPropertyIds={selectedPropertyIds}
                  setSelectedPropertyIds={setSelectedPropertyIds}
                  selectedOwnerIds={selectedOwnerIds}
                  setSelectedOwnerIds={setSelectedOwnerIds}
                  onBack={handleBackToSelection}
                  onSchedule={() => setScheduleDialogOpen(true)}
                  onEmail={() => setEmailDialogOpen(true)}
                />

                {/* Report Preview */}
                <ReportPreview reportType={selectedReport} filters={filters} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledReportsPanel />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <ScheduleReportDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          reportType={selectedReport}
          filters={filters}
        />

        <EmailReportDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          reportType={selectedReport}
          filters={filters}
        />
      </div>
    </Layout>
  );
}
