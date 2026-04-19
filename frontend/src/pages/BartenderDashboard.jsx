import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API, WEB_URL } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { 
  Wine, MapPin, Clock, Users, QrCode, DollarSign, 
  ExternalLink, Copy, Plus, Settings, UserPlus, Loader2, Sparkles, Calendar, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const BartenderDashboard = () => {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [stats, setStats] = useState({ followers: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [followingUsers, setFollowingUsers] = useState({});
  const [invites, setInvites] = useState([]);

  const profileUrl = `${WEB_URL}/b/${user?.username}`;

  // Helper functions to construct payment URLs from usernames
  const getVenmoUrl = (username) => {
    if (!username) return null;
    const cleanUsername = username.replace('@', '');
    return `https://venmo.com/u/${cleanUsername}`;
  };

  const getCashAppUrl = (username) => {
    if (!username) return null;
    const cleanUsername = username.replace('$', '');
    return `https://cash.app/$${cleanUsername}`;
  };

  const getPayPalUrl = (username) => {
    if (!username) return null;
    return `https://paypal.me/${username}`;
  };

  useEffect(() => {
    fetchStats();
    fetchSuggestions();
    fetchInvites();
  }, []);

  const fetchStats = async () => {
    try {
      const followersRes = await axios.get(`${API}/followers`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setStats({ followers: followersRes.data.length });
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  };

  const fetchInvites = async () => {
    try {
      const invitesRes = await axios.get(`${API}/invites`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setInvites(invitesRes.data.slice(0, 3));
    } catch (e) {
      console.error("Error fetching invites:", e);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data);
    } catch (e) {
      console.error("Error fetching suggestions:", e);
    }
  };

  const handleFollow = async (targetUser) => {
    setFollowingUsers(prev => ({ ...prev, [targetUser.id]: true }));
    try {
      const response = await axios.post(`${API}/follow/${targetUser.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === "pending") {
        toast.success("Follow request sent!");
        setSuggestions(prev => prev.map(s => 
          s.id === targetUser.id ? { ...s, is_pending: true } : s
        ));
      } else {
        toast.success(`Now following ${targetUser.name}!`);
        setSuggestions(prev => prev.filter(s => s.id !== targetUser.id));
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to follow");
    } finally {
      setFollowingUsers(prev => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied!");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const getProfileUrl = (targetUser) => {
    return targetUser.role === "bartender" ? `/b/${targetUser.username}` : `/u/${targetUser.username}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background overflow-y-auto" data-testid="bartender-dashboard">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wine className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-white">PourCircle</span>
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

      <main className="px-6 space-y-6 pb-24">
        {/* Profile Card */}
        <div className="glass-card p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border-2 border-primary">
              <AvatarImage src={getImageUrl(user.profile_image)} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                {user.name}
              </h1>
              <p className="text-white/60">@{user.username}</p>
              {user.bio && <p className="text-white/80 mt-2 text-sm">{user.bio}</p>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => setShowQR(!showQR)}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/5"
              data-testid="qr-toggle-btn"
            >
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <Button 
              onClick={copyProfileLink}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/5"
              data-testid="copy-link-btn"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="mt-6 flex justify-center animate-fade-in">
              <div className="qr-container">
                <QRCodeSVG 
                  value={profileUrl} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate("/followers")}
            className="glass-card-hover p-6 text-left"
            data-testid="followers-card"
          >
            <Users className="w-8 h-8 text-primary mb-3" />
            <p className="text-3xl font-bold text-white">{stats.followers}</p>
            <p className="text-white/60 text-sm">Followers</p>
          </button>
          <button 
            onClick={() => navigate("/invites")}
            className="glass-card-hover p-6 text-left"
            data-testid="invites-btn"
          >
            <Calendar className="w-8 h-8 text-secondary mb-3" />
            <p className="text-white font-medium">Invites</p>
            <p className="text-white/50 text-sm">Plan meetups</p>
          </button>
        </div>

        {/* Upcoming Invites */}
        {invites.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Upcoming Invites
              </h2>
              <button 
                onClick={() => navigate("/invites")}
                className="text-primary text-sm flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{invite.location_name}</p>
                      <p className="text-white/60 text-sm">{invite.datetime_str}</p>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {invite.creator_id === user.id ? "YOUR INVITE" : "INVITED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Links */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Tip Links
          </h2>
          <div className="space-y-3">
            {user.venmo_link ? (
              <a 
                href={getVenmoUrl(user.venmo_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-white">Venmo</span>
                <ExternalLink className="w-4 h-4 text-white/60" />
              </a>
            ) : null}
            {user.cashapp_link ? (
              <a 
                href={getCashAppUrl(user.cashapp_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-white">Cash App</span>
                <ExternalLink className="w-4 h-4 text-white/60" />
              </a>
            ) : null}
            {user.paypal_link ? (
              <a 
                href={getPayPalUrl(user.paypal_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-white">PayPal</span>
                <ExternalLink className="w-4 h-4 text-white/60" />
              </a>
            ) : null}
            {!user.venmo_link && !user.cashapp_link && !user.paypal_link && (
              <Button 
                onClick={() => navigate("/edit-profile")}
                variant="outline"
                className="w-full border-primary/50 text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Links
              </Button>
            )}
          </div>
        </div>

        {/* People You May Know */}
        {suggestions.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                People You May Know
              </h2>
            </div>
            <div className="space-y-3">
              {suggestions.slice(0, 4).map((suggestedUser) => (
                <div
                  key={suggestedUser.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <button
                    onClick={() => navigate(getProfileUrl(suggestedUser))}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <Avatar className="w-10 h-10 border border-white/10">
                      <AvatarImage src={getImageUrl(suggestedUser.profile_image)} />
                      <AvatarFallback className="bg-secondary/20 text-secondary text-sm">
                        {getInitials(suggestedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate text-sm">{suggestedUser.name}</p>
                      <p className="text-white/60 text-xs">
                        {suggestedUser.role === 'bartender' ? 'Bartender' : 'Bar-Goer'}
                        {suggestedUser.mutual_count > 0 && ` · ${suggestedUser.mutual_count} mutual`}
                      </p>
                    </div>
                  </button>
                  <Button
                    onClick={() => handleFollow(suggestedUser)}
                    disabled={followingUsers[suggestedUser.id] || suggestedUser.is_pending}
                    size="sm"
                    className={suggestedUser.is_pending 
                      ? "bg-white/10 text-white/60 border border-white/20 text-xs px-2" 
                      : "btn-primary text-xs px-2"
                    }
                    data-testid={`follow-suggestion-${suggestedUser.id}`}
                  >
                    {followingUsers[suggestedUser.id] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : suggestedUser.is_pending ? (
                      "Requested"
                    ) : (
                      <><UserPlus className="w-3 h-3 mr-1" /> Follow</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Locations */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Work Locations
          </h2>
          {user.work_locations && user.work_locations.length > 0 ? (
            <div className="space-y-4">
              {user.work_locations.map((loc, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h3 className="text-white font-medium">{loc.name}</h3>
                  <p className="text-white/60 text-sm mt-1">{loc.address}</p>
                  {loc.schedule && loc.schedule.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-white/60 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{loc.schedule.length} shifts scheduled</span>
                    </div>
                  )}
                  {loc.happy_hours && loc.happy_hours.length > 0 && (
                    <span className="inline-block mt-2 px-2 py-1 bg-secondary/20 text-secondary text-xs rounded font-accent">
                      Happy Hour
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-white/40 mb-4">No work locations added</p>
              <Button 
                onClick={() => navigate("/edit-profile")}
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default BartenderDashboard;
