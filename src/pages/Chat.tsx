import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SwipeBackEdge from "@/components/SwipeBackEdge";
import { ArrowLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import NabbitLogo from "@/components/NabbitLogo";

interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  display_name?: string;
}

const Chat = () => {
  usePageMeta({ title: "Chat — nabbit.ai", description: "Message the seller or buyer.", path: "/chat" });
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!roomId || !user) return;
    const fetchMessages = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (data) {
        setMessages(data);
        // Fetch profiles for all unique user_ids
        const userIds = [...new Set(data.map((m) => m.user_id))];
        if (userIds.length > 0) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", userIds);
          if (profileData) {
            const map: Record<string, string> = {};
            profileData.forEach((p) => { map[p.id] = p.display_name || "User"; });
            setProfiles(map);
          }
        }
      }
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    };
    fetchMessages();
  }, [roomId, user, scrollToBottom]);

  // Real-time subscription
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`chat-${roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 50);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !roomId || sending) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      user_id: user.id,
      message: newMessage.trim(),
    });
    if (!error) setNewMessage("");
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <NabbitLogo size="sm" />
          <div className="flex-1">
            <h1 className="font-heading font-black text-foreground text-sm">CHAT</h1>
            <p className="text-[10px] text-muted-foreground">Order #{roomId?.slice(0, 8)}</p>
          </div>
          <MessageCircle className="w-4 h-4 text-primary" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.user_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "glass-card border border-border/50 rounded-bl-md"
                    }`}>
                      {!isMe && (
                        <p className="text-[10px] font-bold text-primary mb-0.5">{profiles[msg.user_id] || "User"}</p>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-2xl border-t border-border/50 px-4 py-3 pb-20 sm:pb-3">
        <form onSubmit={handleSend} className="max-w-lg mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary/50 border-border h-11 rounded-xl"
            disabled={sending}
          />
          <Button type="submit" size="icon" className="h-11 w-11 rounded-xl shrink-0 shimmer-btn" disabled={!newMessage.trim() || sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
