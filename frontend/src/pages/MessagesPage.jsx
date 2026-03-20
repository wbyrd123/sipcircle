import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { formatDistanceToNow } from "date-fns";

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
    } catch (e) {
      console.error("Error fetching conversations:", e);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-background pb-safe" data-testid="messages-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-white/60 hover:text-white"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-white">Messages</h1>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.partner_id}
                onClick={() => navigate(`/messages/${conv.partner_id}`)}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                data-testid={`conversation-${conv.partner_id}`}
              >
                <div className="relative">
                  <Avatar className="w-14 h-14 border border-white/10">
                    <AvatarImage src={getImageUrl(conv.partner?.profile_image)} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(conv.partner?.name)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-secondary text-white text-xs rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium truncate">{conv.partner?.name}</p>
                    <span className="text-white/40 text-xs">{formatTime(conv.last_message?.created_at)}</span>
                  </div>
                  <p className="text-white/60 text-sm truncate mt-1">
                    {conv.last_message?.sender_id === user.id ? "You: " : ""}
                    {conv.last_message?.content}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">No messages yet</p>
            <p className="text-white/40 text-sm">Start a conversation by visiting a bartender's profile</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default MessagesPage;
