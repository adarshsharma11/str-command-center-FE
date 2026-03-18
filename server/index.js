require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = 3001;

// ── Config ──────────────────────────────────────────────
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'team@nikatechsolutions.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'MOMA.HOUSE';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── In-memory store for demo ────────────────────────────
const serviceBookings = new Map();

// ── Utility: Branded HTML email wrapper ─────────────────
function wrapEmail(bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  .container { max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0077b6 0%, #005f8f 100%); padding:32px 40px; text-align:center; }
  .header h1 { color:#ffffff; margin:0; font-size:28px; font-weight:700; letter-spacing:1px; }
  .header p { color:rgba(255,255,255,0.85); margin:6px 0 0; font-size:13px; letter-spacing:0.5px; }
  .body { padding:32px 40px; }
  .footer { background:#f8fafc; padding:20px 40px; text-align:center; border-top:1px solid #e2e8f0; }
  .footer p { color:#94a3b8; font-size:12px; margin:4px 0; }
  .info-table { width:100%; border-collapse:collapse; margin:16px 0; }
  .info-table td { padding:10px 14px; border-bottom:1px solid #f1f5f9; font-size:14px; }
  .info-table td:first-child { color:#64748b; font-weight:500; width:40%; }
  .info-table td:last-child { color:#1e293b; font-weight:600; }
  .btn { display:inline-block; padding:14px 36px; border-radius:8px; font-size:15px; font-weight:600; text-decoration:none; margin:6px; cursor:pointer; }
  .btn-accept { background:#16a34a; color:#ffffff !important; }
  .btn-reject { background:#dc2626; color:#ffffff !important; }
  .btn-primary { background:#0077b6; color:#ffffff !important; }
  .section-title { font-size:16px; font-weight:600; color:#1e293b; margin:24px 0 12px; padding-bottom:8px; border-bottom:2px solid #0077b6; }
  .highlight-box { background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:16px; margin:16px 0; }
  .highlight-box p { margin:4px 0; color:#0369a1; font-size:14px; }
  .status-badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
  .status-pending { background:#fef3c7; color:#92400e; }
  .status-accepted { background:#dcfce7; color:#166534; }
  .status-rejected { background:#fee2e2; color:#991b1b; }
</style>
</head>
<body>
<div style="padding:20px 0;">
<div class="container">
  <div class="header">
    <h1>MOMA.HOUSE</h1>
    <p>Premium Property Management</p>
  </div>
  <div class="body">
    ${bodyHtml}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} MOMA.HOUSE &mdash; Premium Property Management</p>
    <p>Powered by Nika Tech Solutions</p>
  </div>
</div>
</div>
</body>
</html>`;
}

// ══════════════════════════════════════════════════════════
// SERVICE BOOKING ENDPOINTS
// ══════════════════════════════════════════════════════════

// POST /api/v1/service-booking — Create booking & email provider
app.post('/api/v1/service-booking', async (req, res) => {
  try {
    const {
      guest_name, guest_email, guest_phone,
      property_name, property_id,
      check_in_date, check_out_date,
      number_of_guests, total_amount, currency,
      services, // [{ service_name, service_date, time, provider_name, provider_email, price }]
    } = req.body;

    const results = [];

    for (const service of (services || [])) {
      const bookingId = `sb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const booking = {
        id: bookingId,
        status: 'pending',
        guest_name: guest_name || 'Guest',
        guest_email: guest_email || '',
        guest_phone: guest_phone || '',
        property_name: property_name || 'Property',
        property_id,
        check_in_date,
        check_out_date,
        number_of_guests: number_of_guests || 1,
        total_amount: total_amount || 0,
        currency: currency || 'USD',
        service_name: service.service_name || 'Service',
        service_date: service.service_date || '',
        service_time: service.time || '',
        provider_name: service.provider_name || 'Provider',
        provider_email: service.provider_email || '',
        price: service.price || 0,
        created_at: new Date().toISOString(),
        responded_at: null,
      };

      serviceBookings.set(bookingId, booking);

      // Send email to service provider
      if (service.provider_email) {
        const acceptUrl = `${SERVER_URL}/api/v1/service-booking/${bookingId}/respond?action=accept`;
        const rejectUrl = `${SERVER_URL}/api/v1/service-booking/${bookingId}/respond?action=reject`;

        const emailHtml = wrapEmail(`
          <h2 style="color:#1e293b; margin:0 0 8px;">New Service Booking Request</h2>
          <p style="color:#64748b; margin:0 0 20px;">You have a new service booking request from MOMA.HOUSE. Please review the details below and respond.</p>

          <div class="section-title">Service Details</div>
          <table class="info-table">
            <tr><td>Service</td><td>${booking.service_name}</td></tr>
            <tr><td>Date</td><td>${new Date(booking.service_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><td>Time</td><td>${booking.service_time}</td></tr>
            ${booking.price ? `<tr><td>Price</td><td>$${Number(booking.price).toFixed(2)}</td></tr>` : ''}
          </table>

          <div class="section-title">Guest & Property Info</div>
          <table class="info-table">
            <tr><td>Guest Name</td><td>${booking.guest_name}</td></tr>
            <tr><td>Number of Guests</td><td>${booking.number_of_guests}</td></tr>
            <tr><td>Property</td><td>${booking.property_name}</td></tr>
            <tr><td>Stay Dates</td><td>${new Date(booking.check_in_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} – ${new Date(booking.check_out_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</td></tr>
          </table>

          <div style="text-align:center; margin:32px 0 16px;">
            <p style="color:#64748b; margin:0 0 16px; font-size:15px;">Please confirm your availability:</p>
            <a href="${acceptUrl}" class="btn btn-accept">✓ Accept Booking</a>
            <a href="${rejectUrl}" class="btn btn-reject">✕ Decline</a>
          </div>

          <div class="highlight-box">
            <p><strong>Note:</strong> Please respond as soon as possible. The guest will be notified of your decision automatically.</p>
          </div>
        `);

        try {
          await sgMail.send({
            to: service.provider_email,
            from: { email: FROM_EMAIL, name: FROM_NAME },
            subject: `New Service Booking: ${booking.service_name} at ${booking.property_name} — ${new Date(booking.service_date).toLocaleDateString()}`,
            html: emailHtml,
          });
          booking.email_sent = true;
          console.log(`✅ Email sent to provider: ${service.provider_email} for booking ${bookingId}`);
        } catch (emailErr) {
          console.error(`❌ Failed to send email to ${service.provider_email}:`, emailErr?.response?.body || emailErr.message);
          booking.email_sent = false;
          booking.email_error = emailErr?.response?.body?.errors?.[0]?.message || emailErr.message;
        }
      }

      // Send confirmation email to guest
      if (guest_email) {
        const guestEmailHtml = wrapEmail(`
          <h2 style="color:#1e293b; margin:0 0 8px;">Service Booking Confirmation</h2>
          <p style="color:#64748b; margin:0 0 20px;">Hi ${booking.guest_name}, a service has been booked for your stay at ${booking.property_name}.</p>

          <div class="section-title">Booking Details</div>
          <table class="info-table">
            <tr><td>Service</td><td>${booking.service_name}</td></tr>
            <tr><td>Date</td><td>${new Date(booking.service_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><td>Time</td><td>${booking.service_time}</td></tr>
            <tr><td>Property</td><td>${booking.property_name}</td></tr>
            ${booking.price ? `<tr><td>Price</td><td>$${Number(booking.price).toFixed(2)}</td></tr>` : ''}
          </table>

          <div class="highlight-box">
            <p><strong>Status:</strong> <span class="status-badge status-pending">Pending Provider Confirmation</span></p>
            <p>We'll notify you once the service provider confirms your booking.</p>
          </div>

          <p style="color:#64748b; font-size:14px; margin-top:20px;">
            Thank you for choosing our premium services. If you have any questions, please don't hesitate to reach out.
          </p>
        `);

        try {
          await sgMail.send({
            to: guest_email,
            from: { email: FROM_EMAIL, name: FROM_NAME },
            subject: `Service Booked: ${booking.service_name} for your stay at ${booking.property_name}`,
            html: guestEmailHtml,
          });
          console.log(`✅ Guest confirmation sent to: ${guest_email}`);
        } catch (emailErr) {
          console.error(`❌ Failed to send guest email:`, emailErr?.response?.body || emailErr.message);
        }
      }

      results.push(booking);
    }

    res.json({ success: true, data: results, message: `${results.length} service booking(s) created` });
  } catch (err) {
    console.error('Service booking error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/service-booking/:id/respond — Provider accepts/rejects
app.get('/api/v1/service-booking/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { action } = req.query; // 'accept' or 'reject'
  const booking = serviceBookings.get(id);

  if (!booking) {
    return res.send(wrapEmail(`
      <h2 style="color:#dc2626;">Booking Not Found</h2>
      <p>This booking link has expired or is invalid.</p>
    `));
  }

  if (booking.status !== 'pending') {
    return res.send(wrapEmail(`
      <h2 style="color:#64748b;">Already Responded</h2>
      <p>You have already ${booking.status === 'accepted' ? 'accepted' : 'declined'} this booking.</p>
      <table class="info-table">
        <tr><td>Service</td><td>${booking.service_name}</td></tr>
        <tr><td>Date</td><td>${new Date(booking.service_date).toLocaleDateString()}</td></tr>
        <tr><td>Status</td><td><span class="status-badge ${booking.status === 'accepted' ? 'status-accepted' : 'status-rejected'}">${booking.status.toUpperCase()}</span></td></tr>
      </table>
    `));
  }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected';
  booking.status = newStatus;
  booking.responded_at = new Date().toISOString();

  // Notify the guest about the provider's response
  if (booking.guest_email) {
    const isAccepted = newStatus === 'accepted';
    const guestNotifHtml = wrapEmail(`
      <h2 style="color:${isAccepted ? '#16a34a' : '#dc2626'}; margin:0 0 8px;">
        Service ${isAccepted ? 'Confirmed' : 'Declined'}
      </h2>
      <p style="color:#64748b; margin:0 0 20px;">
        ${isAccepted
          ? `Great news, ${booking.guest_name}! Your service has been confirmed.`
          : `Hi ${booking.guest_name}, unfortunately the service provider was unable to accommodate your request.`
        }
      </p>

      <div class="section-title">Service Details</div>
      <table class="info-table">
        <tr><td>Service</td><td>${booking.service_name}</td></tr>
        <tr><td>Provider</td><td>${booking.provider_name}</td></tr>
        <tr><td>Date</td><td>${new Date(booking.service_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
        <tr><td>Time</td><td>${booking.service_time}</td></tr>
        <tr><td>Property</td><td>${booking.property_name}</td></tr>
        <tr><td>Status</td><td><span class="status-badge ${isAccepted ? 'status-accepted' : 'status-rejected'}">${newStatus.toUpperCase()}</span></td></tr>
      </table>

      ${isAccepted ? `
        <div class="highlight-box">
          <p><strong>What's next?</strong> The service provider will arrive at the scheduled time. Enjoy your stay!</p>
        </div>
      ` : `
        <div class="highlight-box">
          <p><strong>Don't worry!</strong> We're looking for an alternative provider for you. We'll be in touch shortly.</p>
        </div>
      `}
    `);

    try {
      await sgMail.send({
        to: booking.guest_email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `Service ${isAccepted ? 'Confirmed' : 'Declined'}: ${booking.service_name} at ${booking.property_name}`,
        html: guestNotifHtml,
      });
      console.log(`✅ Guest notification sent: ${booking.guest_email} — ${newStatus}`);
    } catch (emailErr) {
      console.error('Failed to notify guest:', emailErr?.response?.body || emailErr.message);
    }
  }

  // Show confirmation page to the provider
  const isAccepted = newStatus === 'accepted';
  res.send(wrapEmail(`
    <div style="text-align:center; padding:20px 0;">
      <div style="font-size:64px; margin-bottom:16px;">${isAccepted ? '✅' : '❌'}</div>
      <h2 style="color:${isAccepted ? '#16a34a' : '#dc2626'}; margin:0 0 8px;">
        Booking ${isAccepted ? 'Accepted' : 'Declined'}
      </h2>
      <p style="color:#64748b; margin:0 0 24px;">
        ${isAccepted
          ? 'Thank you! The guest has been notified of your confirmation.'
          : 'The guest has been notified. Thank you for letting us know.'
        }
      </p>
    </div>

    <div class="section-title">Booking Summary</div>
    <table class="info-table">
      <tr><td>Service</td><td>${booking.service_name}</td></tr>
      <tr><td>Date</td><td>${new Date(booking.service_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
      <tr><td>Time</td><td>${booking.service_time}</td></tr>
      <tr><td>Guest</td><td>${booking.guest_name}</td></tr>
      <tr><td>Property</td><td>${booking.property_name}</td></tr>
    </table>

    <p style="text-align:center; color:#94a3b8; font-size:13px; margin-top:24px;">
      You can close this page now.
    </p>
  `));
});

// GET /api/v1/service-bookings — List all bookings (for testing page polling)
app.get('/api/v1/service-bookings', (req, res) => {
  const all = Array.from(serviceBookings.values()).sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  res.json({ success: true, data: all });
});

// GET /api/v1/service-booking/:id — Get single booking status
app.get('/api/v1/service-booking/:id', (req, res) => {
  const booking = serviceBookings.get(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: booking });
});

// ══════════════════════════════════════════════════════════
// REPORT EMAIL ENDPOINT
// ══════════════════════════════════════════════════════════

app.post('/api/v1/reports/send-email', async (req, res) => {
  try {
    const { report_type, filters, recipients, subject, message, attach_pdf, pdf_base64 } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients provided' });
    }

    const reportTitles = {
      'owner-statement': 'Owner Statement',
      'booking-summary': 'Booking Summary',
      'service-revenue': 'Service Revenue Report',
      'service-provider': 'Service Provider Statement',
      'occupancy': 'Occupancy Report',
      'performance': 'Performance Comparison',
    };

    const reportTitle = reportTitles[report_type] || 'Report';
    const dateRange = filters?.from && filters?.to
      ? `${new Date(filters.from).toLocaleDateString()} – ${new Date(filters.to).toLocaleDateString()}`
      : 'All dates';

    const emailHtml = wrapEmail(`
      <h2 style="color:#1e293b; margin:0 0 8px;">${reportTitle}</h2>
      <p style="color:#64748b; margin:0 0 20px;">Period: ${dateRange}</p>

      ${message ? `
        <div class="highlight-box">
          <p style="color:#1e293b;"><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      ` : ''}

      ${attach_pdf && pdf_base64 ? `
        <p style="color:#64748b; font-size:14px;">📎 The full report is attached as a PDF.</p>
      ` : `
        <p style="color:#64748b; font-size:14px;">Please log in to the MOMA.HOUSE platform to view the full report.</p>
      `}

      <div style="text-align:center; margin:24px 0;">
        <a href="#" class="btn btn-primary">View on Platform</a>
      </div>
    `);

    const msg = {
      to: recipients,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: subject || `${reportTitle} — ${dateRange}`,
      html: emailHtml,
    };

    // Attach PDF if provided
    if (attach_pdf && pdf_base64) {
      msg.attachments = [{
        content: pdf_base64,
        filename: `${report_type}-report.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      }];
    }

    await sgMail.send(msg);
    console.log(`✅ Report email sent to: ${recipients.join(', ')}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    console.error('Report email error:', err?.response?.body || err.message);
    res.status(500).json({ success: false, message: err?.response?.body?.errors?.[0]?.message || err.message });
  }
});

// ── Health check ────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), bookings: serviceBookings.size });
});

// ── Start server ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏠 MOMA.HOUSE Server running on http://localhost:${PORT}`);
  console.log(`📧 SendGrid from: ${FROM_EMAIL}`);
  console.log(`🔗 Accept/Reject links: ${SERVER_URL}/api/v1/service-booking/:id/respond\n`);
});
