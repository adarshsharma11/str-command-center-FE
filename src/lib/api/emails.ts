import { useQuery, useMutation, type QueryOptions, type MutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { InboxMessage, InboxThread } from '@/components/inbox/types';

type EmailItem = {
  email_id: string | number;
  subject?: string;
  sender?: string;
  date?: string;
  body_text?: string;
  body_html?: string;
  platform?: string;
  folder?: string;
};

type InboxResponse = {
  success?: boolean;
  data?: {
    emails?: EmailItem[];
    page?: number;
    limit?: number;
    total?: number;
  };
} | EmailItem[];

type EmailDetailResponse = {
  success?: boolean;
  data?: EmailItem;
} | EmailItem;

type ReplyPayload = {
  content: string;
};

type ReplyResponse = {
  success?: boolean;
  message?: string;
};

function sanitizeHtml(html?: string): string {
  if (!html) return '';
  let clean = html;
  clean = clean.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/on\w+="[^"]*"/gi, '');
  clean = clean.replace(/javascript:[^"']*/gi, '');
  clean = clean.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
  return clean;
}

function stripHtml(html?: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function mapPlatform(p?: string, subject?: string, sender?: string): InboxThread['platform'] {
  const x = (p || '').toLowerCase();
  if (x === 'gmail' || x === 'email') return 'gmail';
  if (x === 'whatsapp') return 'whatsapp';
  if (x === 'facebook') return 'facebook';
  if (x === 'instagram') return 'instagram';
  if (x === 'sms') return 'sms';
  if (x === 'airbnb') return 'airbnb';
  if (x === 'booking' || x === 'booking.com') return 'booking';
  
  // Infer from subject or sender if platform is not explicit
  const text = ((subject || '') + ' ' + (sender || '')).toLowerCase();
  if (text.includes('airbnb')) return 'airbnb';
  if (text.includes('booking.com') || text.includes('booking confirmation')) return 'booking';
  if (text.includes('vrbo')) return 'vrbo';
  
  return 'other';
}

function parseSender(sender?: string): { name: string; email?: string } {
  if (!sender) return { name: '—' };
  const match = sender.match(/^(.*?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ''), email: match[2].trim() };
  }
  return { name: sender.trim() };
}

function toThread(item: EmailItem): InboxThread {
  const snippet = item.body_text || stripHtml(item.body_html) || '';
  const { name: senderName } = parseSender(item.sender);
  
  // Create initial message from email body
  const initialMessage: InboxMessage = {
    id: String(item.email_id) + '-main',
    from: senderName,
    content: item.body_text || stripHtml(item.body_html) || '',
    html: item.body_html || undefined,
    timestamp: item.date ? new Date(item.date) : new Date(),
    isOutgoing: false, // Assuming incoming emails are not outgoing by default
  };

  const mailboxFolder = (item.folder || '').toUpperCase() === 'SENT' ? 'SENT' : 'INBOX';

  return {
    id: String(item.email_id),
    senderName,
    senderAvatar: undefined,
    subject: item.subject || '—',
    snippet: snippet.slice(0, 180),
    folderId: null,
    platform: mapPlatform(item.platform, item.subject, item.sender),
    isStarred: false,
    isRead: false,
    timestamp: item.date ? new Date(item.date) : new Date(),
    mailboxFolder,
    messages: [initialMessage],
  };
}

function toMessageFromDetail(item: EmailItem): InboxMessage[] {
  const html = sanitizeHtml(item.body_html);
  const content = item.body_text || stripHtml(html) || '';
  return [
    {
      id: String(item.email_id),
      from: item.sender || '—',
      content,
      html: html || undefined,
      timestamp: item.date ? new Date(item.date) : new Date(),
      isOutgoing: false,
    },
  ];
}

async function fetchInbox(): Promise<InboxResponse> {
  return apiClient.get<InboxResponse>(ENDPOINTS.EMAILS.INBOX);
}

async function fetchEmail(emailId: string, folder?: 'INBOX' | 'SENT'): Promise<EmailDetailResponse> {
  let endpoint = ENDPOINTS.EMAILS.DETAIL.replace(':id', emailId);
  if (folder) {
    const qs = new URLSearchParams({ folder }).toString();
    endpoint = `${endpoint}?${qs}`;
  }
  return apiClient.get<EmailDetailResponse>(endpoint);
}

async function replyToEmail(emailId: string, payload: ReplyPayload): Promise<ReplyResponse> {
  const base = ENDPOINTS.EMAILS.REPLY.replace(':id', emailId);
  const qs = new URLSearchParams({ body_text: payload.content }).toString();
  const endpoint = `${base}?${qs}`;
  return apiClient.post<ReplyResponse>(endpoint);
}

export type InboxFilters = {
  folder?: 'INBOX' | 'SENT' | 'BOTH';
  q?: string;
  platform?: 'airbnb' | 'vrbo' | 'booking' | 'plumguide';
  since_days?: number;
  limit?: number;
  only_booking?: boolean;
};

async function fetchInboxWithFilters(filters?: InboxFilters): Promise<InboxResponse> {
  const isSentFolder = filters?.folder === 'SENT';
  const base = isSentFolder ? ENDPOINTS.EMAILS.SENT : ENDPOINTS.EMAILS.INBOX;
  const params = new URLSearchParams();
  
  // Only add 'folder' param if NOT using the dedicated SENT endpoint
  if (filters?.folder && !isSentFolder) params.set('folder', filters.folder);
  
  if (filters?.q) params.set('q', filters.q);
  if (filters?.platform) params.set('platform', filters.platform);
  if (typeof filters?.since_days === 'number') params.set('since_days', String(filters.since_days));
  if (typeof filters?.limit === 'number') params.set('limit', String(filters.limit));
  // if (typeof filters?.only_booking === 'boolean') params.set('only_booking', String(filters.only_booking));
  
  const endpoint = params.toString() ? `${base}?${params.toString()}` : base;
  return apiClient.get<InboxResponse>(endpoint);
}

export function useInboxQuery(filters?: InboxFilters, options?: QueryOptions<InboxResponse>) {
  return useQuery<InboxResponse>({
    queryKey: ['emails', 'inbox', filters],
    queryFn: () => fetchInboxWithFilters(filters),
    staleTime: 30_000,
    ...options,
  });
}

export function useEmailQuery(
  emailId: string | null,
  folder?: 'INBOX' | 'SENT' | 'BOTH',
  options?: QueryOptions<EmailDetailResponse>
) {
  return useQuery<EmailDetailResponse>({
    queryKey: ['emails', 'detail', emailId, folder],
    queryFn: () => fetchEmail(String(emailId), folder === 'SENT' ? 'SENT' : 'INBOX'),
    enabled: Boolean(emailId),
    staleTime: 30_000,
    ...options,
  });
}

export function useReplyMutation(options?: MutationOptions<ReplyResponse, Error, { emailId: string; content: string }>) {
  return useMutation<ReplyResponse, Error, { emailId: string; content: string }>({
    mutationKey: ['emails', 'reply'],
    mutationFn: ({ emailId, content }) => replyToEmail(emailId, { content }),
    retry: 1,
    ...options,
  });
}

export function mapInboxThreads(resp: InboxResponse): InboxThread[] {
  const list = Array.isArray(resp) ? resp : resp?.data?.emails || [];
  return list.map(toThread);
}

export function mapEmailMessages(resp: EmailDetailResponse): InboxMessage[] {
  const isWrapped = (r: EmailDetailResponse): r is { success?: boolean; data?: EmailItem } =>
    typeof r === 'object' && r !== null && 'data' in r && !Array.isArray(r);
  const item: EmailItem | undefined = isWrapped(resp) ? resp.data : (Array.isArray(resp) ? resp[0] : resp as EmailItem);
  if (!item) return [];
  return toMessageFromDetail(item);
}
