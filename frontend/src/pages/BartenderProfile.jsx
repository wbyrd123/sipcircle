import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, API, WEB_URL } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  Wine, MapPin, Clock, Users, QrCode, DollarSign, 
  ExternalLink, ArrowLeft, UserPlus, UserMinus, Share2, GlassWater, Loader2
} from "lucide-react";
import { toast } from "sonner";

const BartenderProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [bartender, setBartender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'followers' or 'following'
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  const profileUrl = `${WEB_URL}/b/${username}`;

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
    fetchBartender();
  }, [username]);

  const fetchBartender = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/bartender/${username}`, { headers });
      setBartender(response.data);
    } catch (e) {
      if (e.response?.status === 403) {
        toast.error("You are blocked by this bartender");
      } else if (e.response?.status === 404) {
        toast.error("Bartender not found");
      }
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    if (activeTab === tab) {
      setActiveTab(null);
      return;
    }
    setTabLoading(true);
    setActiveTab(tab);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/user/${username}/${tab}`, { headers });
      if (tab === 'followers') {
        setFollowersList(response.data);
      } else {
        setFollowingList(response.data);
      }
    } catch (e) {
      toast.error(`Failed to load ${tab}`);
    } finally {
      setTabLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setFollowLoading(true);
    try {
      if (bartender.is_following) {
        // Unfollow
        await axios.delete(`${API}/follow/${bartender.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setBartender({ ...bartender, is_following: false, is_pending: false, follower_count: bartender.follower_count - 1 });
        toast.success("Unfollowed");
      } else if (bartender.is_pending) {
        // Cancel pending request (unfollow endpoint handles this)
        await axios.delete(`${API}/follow/${bartender.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setBartender({ ...bartender, is_pending: false });
        toast.success("Request cancelled");
      } else {
        // Follow or request to follow
        const response = await axios.post(`${API}/follow/${bartender.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status === "pending") {
          setBartender({ ...bartender, is_pending: true });
          toast.success("Follow request sent!");
        } else {
          setBartender({ ...bartender, is_following: true, follower_count: bartender.follower_count + 1 });
          toast.success("Now following!");
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${bartender.name} on PourCircle`, url: profileUrl });
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success("Link copied!");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return token ? `${API}/files/${path}?auth=${token}` : `${API}/files/${path}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const getMapsUrl = (address) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bartender) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="bartender-profile">
      {/* Hero */}
      <div className="relative">
        <div 
          className="h-48 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.pexels.com/photos/6284891/pexels-photo-6284891.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')` 
          }}
        />
        <div className="absolute inset-0 image-overlay" />
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/50 text-white hover:bg-black/70"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Share Button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleShare}
          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
          data-testid="share-btn"
        >
          <Share2 className="w-5 h-5" />
        </Button>

        {/* Avatar */}
        <div className="absolute -bottom-16 left-6">
          <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
            <AvatarImage src={getImageUrl(bartender.profile_image)} />
            <AvatarFallback className="bg-primary/20 text-primary text-3xl">
              {getInitials(bartender.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 pt-20 pb-8 space-y-6">
        {/* Name & Actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {bartender.name}
            </h1>
            <p className="text-white/60">@{bartender.username}</p>
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={() => fetchTabData('followers')}
                className={`flex items-center gap-1 text-sm transition-colors ${activeTab === 'followers' ? 'text-primary' : 'text-white/80 hover:text-white'}`}
                data-testid="followers-tab-btn"
              >
                <Users className="w-4 h-4 text-primary" />
                {bartender.follower_count} followers
              </button>
              <button 
                onClick={() => fetchTabData('following')}
                className={`flex items-center gap-1 text-sm transition-colors ${activeTab === 'following' ? 'text-primary' : 'text-white/80 hover:text-white'}`}
                data-testid="following-tab-btn"
              >
                {bartender.following_count || 0} following
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            {user && user.id !== bartender.id && (
              <Button 
                onClick={handleFollow}
                disabled={followLoading}
                className={
                  bartender.is_following 
                    ? "btn-secondary" 
                    : bartender.is_pending 
                      ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                      : "btn-primary"
                }
                data-testid="follow-btn"
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : bartender.is_following ? (
                  <><UserMinus className="w-4 h-4 mr-2" /> Following</>
                ) : bartender.is_pending ? (
                  <>Requested</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Followers/Following List */}
        {activeTab && (
          <div className="glass-card p-4" data-testid="followers-following-list">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold capitalize">{activeTab}</h3>
              <button 
                onClick={() => setActiveTab(null)} 
                className="text-white/40 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
            {tabLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(activeTab === 'followers' ? followersList : followingList).length > 0 ? (
                  (activeTab === 'followers' ? followersList : followingList).map((person) => (
                    <button
                      key={person.id}
                      onClick={() => navigate(`/u/${person.username}`)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      data-testid={`${activeTab}-item-${person.username}`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={getImageUrl(person.profile_image)} />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {getInitials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">{person.name}</p>
                        <p className="text-white/50 text-xs">@{person.username}</p>
                      </div>
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                        person.role === 'bartender' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                      }`}>
                        {person.role === 'bartender' ? 'Bartender' : 'Bar-Goer'}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-white/40 text-sm text-center py-4">
                    {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {bartender.bio && (
          <p className="text-white/80 leading-relaxed">{bartender.bio}</p>
        )}

        {/* QR Code Toggle */}
        <Button 
          onClick={() => setShowQR(!showQR)}
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/5"
          data-testid="qr-toggle-btn"
        >
          <QrCode className="w-4 h-4 mr-2" />
          {showQR ? "Hide" : "Show"} QR Code
        </Button>

        {showQR && (
          <div className="flex justify-center animate-fade-in">
            <div className="qr-container">
              <QRCodeSVG value={profileUrl} size={180} level="H" />
            </div>
          </div>
        )}

        {/* Tip Links */}
        {(bartender.venmo_link || bartender.cashapp_link || bartender.paypal_link) && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Send a Tip
            </h2>
            <div className="space-y-3">
              {bartender.venmo_link && (
                <a 
                  href={getVenmoUrl(bartender.venmo_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg bg-[#008CFF]/10 border border-[#008CFF]/30 hover:bg-[#008CFF]/20 transition-colors"
                  data-testid="venmo-link"
                >
                  <span className="text-white font-medium">Venmo</span>
                  <ExternalLink className="w-4 h-4 text-[#008CFF]" />
                </a>
              )}
              {bartender.cashapp_link && (
                <a 
                  href={getCashAppUrl(bartender.cashapp_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg bg-[#00D632]/10 border border-[#00D632]/30 hover:bg-[#00D632]/20 transition-colors"
                  data-testid="cashapp-link"
                >
                  <span className="text-white font-medium">Cash App</span>
                  <ExternalLink className="w-4 h-4 text-[#00D632]" />
                </a>
              )}
              {bartender.paypal_link && (
                <a 
                  href={getPayPalUrl(bartender.paypal_link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/30 hover:bg-[#0070BA]/20 transition-colors"
                  data-testid="paypal-link"
                >
                  <span className="text-white font-medium">PayPal</span>
                  <ExternalLink className="w-4 h-4 text-[#0070BA]" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Work Locations */}
        {bartender.work_locations && bartender.work_locations.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Find Me At
            </h2>
            <div className="space-y-4">
              {bartender.work_locations.map((loc, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium text-lg">{loc.name}</h3>
                      <p className="text-white/60 text-sm mt-1">{loc.address}</p>
                    </div>
                    <a 
                      href={loc.maps_url || getMapsUrl(loc.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      data-testid={`map-link-${i}`}
                    >
                      <MapPin className="w-5 h-5" />
                    </a>
                  </div>

                  {/* Schedule */}
                  {loc.schedule && loc.schedule.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white/60 text-sm font-accent mb-2">Schedule</p>
                      <div className="flex flex-wrap gap-2">
                        {loc.schedule.map((s, j) => (
                          <span key={j} className="px-3 py-1 rounded-full bg-white/5 text-white/80 text-sm">
                            {s.day} {s.start}-{s.end}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Happy Hours */}
                  {loc.happy_hours && loc.happy_hours.length > 0 && (
                    <div className="mt-4">
                      <p className="text-secondary text-sm font-accent mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Happy Hour
                      </p>
                      <div className="space-y-3">
                        {loc.happy_hours.map((hh, j) => (
                          <div key={j} className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                            <p className="text-white/80 text-sm font-medium">{hh.day}: {hh.start} - {hh.end}</p>
                            {hh.description && <p className="text-white/60 text-xs mt-1">{hh.description}</p>}
                            
                            {/* Happy Hour Drinks */}
                            {hh.drinks && hh.drinks.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-secondary/20 space-y-2">
                                {hh.drinks.map((drink, dk) => (
                                  <div key={dk} className="flex items-start justify-between">
                                    <div>
                                      <p className="text-white text-sm font-medium">{drink.name}</p>
                                      {drink.ingredients && (
                                        <p className="text-white/50 text-xs">{drink.ingredients}</p>
                                      )}
                                    </div>
                                    {drink.price && (
                                      <span className="text-secondary font-semibold text-sm">{drink.price}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signature Drinks */}
                  {loc.signature_drinks && loc.signature_drinks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-primary text-sm font-accent mb-2 flex items-center gap-2">
                        <GlassWater className="w-4 h-4" />
                        Signature Drinks
                      </p>
                      <div className="space-y-3">
                        {loc.signature_drinks.map((drink, j) => (
                          <div key={j} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-white font-medium">{drink.name}</p>
                                {drink.ingredients && (
                                  <p className="text-white/50 text-sm mt-1">{drink.ingredients}</p>
                                )}
                              </div>
                              {drink.price && (
                                <span className="text-primary font-semibold">{drink.price}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login CTA for non-users */}
        {!user && (
          <div className="glass-card p-6 text-center">
            <p className="text-white/60 mb-4">Sign up to follow and message this bartender</p>
            <Button onClick={() => navigate("/auth")} className="btn-primary">
              Join PourCircle
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BartenderProfile;
