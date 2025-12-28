import { useEffect, useState, useRef } from 'react';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSheetProps {
  bookingId: string;
  partnerName: string; // The name of the person you are chatting with
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ChatSheet({ bookingId, partnerName, trigger, onOpenChange }: ChatSheetProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookingId) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });
      
      setMessages(data || []);
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `booking_id=eq.${bookingId}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [bookingId]);

  const markAsRead = async () => {
    if (!user) return;
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('booking_id', bookingId)
      .neq('sender_id', user.id);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const text = newMessage;
    setNewMessage(''); 

    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: user.id,
      content: text
    });
  };

  return (
    <Sheet onOpenChange={(open) => {
      if(open) markAsRead();
      if(onOpenChange) onOpenChange(open);
    }}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare size={16} className="mr-2" /> Chat
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Chat with {partnerName}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4 mt-4 border-t border-slate-100 pt-4">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 text-sm mt-10">No messages yet.<br/>Say hello! 👋</div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* SENDER NAME LABEL */}
                    <span className="text-[10px] text-slate-400 mb-1 px-1">
                      {isMe ? 'You' : partnerName}
                    </span>

                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-slate-900 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                      {msg.content}
                      <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSend} className="pt-4 mt-auto border-t border-slate-100 flex gap-2">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1"
          />
          <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700">
            <Send size={18} />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}