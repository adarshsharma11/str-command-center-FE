import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer';
import type {
  ReportType, OwnerStatementData, BookingSummaryData,
  ServiceRevenueData, ServiceProviderData, OccupancyReportData,
  PerformanceReportData,
} from '@/types/reports';

// ── Styles ──────────────────────────────────────────────
const PRIMARY = '#0077b6';
const DARK = '#1e293b';
const MUTED = '#64748b';
const LIGHT_BG = '#f8fafc';
const BORDER = '#e2e8f0';
const GREEN = '#16a34a';
const RED = '#dc2626';
const PURPLE = '#9333ea';

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: DARK },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottomWidth: 3, borderBottomColor: PRIMARY },
  logo: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: PRIMARY, letterSpacing: 1 },
  logoSub: { fontSize: 8, color: MUTED, marginTop: 2, letterSpacing: 0.5 },
  headerRight: { textAlign: 'right' },
  reportTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: DARK },
  reportDate: { fontSize: 9, color: MUTED, marginTop: 4 },
  generatedAt: { fontSize: 7, color: MUTED, marginTop: 2 },
  // Section
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: DARK, marginTop: 20, marginBottom: 10, paddingBottom: 4, borderBottomWidth: 1.5, borderBottomColor: PRIMARY },
  // KPI Row
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  kpiCard: { flex: 1, backgroundColor: LIGHT_BG, borderRadius: 6, padding: 12, borderWidth: 1, borderColor: BORDER },
  kpiLabel: { fontSize: 8, color: MUTED, marginBottom: 4 },
  kpiValue: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: DARK },
  kpiChange: { fontSize: 8, marginTop: 4 },
  // Table
  table: { marginBottom: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: PRIMARY, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  tableHeaderCell: { padding: 8, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tableRowAlt: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: BORDER, backgroundColor: '#f9fafb' },
  tableCell: { padding: 7, fontSize: 9, color: DARK },
  tableCellRight: { padding: 7, fontSize: 9, color: DARK, textAlign: 'right' },
  tableCellCenter: { padding: 7, fontSize: 9, color: DARK, textAlign: 'center' },
  // Bar chart representation
  barContainer: { marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 9, color: DARK, width: 120 },
  barTrack: { flex: 1, height: 14, backgroundColor: '#e2e8f0', borderRadius: 3 },
  barFill: { height: 14, backgroundColor: PRIMARY, borderRadius: 3 },
  barValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK, width: 60, textAlign: 'right' },
  // Footer
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 8 },
  footerText: { fontSize: 7, color: MUTED },
  // Misc
  row: { flexDirection: 'row' },
  summaryBox: { backgroundColor: LIGHT_BG, borderRadius: 6, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryLabel: { fontSize: 9, color: MUTED },
  summaryValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  badge: { fontSize: 8, backgroundColor: LIGHT_BG, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 0.5, borderColor: BORDER },
  greenText: { color: GREEN },
  redText: { color: RED },
  purpleText: { color: PURPLE },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 12 },
  pageNumber: { fontSize: 8, color: MUTED, textAlign: 'center', marginTop: 'auto', paddingTop: 20 },
});

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); } catch { return d; } };
const fmtShort = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }); } catch { return d; } };

// ── Shared Components ───────────────────────────────────
function Header({ title, periodStart, periodEnd }: { title: string; periodStart?: string; periodEnd?: string }) {
  return (
    <View style={s.header}>
      <View>
        <Text style={s.logo}>MOMA.HOUSE</Text>
        <Text style={s.logoSub}>PREMIUM PROPERTY MANAGEMENT</Text>
      </View>
      <View style={s.headerRight}>
        <Text style={s.reportTitle}>{title}</Text>
        {periodStart && periodEnd && (
          <Text style={s.reportDate}>{fmtDate(periodStart)} — {fmtDate(periodEnd)}</Text>
        )}
        <Text style={s.generatedAt}>Generated: {new Date().toLocaleString()}</Text>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>MOMA.HOUSE — Premium Property Management</Text>
      <Text style={s.footerText}>Confidential</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} style={s.footerText} />
    </View>
  );
}

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={s.kpiCard}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={s.kpiValue}>{value}</Text>
      {sub && <Text style={[s.kpiChange, { color: sub.startsWith('+') || sub.startsWith('↑') ? GREEN : sub.startsWith('-') || sub.startsWith('↓') ? RED : MUTED }]}>{sub}</Text>}
    </View>
  );
}

