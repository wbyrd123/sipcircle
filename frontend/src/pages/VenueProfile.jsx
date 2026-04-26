import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, API, WEB_URL } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  ArrowLeft, MapPin, Clock, Phone, Users, Star, ExternalLink, 
  Loader2, QrCode, Share2, Copy, Menu, Utensils
} from "lucide-react";
import { toast } from "sonner";

const VenueProfile = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const venueUrl = `${WEB_URL}/venue/${locationId}`;

  useEffect(() => {
    fetchVenue();
  }, [locationId]);

  const fetchVenue = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/venues/${locationId}`, { headers });
      setVenue(response.data);
    } catch (e) {
      if (e.response?.status === 404) {
        toast.error("Venue not found");
      }
      navigate("/venues");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      navigate(`/auth?redirect=/venue/${locationId}`);
      return;
    }

    setFollowLoading(true);
    try {
      if (venue.is_following) {
        await axios.delete(`${API}/venues/${locationId}/follow`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVenue(prev => ({ ...prev, is_following: false, follower_count: prev.follower_count - 1 }));
        toast.success("Unfollowed venue");
      } else {
        await axios.post(`${API}/venues/${locationId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVenue(prev => ({ ...prev, is_following: true, follower_count: prev.follower_count + 1 }));
        toast.success("Now following this venue!");
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${venue.venue_name} - ${venue.name}`,
          text: `Check out ${venue.venue_name} on PourCircle!`,
          url: venueUrl
        });
      } catch (e) {
        if (e.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(venueUrl);
    toast.success("Link copied to clipboard!");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token || ''}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "V";
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQR(true)} className="p-2 text-white/60 hover:text-white">
              <QrCode className="w-5 h-5" />
            </button>
            <button onClick={handleShare} className="p-2 text-white/60 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowQR(false)}>
          <div className="glass-card p-6 text-center max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-4">{venue.venue_name}</h3>
            <p className="text-white/60 text-sm mb-4">{venue.name}</p>
            <div className="bg-white p-4 rounded-xl inline-block">
              <QRCodeSVG value={venueUrl} size={200} />
            </div>
            <p className="text-white/40 text-xs mt-4">Scan to view this venue</p>
            <Button onClick={handleCopyLink} variant="outline" className="mt-4 border-white/20 text-white">
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Venue Header */}
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={getImageUrl(venue.venue_logo)} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl">
              {getInitials(venue.venue_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{venue.venue_name}</h1>
            <p className="text-white/60">{venue.name}</p>
            <p className="text-white/40 text-sm flex items-center gap-1 mt-1">
              <Users className="w-4 h-4" />
              {venue.follower_count} followers
            </p>
          </div>
        </div>

        {/* Follow Button & CTA */}
        <div className="space-y-3">
          <Button
            onClick={handleFollow}
            disabled={followLoading}
            className={`w-full ${venue.is_following ? "bg-white/10 text-white hover:bg-white/20" : "btn-primary"}`}
            data-testid="follow-venue-btn"
          >
            {followLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              venue.is_following ? "Following" : "Follow"
            )}
          </Button>
          {!venue.is_following && (
            <p className="text-center text-white/50 text-sm">
              Follow to receive important updates such as specials or new Stars joining our team
            </p>
          )}
        </div>

        {/* Address & Phone */}
        <div className="glass-card p-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-white">{venue.address}</p>
              {venue.zip_code && <p className="text-white/40 text-sm">{venue.zip_code}</p>}
            </div>
          </div>
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className="flex items-center gap-3 text-white hover:text-primary">
              <Phone className="w-5 h-5 text-primary" />
              <span>{venue.phone}</span>
            </a>
          )}
        </div>

        {/* Hours */}
        {venue.hours && venue.hours.length > 0 && (
          <div className="glass-card p-4">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Hours
            </h2>
            <div className="space-y-2">
              {venue.hours.map((h, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/60">{h.day}</span>
                  <span className="text-white">
                    {h.is_closed ? "Closed" : `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menus */}
        {venue.menus && venue.menus.length > 0 && (
          <div className="glass-card p-4">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              Menus
            </h2>
            <div className="space-y-2">
              {venue.menus.map((menu, i) => (
                <div key={i}>
                  {menu.menu_type === "link" && menu.url ? (
                    <a
                      href={menu.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-white">{menu.name}</span>
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-white font-medium mb-2">{menu.name}</p>
                      {menu.items && menu.items.map((item, j) => (
                        <div key={j} className="flex justify-between text-sm py-1">
                          <span className="text-white/60">{item.name}</span>
                          {item.price && <span className="text-white">{item.price}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* The Stars (Bartenders) */}
        {venue.stars && venue.stars.length > 0 && (
          <div className="glass-card p-4">
            <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              The Stars
            </h2>
            <div className="space-y-3">
              {venue.stars.map((star) => (
                <button
                  key={star.id}
                  onClick={() => navigate(`/b/${star.username}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  data-testid={`star-${star.username}`}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getImageUrl(star.profile_image)} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {star.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{star.name}</p>
                    <p className="text-white/50 text-sm">@{star.username}</p>
                  </div>
                  <span className="text-primary text-sm">View Profile →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Login CTA for non-users */}
        {!user && (
          <div className="glass-card p-5 text-center">
            <p className="text-white/60 mb-3 text-sm">Sign up or login to follow this venue</p>
            <Button 
              onClick={() => navigate(`/auth?redirect=/venue/${locationId}`)} 
              className="btn-primary"
            >
              Login / Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueProfile;
