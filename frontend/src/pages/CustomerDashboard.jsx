import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API, WEB_URL } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { 
  Wine, Search, Calendar, Users, MapPin, Settings, UserPlus, Loader2, Sparkles, QrCode, Share2, Copy, Eye
} from "lucide-react";
import { toast } from "sonner";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [following, setFollowing] = useState([]);
  const [invites, setInvites] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState({});
  const [showQR, setShowQR] = useState(false);

  const profileUrl = `${WEB_URL}/u/${user?.username}`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [followingRes, invitesRes, suggestionsRes] = await Promise.all([
        axios.get(`${API}/following`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/invites`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/suggestions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFollowing(followingRes.data);
      setInvites(invitesRes.data.slice(0, 3));
      setSuggestions(suggestionsRes.data);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
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
        // Update suggestions to show pending state
        setSuggestions(prev => prev.map(s => 
          s.id === targetUser.id ? { ...s, is_pending: true } : s
        ));
      } else {
        toast.success(`Now following ${targetUser.name}!`);
        // Remove from suggestions and add to following
        setSuggestions(prev => prev.filter(s => s.id !== targetUser.id));
        setFollowing(prev => [...prev, targetUser]);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to follow");
    } finally {
      setFollowingUsers(prev => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const getProfileUrl = (user) => {
    return user.role === "bartender" ? `/b/${user.username}` : `/u/${user.username}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-safe" data-testid="customer-dashboard">
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
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => navigate(`/u/${user.username}`)}
            className="glass-card-hover p-4 text-left"
            data-testid="view-profile-btn"
          >
            <Eye className="w-6 h-6 text-primary mb-2" />
            <p className="text-white font-medium text-sm">View Profile</p>
          </button>
          <button 
            onClick={() => navigate("/invites")}
            className="glass-card-hover p-4 text-left"
            data-testid="invites-btn"
          >
            <Calendar className="w-6 h-6 text-secondary mb-2" />
            <p className="text-white font-medium text-sm">Invites</p>
          </button>
          <button 
            onClick={() => setShowQR(!showQR)}
            className="glass-card-hover p-4 text-left"
            data-testid="qr-btn"
          >
            <QrCode className="w-6 h-6 text-white/70 mb-2" />
            <p className="text-white font-medium text-sm">QR Code</p>
          </button>
        </div>

        {/* QR Code Section */}
        {showQR && (
          <div className="glass-card p-6 animate-fade-in">
            <div className="flex flex-col items-center">
              <div className="qr-container mb-4">
                <QRCodeSVG value={profileUrl} size={160} level="H" />
              </div>
              <p className="text-white/60 text-sm text-center mb-4">
                Scan to view my profile
              </p>
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(profileUrl);
                    toast.success("Link copied!");
                  }}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/5"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={async () => {
                    if (navigator.share) {
                      await navigator.share({ title: `${user.name} on PourCircle`, url: profileUrl });
                    } else {
                      navigator.clipboard.writeText(profileUrl);
                      toast.success("Link copied!");
                    }
                  }}
                  className="flex-1 btn-primary"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Following */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Following
            </h2>
            <span className="text-white/60 text-sm">{following.length} people</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : following.length > 0 ? (
            <div className="space-y-3">
              {following.slice(0, 5).map((followedUser) => (
                <button
                  key={followedUser.id}
                  onClick={() => navigate(getProfileUrl(followedUser))}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                  data-testid={`following-${followedUser.username}`}
                >
                  <Avatar className="w-12 h-12 border border-white/10">
                    <AvatarImage src={getImageUrl(followedUser.profile_image)} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(followedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{followedUser.name}</p>
                    <p className="text-white/60 text-sm">@{followedUser.username}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    followedUser.role === 'bartender' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/20 text-secondary'
                  }`}>
                    {followedUser.role === 'bartender' ? 'Bartender' : 'Bar-Goer'}
                  </span>
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
              <p className="text-white/40 mb-4">Not following anyone yet</p>
              <Button 
                onClick={() => navigate("/discover")}
                className="btn-primary btn-press"
              >
                <Search className="w-4 h-4 mr-2" />
                Discover People
              </Button>
            </div>
          )}
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
              {suggestions.slice(0, 5).map((suggestedUser) => (
                <div
                  key={suggestedUser.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <button
                    onClick={() => navigate(getProfileUrl(suggestedUser))}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <Avatar className="w-12 h-12 border border-white/10">
                      <AvatarImage src={getImageUrl(suggestedUser.profile_image)} />
                      <AvatarFallback className="bg-secondary/20 text-secondary">
                        {getInitials(suggestedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{suggestedUser.name}</p>
                      <p className="text-white/60 text-sm">@{suggestedUser.username}</p>
                      {suggestedUser.mutual_count > 0 && (
                        <p className="text-white/40 text-xs">
                          {suggestedUser.mutual_count} mutual connection{suggestedUser.mutual_count > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </button>
                  <Button
                    onClick={() => handleFollow(suggestedUser)}
                    disabled={followingUsers[suggestedUser.id] || suggestedUser.is_pending}
                    size="sm"
                    className={suggestedUser.is_pending 
                      ? "bg-white/10 text-white/60 border border-white/20" 
                      : "btn-primary"
                    }
                    data-testid={`follow-suggestion-${suggestedUser.id}`}
                  >
                    {followingUsers[suggestedUser.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : suggestedUser.is_pending ? (
                      "Requested"
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-1" /> Follow</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

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
