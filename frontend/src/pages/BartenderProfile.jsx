import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  Wine, MapPin, Clock, Users, MessageCircle, QrCode, DollarSign, 
  ExternalLink, ArrowLeft, UserPlus, UserMinus, Share2, GlassWater
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

  const profileUrl = `${window.location.origin}/b/${username}`;

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

  const handleFollow = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setFollowLoading(true);
    try {
      if (bartender.is_following) {
        await axios.delete(`${API}/follow/${bartender.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setBartender({ ...bartender, is_following: false, follower_count: bartender.follower_count - 1 });
        toast.success("Unfollowed");
      } else {
        await axios.post(`${API}/follow/${bartender.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setBartender({ ...bartender, is_following: true, follower_count: bartender.follower_count + 1 });
        toast.success("Now following!");
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate(`/messages/${bartender.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `${bartender.name} on PourPal`, url: profileUrl });
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

  if (!bartender) return null;

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
            <div className="flex items-center gap-2 mt-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-white/80">{bartender.follower_count} followers</span>
            </div>
          </div>
          <div className="flex gap-2">
            {user?.role === "customer" && (
              <>
                <Button 
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={bartender.is_following ? "btn-secondary" : "btn-primary"}
                  data-testid="follow-btn"
                >
                  {bartender.is_following ? (
                    <><UserMinus className="w-4 h-4 mr-2" /> Following</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                  )}
                </Button>
                <Button 
                  onClick={handleMessage}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                  data-testid="message-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

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
                  href={bartender.venmo_link}
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
                  href={bartender.cashapp_link}
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
                  href={bartender.paypal_link}
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
                      <div className="space-y-2">
                        {loc.happy_hours.map((hh, j) => (
                          <div key={j} className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                            <p className="text-white/80 text-sm">{hh.day}: {hh.start} - {hh.end}</p>
                            {hh.description && <p className="text-white/60 text-xs mt-1">{hh.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drinks */}
                  {loc.drinks && loc.drinks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-white/60 text-sm font-accent mb-2 flex items-center gap-2">
                        <GlassWater className="w-4 h-4" />
                        Signature Drinks
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {loc.drinks.map((drink, j) => (
                          <span key={j} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                            {drink}
                          </span>
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
              Join PourPal
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BartenderProfile;