function BarRow({ label, value, maxValue, displayValue }: { label: string; value: number; maxValue: number; displayValue: string }) {
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <View style={s.barContainer}>
      <Text style={s.barLabel}>{label}</Text>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.barValue}>{displayValue}</Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
// OWNER STATEMENT PDF
// ══════════════════════════════════════════════════════════
function OwnerStatementPDF({ data }: { data: OwnerStatementData }) {
  return (
    <Page size="A4" style={s.page}>
      <Header title="Owner Statement" periodStart={data.period_start} periodEnd={data.period_end} />

      <View style={s.summaryBox}>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Owner</Text>
          <Text style={s.summaryValue}>{data.owner_name}</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Email</Text>
          <Text style={{ fontSize: 9, color: MUTED }}>{data.owner_email}</Text>
        </View>
      </View>

      <View style={s.kpiRow}>
        <KPICard label="Rental Revenue" value={fmt(data.total_revenue)} />
        <KPICard label="Total Expenses" value={fmt(data.total_expenses)} />
        <KPICard label={`Mgmt Fee (${data.management_fee_percentage}%)`} value={fmt(data.management_fee)} />
        <KPICard label="Net Payout" value={fmt(data.total_payout)} />
      </View>

      {data.properties.map((prop) => (
        <View key={prop.property_id} wrap={false}>
          <Text style={s.sectionTitle}>{prop.property_name}</Text>
          <Text style={{ fontSize: 8, color: MUTED, marginBottom: 8 }}>{prop.property_address}</Text>

          <View style={[s.row, { gap: 16, marginBottom: 10 }]}>
            <Text style={{ fontSize: 9 }}>Occupancy: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{prop.occupancy_rate}%</Text></Text>
            <Text style={{ fontSize: 9 }}>Nights: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{prop.nights_booked}</Text></Text>
            <Text style={{ fontSize: 9 }}>ADR: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{fmt(prop.average_daily_rate)}</Text></Text>
          </View>

          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.tableHeaderCell, { width: '25%' }]}>Guest</Text>
              <Text style={[s.tableHeaderCell, { width: '22%' }]}>Dates</Text>
              <Text style={[s.tableHeaderCell, { width: '12%', textAlign: 'center' }]}>Nights</Text>
              <Text style={[s.tableHeaderCell, { width: '18%' }]}>Channel</Text>
              <Text style={[s.tableHeaderCell, { width: '23%', textAlign: 'right' }]}>Revenue</Text>
            </View>
            {prop.bookings.map((b, i) => (
              <View key={b.booking_id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.tableCell, { width: '25%' }]}>{b.guest_name}</Text>
                <Text style={[s.tableCell, { width: '22%' }]}>{fmtShort(b.check_in)} – {fmtShort(b.check_out)}</Text>
                <Text style={[s.tableCellCenter, { width: '12%' }]}>{b.nights}</Text>
                <Text style={[s.tableCell, { width: '18%' }]}>{b.channel}</Text>
                <Text style={[s.tableCellRight, { width: '23%', fontFamily: 'Helvetica-Bold' }]}>{fmt(b.revenue)}</Text>
              </View>
            ))}
          </View>

          <View style={[s.summaryBox, { flexDirection: 'row', justifyContent: 'space-around' }]}>
            <View>
              <Text style={s.summaryLabel}>Revenue</Text>
              <Text style={[s.summaryValue, s.greenText]}>{fmt(prop.total_revenue)}</Text>
            </View>
            <View>
              <Text style={s.summaryLabel}>Channel Fees</Text>
              <Text style={[s.summaryValue, s.redText]}>-{fmt(prop.channel_fees)}</Text>
            </View>
            <View>
              <Text style={s.summaryLabel}>Cleaning</Text>
              <Text style={[s.summaryValue, s.redText]}>-{fmt(prop.cleaning_expenses)}</Text>
            </View>
            <View>
              <Text style={s.summaryLabel}>Maintenance</Text>
              <Text style={[s.summaryValue, s.redText]}>-{fmt(prop.maintenance_expenses)}</Text>
            </View>
            <View>
              <Text style={s.summaryLabel}>Net Revenue</Text>
              <Text style={[s.summaryValue, { fontFamily: 'Helvetica-Bold' }]}>{fmt(prop.net_revenue)}</Text>
            </View>
          </View>
        </View>
      ))}

      <Footer />
    </Page>
  );
}

