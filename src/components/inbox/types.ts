export interface InboxLabel {
  id: string;
  name: string;
  color: string;
}

export interface InboxThread {
  id: string;
  senderName: string;
  senderAvatar?: string;
  subject: string;
  snippet: string;
  labels: string[];
  isStarred: boolean;
  isRead: boolean;
  timestamp: Date;
  messages: InboxMessage[];
}

export interface InboxMessage {
  id: string;
  from: string;
  content: string;
  timestamp: Date;
  isOutgoing: boolean;
}

export type InboxViewType = 'gmail' | 'outlook';
