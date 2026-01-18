export interface InboxFolder {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  order: number;
}

export interface InboxThread {
  id: string;
  senderName: string;
  senderAvatar?: string;
  subject: string;
  snippet: string;
  folderId: string | null;
  platform: 'gmail' | 'whatsapp' | 'facebook' | 'instagram' | 'sms' | 'airbnb' | 'other';
  isStarred: boolean;
  isRead: boolean;
  timestamp: Date;
  messages: InboxMessage[];
}

export interface InboxMessage {
  id: string;
  from: string;
  content: string;
  html?: string;
  timestamp: Date;
  isOutgoing: boolean;
}