// ══════════════════════════════════════════════════════════
// BOOKING SUMMARY PDF
// ══════════════════════════════════════════════════════════
function BookingSummaryPDF({ data }: { data: BookingSummaryData }) {
  const maxChannelRev = Math.max(...data.by_channel.map(c => c.revenue));
  const maxPropRev = Math.max(...data.by_property.map(p => p.revenue));

  return (
    <Page size="A4" style={s.page}>
      <Header title="Booking Summary" periodStart={data.period_start} periodEnd={data.period_end} />

      <View style={s.kpiRow}>
        <KPICard label="Total Bookings" value={String(data.total_bookings)} />
        <KPICard label="Total Revenue" value={fmt(data.total_revenue)} />
        <KPICard label="Total Nights" value={String(data.total_nights)} />
        <KPICard label="Avg Booking Value" value={fmt(data.average_booking_value)} />
      </View>

      <Text style={s.sectionTitle}>Revenue by Channel</Text>
      {data.by_channel.map(ch => (
        <BarRow key={ch.channel} label={`${ch.channel} (${ch.count})`} value={ch.revenue} maxValue={maxChannelRev} displayValue={fmt(ch.revenue)} />
      ))}

      <Text style={s.sectionTitle}>Revenue by Property</Text>
      {data.by_property.map(p => (
        <BarRow key={p.property_id} label={`${p.property_name} (${p.count})`} value={p.revenue} maxValue={maxPropRev} displayValue={fmt(p.revenue)} />
      ))}

      <Text style={s.sectionTitle}>All Bookings</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: '20%' }]}>Property</Text>
          <Text style={[s.tableHeaderCell, { width: '16%' }]}>Guest</Text>
          <Text style={[s.tableHeaderCell, { width: '18%' }]}>Dates</Text>
          <Text style={[s.tableHeaderCell, { width: '8%', textAlign: 'center' }]}>Nts</Text>
          <Text style={[s.tableHeaderCell, { width: '12%' }]}>Channel</Text>
          <Text style={[s.tableHeaderCell, { width: '12%' }]}>Status</Text>
          <Text style={[s.tableHeaderCell, { width: '14%', textAlign: 'right' }]}>Amount</Text>
        </View>
        {data.bookings.map((b, i) => (
          <View key={b.booking_id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCell, { width: '20%' }]}>{b.property_name}</Text>
            <Text style={[s.tableCell, { width: '16%' }]}>{b.guest_name}</Text>
            <Text style={[s.tableCell, { width: '18%' }]}>{fmtShort(b.check_in)} – {fmtShort(b.check_out)}</Text>
            <Text style={[s.tableCellCenter, { width: '8%' }]}>{b.nights}</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>{b.channel}</Text>
            <Text style={[s.tableCell, { width: '12%' }]}>{b.status}</Text>
            <Text style={[s.tableCellRight, { width: '14%', fontFamily: 'Helvetica-Bold' }]}>{fmt(b.total_amount)}</Text>
          </View>
        ))}
      </View>

      <Footer />
    </Page>
  );
}

