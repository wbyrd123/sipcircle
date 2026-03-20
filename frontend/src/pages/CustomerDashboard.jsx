import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { 
  Wine, Search, MessageCircle, Calendar, Users, MapPin, Clock, Settings
} from "lucide-react";
import { toast } from "sonner";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [following, setFollowing] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [followingRes, invitesRes] = await Promise.all([
        axios.get(`${API}/following`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/invites`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFollowing(followingRes.data);
      setInvites(invitesRes.data.slice(0, 3)); // Latest 3
    } catch (e) {
      console.error("Error fetching data:", e);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-safe" data-testid="customer-dashboard">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wine className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-white">PourPal</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/edit-profile")}
          className="text-white/60 hover:text-white"
          data-testid="settings-btn"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      <main className="px-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Hey, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-white/60 mt-1">Find your favorite bartenders</p>
        </div>

        {/* Search Bar */}
        <button 
          onClick={() => navigate("/discover")}
          className="w-full glass-card p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-colors"
          data-testid="search-btn"
        >
          <Search className="w-5 h-5 text-white/40" />
          <span className="text-white/40">Search bartenders...</span>
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate("/messages")}
            className="glass-card-hover p-5 text-left"
            data-testid="messages-btn"
          >
            <MessageCircle className="w-7 h-7 text-primary mb-2" />
            <p className="text-white font-medium">Messages</p>
          </button>
          <button 
            onClick={() => navigate("/invites")}
            className="glass-card-hover p-5 text-left"
            data-testid="invites-btn"
          >
            <Calendar className="w-7 h-7 text-primary mb-2" />
            <p className="text-white font-medium">Invites</p>
          </button>
        </div>

        {/* Following */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Following
            </h2>
            <span className="text-white/60 text-sm">{following.length} bartenders</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : following.length > 0 ? (
            <div className="space-y-3">
              {following.slice(0, 5).map((bartender) => (
                <button
                  key={bartender.id}
                  onClick={() => navigate(`/b/${bartender.username}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                  data-testid={`following-${bartender.username}`}
                >
                  <Avatar className="w-12 h-12 border border-white/10">
                    <AvatarImage src={getImageUrl(bartender.profile_image)} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(bartender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{bartender.name}</p>
                    <p className="text-white/60 text-sm">@{bartender.username}</p>
                  </div>
                  {bartender.work_locations?.[0] && (
                    <div className="flex items-center gap-1 text-white/40 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{bartender.work_locations[0].name}</span>
                    </div>
                  )}
                </button>
              ))}
              {following.length > 5 && (
                <Button 
                  onClick={() => navigate("/discover")}
                  variant="ghost"
                  className="w-full text-primary hover:text-primary/80"
                >
                  View all ({following.length})
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 mb-4">Not following any bartenders yet</p>
              <Button 
                onClick={() => navigate("/discover")}
                className="btn-primary btn-press"
              >
                <Search className="w-4 h-4 mr-2" />
                Discover Bartenders
              </Button>
            </div>
          )}
        </div>

        {/* Upcoming Invites */}
        {invites.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming
              </h2>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/invites")}
                className="text-primary text-sm hover:text-primary/80"
              >
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{invite.location_name}</p>
                      <p className="text-white/60 text-sm">{invite.datetime_str}</p>
                    </div>
                    <span className="font-accent text-xs text-primary">
                      {invite.creator_id === user.id ? "YOUR INVITE" : "INVITED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default CustomerDashboard;
