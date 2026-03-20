import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ConversationPage = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [partnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const [messagesRes, partnerRes] = await Promise.all([
        axios.get(`${API}/messages/${partnerId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/bartenders`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setMessages(messagesRes.data);
      
      // Find partner from bartenders or fetch separately
      const found = partnerRes.data.find(b => b.id === partnerId);
      if (found) {
        setPartner(found);
      } else {
        // Try to get from conversations
        const convRes = await axios.get(`${API}/messages/conversations`, { headers: { Authorization: `Bearer ${token}` } });
        const conv = convRes.data.find(c => c.partner_id === partnerId);
        if (conv) setPartner(conv.partner);
      }
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await axios.post(`${API}/messages`, {
        recipient_id: partnerId,
        content: newMessage.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setNewMessage("");
      fetchConversation();
    } catch (e) {
      console.error("Error sending:", e);
    } finally {
      setSending(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col" data-testid="conversation-page">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/messages")}
          className="text-white/60 hover:text-white"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        {partner && (
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => partner.role === "bartender" && navigate(`/b/${partner.username}`)}
          >
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={getImageUrl(partner.profile_image)} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {getInitials(partner.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium">{partner.name}</p>
              <p className="text-white/60 text-xs">@{partner.username}</p>
            </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  msg.sender_id === user.id
                    ? "bg-primary text-black rounded-br-md"
                    : "bg-white/10 text-white rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user.id ? "text-black/60" : "text-white/40"}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-white/40">
            Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-background">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-dark flex-1"
            data-testid="message-input"
          />
          <Button 
            type="submit" 
            disabled={sending || !newMessage.trim()}
            className="btn-primary px-4"
            data-testid="send-btn"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ConversationPage;