// ══════════════════════════════════════════════════════════
// SERVICE REVENUE PDF
// ══════════════════════════════════════════════════════════
function ServiceRevenuePDF({ data }: { data: ServiceRevenueData }) {
  const maxRev = Math.max(...data.services.map(sv => sv.total_revenue));
  const maxPropRev = Math.max(...data.top_properties.map(p => p.revenue));

  return (
    <Page size="A4" style={s.page}>
      <Header title="Service Revenue Report" periodStart={data.period_start} periodEnd={data.period_end} />

      <View style={s.kpiRow}>
        <KPICard label="Total Revenue" value={fmt(data.total_revenue)} />
        <KPICard label="Total Bookings" value={String(data.total_bookings)} />
        <KPICard label="Service Types" value={String(data.services.length)} />
      </View>

      <Text style={s.sectionTitle}>Service Performance</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: '25%' }]}>Service</Text>
          <Text style={[s.tableHeaderCell, { width: '18%', textAlign: 'right' }]}>Revenue</Text>
          <Text style={[s.tableHeaderCell, { width: '14%', textAlign: 'center' }]}>Bookings</Text>
          <Text style={[s.tableHeaderCell, { width: '18%', textAlign: 'right' }]}>Avg Price</Text>
          <Text style={[s.tableHeaderCell, { width: '12%', textAlign: 'center' }]}>Trend</Text>
          <Text style={[s.tableHeaderCell, { width: '13%' }]}>Share</Text>
        </View>
        {data.services.map((sv, i) => (
          <View key={sv.service_name} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCell, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{sv.service_name}</Text>
            <Text style={[s.tableCellRight, { width: '18%' }]}>{fmt(sv.total_revenue)}</Text>
            <Text style={[s.tableCellCenter, { width: '14%' }]}>{sv.bookings_count}</Text>
            <Text style={[s.tableCellRight, { width: '18%' }]}>{fmt(sv.average_price)}</Text>
            <Text style={[s.tableCellCenter, { width: '12%', color: sv.trend >= 0 ? GREEN : RED }]}>{sv.trend >= 0 ? '+' : ''}{sv.trend}%</Text>
            <Text style={[s.tableCell, { width: '13%' }]}>{data.total_revenue > 0 ? ((sv.total_revenue / data.total_revenue) * 100).toFixed(1) : 0}%</Text>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>Revenue by Service</Text>
      {data.services.map(sv => (
        <BarRow key={sv.service_name} label={sv.service_name} value={sv.total_revenue} maxValue={maxRev} displayValue={fmt(sv.total_revenue)} />
      ))}

      <Text style={s.sectionTitle}>Top Properties for Services</Text>
      {data.top_properties.map(p => (
        <BarRow key={p.property_id} label={`${p.property_name} (${p.bookings})`} value={p.revenue} maxValue={maxPropRev} displayValue={fmt(p.revenue)} />
      ))}

      <Footer />
    </Page>
  );
}

// ══════════════════════════════════════════════════════════
// SERVICE PROVIDER STATEMENT PDF
// ══════════════════════════════════════════════════════════
function ServiceProviderPDF({ data }: { data: ServiceProviderData }) {
  const totalTips = data.jobs.reduce((sum, j) => sum + (j.tip || 0), 0);

  return (
    <Page size="A4" style={s.page}>
      <Header title="Service Provider Statement" periodStart={data.period_start} periodEnd={data.period_end} />

      <View style={[s.summaryBox, { flexDirection: 'row', justifyContent: 'space-between' }]}>
        <View>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: DARK }}>{data.provider_name}</Text>
          <Text style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>{data.service_type}</Text>
          <Text style={{ fontSize: 9, color: MUTED }}>{data.provider_email}</Text>
          {data.provider_phone && <Text style={{ fontSize: 9, color: MUTED }}>{data.provider_phone}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 8, color: MUTED }}>Net Payout</Text>
          <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: GREEN }}>{fmt(data.net_payout)}</Text>
        </View>
      </View>

      <View style={s.kpiRow}>
        <KPICard label="Total Jobs" value={String(data.total_jobs)} />
        <KPICard label="Gross Revenue" value={fmt(data.total_revenue)} />
        <KPICard label={`Commission (${data.commission_rate}%)`} value={fmt(data.commission_amount)} />
        <KPICard label="Tips Earned" value={fmt(totalTips)} />
      </View>

      <Text style={s.sectionTitle}>Job Details</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: '12%' }]}>Date</Text>
          <Text style={[s.tableHeaderCell, { width: '20%' }]}>Property</Text>
          <Text style={[s.tableHeaderCell, { width: '14%' }]}>Guest</Text>
          <Text style={[s.tableHeaderCell, { width: '22%' }]}>Service</Text>
          <Text style={[s.tableHeaderCell, { width: '10%' }]}>Status</Text>
          <Text style={[s.tableHeaderCell, { width: '11%', textAlign: 'right' }]}>Amount</Text>
          <Text style={[s.tableHeaderCell, { width: '11%', textAlign: 'right' }]}>Tip</Text>
        </View>
        {data.jobs.map((job, i) => (
          <View key={job.job_id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCell, { width: '12%' }]}>{fmtShort(job.date)}</Text>
            <Text style={[s.tableCell, { width: '20%' }]}>{job.property_name}</Text>
            <Text style={[s.tableCell, { width: '14%' }]}>{job.guest_name}</Text>
            <Text style={[s.tableCell, { width: '22%' }]}>{job.service_details}</Text>
            <Text style={[s.tableCellCenter, { width: '10%', color: job.status === 'completed' ? GREEN : job.status === 'cancelled' ? RED : MUTED }]}>{job.status}</Text>
            <Text style={[s.tableCellRight, { width: '11%' }]}>{fmt(job.amount)}</Text>
            <Text style={[s.tableCellRight, { width: '11%', color: PURPLE }]}>{job.tip ? fmt(job.tip) : '—'}</Text>
          </View>
        ))}
      </View>

      <View style={s.divider} />
      <View style={s.summaryBox}>
        <View style={s.summaryRow}><Text style={s.summaryLabel}>Gross Revenue</Text><Text style={s.summaryValue}>{fmt(data.total_revenue)}</Text></View>
        <View style={s.summaryRow}><Text style={s.summaryLabel}>Tips</Text><Text style={[s.summaryValue, s.purpleText]}>+{fmt(totalTips)}</Text></View>
        <View style={s.summaryRow}><Text style={s.summaryLabel}>Commission ({data.commission_rate}%)</Text><Text style={[s.summaryValue, s.redText]}>-{fmt(data.commission_amount)}</Text></View>
        <View style={[s.divider, { marginVertical: 6 }]} />
        <View style={s.summaryRow}><Text style={[s.summaryLabel, { fontFamily: 'Helvetica-Bold' }]}>Net Payout</Text><Text style={[s.summaryValue, { fontSize: 14, color: GREEN }]}>{fmt(data.net_payout)}</Text></View>
      </View>

      <Footer />
    </Page>
  );
}

