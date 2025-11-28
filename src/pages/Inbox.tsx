import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Sparkles } from 'lucide-react';
import { mockConversations, mockBookings } from '@/lib/mockData';

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'guest' | 'vendor'>('guest');

  // TODO: INTEGRATION STUB: Replace with Supabase query
  const conversations = mockConversations;
  const selectedBooking = selectedConversation
    ? mockBookings.find(b => b.id === conversations.find(c => c.id === selectedConversation)?.bookingId)
    : null;

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen md:flex-row">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-80 bg-card border-r border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Inbox</h2>
            <Tabs value={messageType} onValueChange={(v) => setMessageType(v as 'guest' | 'vendor')}>
              <TabsList className="w-full mt-2">
                <TabsTrigger value="guest" className="flex-1">Guests</TabsTrigger>
                <TabsTrigger value="vendor" className="flex-1">Vendors</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                  selectedConversation === conv.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedConversation(conv.id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-foreground">{conv.guestName}</h3>
                  {conv.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {conv.platform}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {conv.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread and Guest Insights */}
        <div className="flex-1 flex flex-col md:flex-row">
          {selectedConversation ? (
            <>
              {/* Message Thread */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-border bg-card">
                  <h2 className="font-semibold text-foreground">
                    {conversations.find(c => c.id === selectedConversation)?.guestName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {conversations.find(c => c.id === selectedConversation)?.platform}
                  </p>
                </div>

                <div className="flex-1 p-4 overflow-y-auto bg-background">
                  <p className="text-sm text-muted-foreground text-center">
                    Message thread will display here
                  </p>
                </div>

                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2 mb-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Smart Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      Template
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      className="resize-none"
                      rows={3}
                    />
                    <Button size="icon" className="shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Guest Insights Panel */}
              <div className="w-full md:w-80 bg-card border-l border-border p-4 overflow-y-auto">
                <h3 className="font-semibold text-foreground mb-4">Guest Insights</h3>
                {selectedBooking && (
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Property</p>
                          <p className="text-sm font-medium">{selectedBooking.propertyName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Check-in</p>
                          <p className="text-sm font-medium">{selectedBooking.checkIn.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Check-out</p>
                          <p className="text-sm font-medium">{selectedBooking.checkOut.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Guests</p>
                          <p className="text-sm font-medium">{selectedBooking.guests}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contact</p>
                          <p className="text-sm font-medium">{selectedBooking.guestEmail}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-xs text-muted-foreground mb-2">AI Summary</p>
                        <p className="text-sm text-muted-foreground italic">
                          First-time guest. Traveling with family. Requested early check-in.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background">
              <p className="text-muted-foreground">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