// ══════════════════════════════════════════════════════════
// OCCUPANCY REPORT PDF
// ══════════════════════════════════════════════════════════
function OccupancyPDF({ data }: { data: OccupancyReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <Header title="Occupancy Report" periodStart={data.period_start} periodEnd={data.period_end} />

      <View style={s.kpiRow}>
        <KPICard label="Overall Occupancy" value={`${data.overall_occupancy}%`} />
        <KPICard label="Available Nights" value={String(data.total_available_nights)} />
        <KPICard label="Booked Nights" value={String(data.total_booked_nights)} />
        <KPICard label="Properties" value={String(data.properties.length)} />
      </View>

      <Text style={s.sectionTitle}>Occupancy by Property</Text>
      {data.properties.map(p => (
        <BarRow
          key={p.property_id}
          label={p.property_name}
          value={p.occupancy_rate}
          maxValue={100}
          displayValue={`${p.occupancy_rate}%`}
        />
      ))}

      <Text style={s.sectionTitle}>Property Details</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: '24%' }]}>Property</Text>
          <Text style={[s.tableHeaderCell, { width: '13%', textAlign: 'center' }]}>Occupancy</Text>
          <Text style={[s.tableHeaderCell, { width: '13%', textAlign: 'center' }]}>Available</Text>
          <Text style={[s.tableHeaderCell, { width: '13%', textAlign: 'center' }]}>Booked</Text>
          <Text style={[s.tableHeaderCell, { width: '13%', textAlign: 'center' }]}>Blocked</Text>
          <Text style={[s.tableHeaderCell, { width: '12%', textAlign: 'right' }]}>Revenue</Text>
          <Text style={[s.tableHeaderCell, { width: '12%', textAlign: 'right' }]}>ADR</Text>
        </View>
        {data.properties.map((p, i) => (
          <View key={p.property_id} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCell, { width: '24%' }]}>{p.property_name}</Text>
            <Text style={[s.tableCellCenter, { width: '13%', fontFamily: 'Helvetica-Bold', color: p.occupancy_rate >= 80 ? GREEN : p.occupancy_rate >= 60 ? '#ca8a04' : RED }]}>{p.occupancy_rate}%</Text>
            <Text style={[s.tableCellCenter, { width: '13%' }]}>{p.available_nights}</Text>
            <Text style={[s.tableCellCenter, { width: '13%', color: GREEN }]}>{p.booked_nights}</Text>
            <Text style={[s.tableCellCenter, { width: '13%' }]}>{p.blocked_nights}</Text>
            <Text style={[s.tableCellRight, { width: '12%' }]}>{fmt(p.revenue)}</Text>
            <Text style={[s.tableCellRight, { width: '12%' }]}>{fmt(p.average_daily_rate)}</Text>
          </View>
        ))}
      </View>

      <Footer />
    </Page>
  );
}

// ══════════════════════════════════════════════════════════
// PERFORMANCE COMPARISON PDF
// ══════════════════════════════════════════════════════════
function PerformancePDF({ data }: { data: PerformanceReportData }) {
  return (
    <Page size="A4" style={s.page}>
      <Header title="Performance Comparison" periodStart={data.current_period.start} periodEnd={data.current_period.end} />

      <View style={[s.summaryBox, { flexDirection: 'row', justifyContent: 'space-around' }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 8, color: PRIMARY, fontFamily: 'Helvetica-Bold' }}>CURRENT PERIOD</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 4 }}>{data.current_period.label}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: MUTED }}>vs</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 8, color: MUTED, fontFamily: 'Helvetica-Bold' }}>PREVIOUS PERIOD</Text>
          <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 4 }}>{data.previous_period.label}</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>Key Metrics Comparison</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: '28%' }]}>Metric</Text>
          <Text style={[s.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Current</Text>
          <Text style={[s.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>Previous</Text>
          <Text style={[s.tableHeaderCell, { width: '16%', textAlign: 'right' }]}>Change</Text>
          <Text style={[s.tableHeaderCell, { width: '16%', textAlign: 'center' }]}>Trend</Text>
        </View>
        {data.metrics_comparison.map((m, i) => {
          const isRevenue = m.metric.includes('Revenue') || m.metric.includes('Rate');
          const currentDisplay = isRevenue && !m.metric.includes('Rate') ? fmt(m.current_value) : m.metric.includes('Rate') ? `${m.current_value}%` : String(m.current_value);
          const prevDisplay = isRevenue && !m.metric.includes('Rate') ? fmt(m.previous_value) : m.metric.includes('Rate') ? `${m.previous_value}%` : String(m.previous_value);

          return (
            <View key={m.metric} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tableCell, { width: '28%', fontFamily: 'Helvetica-Bold' }]}>{m.metric}</Text>
              <Text style={[s.tableCellRight, { width: '20%' }]}>{currentDisplay}</Text>
              <Text style={[s.tableCellRight, { width: '20%', color: MUTED }]}>{prevDisplay}</Text>
              <Text style={[s.tableCellRight, { width: '16%', color: m.trend === 'up' ? GREEN : m.trend === 'down' ? RED : MUTED }]}>
                {m.change_percentage >= 0 ? '+' : ''}{m.change_percentage.toFixed(1)}%
              </Text>
              <Text style={[s.tableCellCenter, { width: '16%' }]}>{m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '—'}</Text>
            </View>
          );
        })}
      </View>

      <Text style={s.sectionTitle}>Period Summary</Text>
      <View style={[s.row, { gap: 12 }]}>
        <View style={[s.summaryBox, { flex: 1 }]}>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: PRIMARY, marginBottom: 8 }}>{data.current_period.label}</Text>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Revenue</Text><Text style={s.summaryValue}>{fmt(data.current_period.total_revenue)}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Bookings</Text><Text style={s.summaryValue}>{data.current_period.total_bookings}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>ADR</Text><Text style={s.summaryValue}>{fmt(data.current_period.average_daily_rate)}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Occupancy</Text><Text style={s.summaryValue}>{data.current_period.occupancy_rate}%</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Nights</Text><Text style={s.summaryValue}>{data.current_period.total_nights}</Text></View>
        </View>
        <View style={[s.summaryBox, { flex: 1 }]}>
          <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: MUTED, marginBottom: 8 }}>{data.previous_period.label}</Text>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Revenue</Text><Text style={s.summaryValue}>{fmt(data.previous_period.total_revenue)}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Bookings</Text><Text style={s.summaryValue}>{data.previous_period.total_bookings}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>ADR</Text><Text style={s.summaryValue}>{fmt(data.previous_period.average_daily_rate)}</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Occupancy</Text><Text style={s.summaryValue}>{data.previous_period.occupancy_rate}%</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryLabel}>Nights</Text><Text style={s.summaryValue}>{data.previous_period.total_nights}</Text></View>
        </View>
      </View>

      <Text style={s.sectionTitle}>Revenue Trend</Text>
      <View style={s.table}>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: '34%' }]}>Period</Text>
          <Text style={[s.tableHeaderCell, { width: '33%', textAlign: 'right' }]}>Current</Text>
          <Text style={[s.tableHeaderCell, { width: '33%', textAlign: 'right' }]}>Previous</Text>
        </View>
        {data.revenue_trend.map((rt, i) => (
          <View key={rt.date} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCell, { width: '34%' }]}>{rt.date}</Text>
            <Text style={[s.tableCellRight, { width: '33%', fontFamily: 'Helvetica-Bold' }]}>{fmt(rt.current)}</Text>
            <Text style={[s.tableCellRight, { width: '33%', color: MUTED }]}>{fmt(rt.previous)}</Text>
          </View>
        ))}
      </View>

      <Footer />
    </Page>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN EXPORT — Creates correct PDF for any report type
// ══════════════════════════════════════════════════════════
export type ReportPDFData = {
  type: 'owner-statement'; data: OwnerStatementData;
} | {
  type: 'booking-summary'; data: BookingSummaryData;
} | {
  type: 'service-revenue'; data: ServiceRevenueData;
} | {
  type: 'service-provider'; data: ServiceProviderData;
} | {
  type: 'occupancy'; data: OccupancyReportData;
} | {
  type: 'performance'; data: PerformanceReportData;
};

export function ReportPDFDocument({ report }: { report: ReportPDFData }) {
  return (
    <Document>
      {report.type === 'owner-statement' && <OwnerStatementPDF data={report.data} />}
      {report.type === 'booking-summary' && <BookingSummaryPDF data={report.data} />}
      {report.type === 'service-revenue' && <ServiceRevenuePDF data={report.data} />}
      {report.type === 'service-provider' && <ServiceProviderPDF data={report.data} />}
      {report.type === 'occupancy' && <OccupancyPDF data={report.data} />}
      {report.type === 'performance' && <PerformancePDF data={report.data} />}
    </Document>
  );
}
