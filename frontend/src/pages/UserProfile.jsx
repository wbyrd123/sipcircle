import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, API, WEB_URL } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { 
  MapPin, Clock, Users, QrCode, DollarSign, 
  ExternalLink, ArrowLeft, UserPlus, UserMinus, Share2, GlassWater, Loader2, Wine, ShieldBan, Flag
} from "lucide-react";
import { toast } from "sonner";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(null); // 'followers' or 'following'
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  const profileUrl = `${WEB_URL}/u/${username}`;

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
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/user/${username}`, { headers });
      setProfile(response.data);
    } catch (e) {
      if (e.response?.status === 403) {
        toast.error("You are blocked by this user");
      } else if (e.response?.status === 404) {
        toast.error("User not found");
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
      if (profile.is_following) {
        // Unfollow
        await axios.delete(`${API}/follow/${profile.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProfile({ ...profile, is_following: false, is_pending: false, follower_count: profile.follower_count - 1 });
        toast.success("Unfollowed");
      } else if (profile.is_pending) {
        // Cancel pending request
        await axios.delete(`${API}/follow/${profile.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProfile({ ...profile, is_pending: false });
        toast.success("Request cancelled");
      } else {
        // Follow or request to follow
        const response = await axios.post(`${API}/follow/${profile.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        if (response.data.status === "pending") {
          setProfile({ ...profile, is_pending: true });
          toast.success("Follow request sent!");
        } else {
          setProfile({ ...profile, is_following: true, follower_count: profile.follower_count + 1 });
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
      await navigator.share({ title: `${profile.name} on PourCircle`, url: profileUrl });
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast.success("Link copied!");
    }
  };

  const handleBlock = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setBlockLoading(true);
    try {
      await axios.post(`${API}/block/${profile.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("User blocked");
      navigate(-1);
    } catch (e) {
      toast.error("Failed to block user");
    } finally {
      setBlockLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error("Please select a reason");
      return;
    }
    setReportLoading(true);
    try {
      await axios.post(`${API}/report/${profile.id}`, 
        { reason: reportReason, details: reportDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Report submitted. Thank you for helping keep PourCircle safe.");
      setShowReportModal(false);
      setReportReason("");
      setReportDetails("");
    } catch (e) {
      toast.error("Failed to submit report");
    } finally {
      setReportLoading(false);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  const isBartender = profile.role === "bartender";
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="min-h-screen bg-background pb-24" data-testid="user-profile">
      {/* Hero */}
      <div className="relative">
        <div 
          className="h-40 bg-gradient-to-br from-primary/30 to-secondary/30"
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
        <div className="absolute -bottom-14 left-6">
          <Avatar className="w-28 h-28 border-4 border-background shadow-2xl">
            <AvatarImage src={getImageUrl(profile.profile_image)} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content */}
      <main className="px-6 pt-18 pb-8 space-y-6" style={{ paddingTop: '4.5rem' }}>
        {/* Name & Actions */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {profile.name}
            </h1>
            <p className="text-white/60">@{profile.username}</p>
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={() => fetchTabData('followers')}
                className={`flex items-center gap-1 text-sm transition-colors ${activeTab === 'followers' ? 'text-primary' : 'text-white/60 hover:text-white'}`}
                data-testid="followers-tab-btn"
              >
                <Users className="w-4 h-4 text-primary" />
                {profile.follower_count} followers
              </button>
              <button 
                onClick={() => fetchTabData('following')}
                className={`flex items-center gap-1 text-sm transition-colors ${activeTab === 'following' ? 'text-primary' : 'text-white/60 hover:text-white'}`}
                data-testid="following-tab-btn"
              >
                {profile.following_count} following
              </button>
            </div>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              isBartender ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
            }`}>
              {isBartender ? 'Bartender' : 'Bar-Goer'}
            </span>
          </div>
          {user && !isOwnProfile && (
            <Button 
              onClick={handleFollow}
              disabled={followLoading}
              size="sm"
              className={
                profile.is_following 
                  ? "btn-secondary" 
                  : profile.is_pending 
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                    : "btn-primary"
              }
              data-testid="follow-btn"
            >
              {followLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : profile.is_following ? (
                <><UserMinus className="w-4 h-4 mr-1" /> Following</>
              ) : profile.is_pending ? (
                <>Requested</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-1" /> Follow</>
              )}
            </Button>
          )}
          {user && !isOwnProfile && (
            <Button 
              onClick={handleBlock}
              disabled={blockLoading}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 ml-2"
              data-testid="block-btn"
              title="Block user"
            >
              {blockLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldBan className="w-4 h-4" />
              )}
            </Button>
          )}
          {user && !isOwnProfile && (
            <Button 
              onClick={() => setShowReportModal(true)}
              size="sm"
              variant="ghost"
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
              data-testid="report-btn"
              title="Report user"
            >
              <Flag className="w-4 h-4" />
            </Button>
          )}
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
        {profile.bio && (
          <p className="text-white/80 leading-relaxed">{profile.bio}</p>
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
              <QRCodeSVG value={profileUrl} size={160} level="H" />
            </div>
          </div>
        )}

        {/* Bartender-specific content */}
        {isBartender && (
          <>
            {/* Tip Links */}
            {(profile.venmo_link || profile.cashapp_link || profile.paypal_link) && (
              <div className="glass-card p-5">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Send a Tip
                </h2>
                <div className="space-y-2">
                  {profile.venmo_link && (
                    <a 
                      href={getVenmoUrl(profile.venmo_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#008CFF]/10 border border-[#008CFF]/30 hover:bg-[#008CFF]/20 transition-colors"
                      data-testid="venmo-link"
                    >
                      <span className="text-white font-medium text-sm">Venmo</span>
                      <ExternalLink className="w-4 h-4 text-[#008CFF]" />
                    </a>
                  )}
                  {profile.cashapp_link && (
                    <a 
                      href={getCashAppUrl(profile.cashapp_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#00D632]/10 border border-[#00D632]/30 hover:bg-[#00D632]/20 transition-colors"
                      data-testid="cashapp-link"
                    >
                      <span className="text-white font-medium text-sm">Cash App</span>
                      <ExternalLink className="w-4 h-4 text-[#00D632]" />
                    </a>
                  )}
                  {profile.paypal_link && (
                    <a 
                      href={getPayPalUrl(profile.paypal_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/30 hover:bg-[#0070BA]/20 transition-colors"
                      data-testid="paypal-link"
                    >
                      <span className="text-white font-medium text-sm">PayPal</span>
                      <ExternalLink className="w-4 h-4 text-[#0070BA]" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Work Locations */}
            {profile.work_locations && profile.work_locations.length > 0 && (
              <div className="glass-card p-5">
                <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Find Me At
                </h2>
                <div className="space-y-3">
                  {profile.work_locations.map((loc, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-white font-medium">{loc.name}</h3>
                          <p className="text-white/60 text-sm mt-1">{loc.address}</p>
                        </div>
                        <a 
                          href={loc.maps_url || getMapsUrl(loc.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      </div>

                      {/* Schedule */}
                      {loc.schedule && loc.schedule.length > 0 && (
                        <div className="mt-3">
                          <p className="text-white/60 text-xs font-accent mb-1">Schedule</p>
                          <div className="flex flex-wrap gap-1">
                            {loc.schedule.map((s, j) => (
                              <span key={j} className="px-2 py-0.5 rounded-full bg-white/5 text-white/80 text-xs">
                                {s.day} {s.start}-{s.end}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Happy Hours */}
                      {loc.happy_hours && loc.happy_hours.length > 0 && (
                        <div className="mt-3">
                          <p className="text-secondary text-xs font-accent mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Happy Hour
                          </p>
                          <div className="space-y-2">
                            {loc.happy_hours.map((hh, j) => (
                              <div key={j} className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                                <p className="text-white/80 text-xs font-medium">{hh.day}: {hh.start} - {hh.end}</p>
                                {hh.description && <p className="text-white/60 text-xs mt-0.5">{hh.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Signature Drinks */}
                      {loc.signature_drinks && loc.signature_drinks.length > 0 && (
                        <div className="mt-3">
                          <p className="text-primary text-xs font-accent mb-1 flex items-center gap-1">
                            <GlassWater className="w-3 h-3" />
                            Signature Drinks
                          </p>
                          <div className="space-y-2">
                            {loc.signature_drinks.map((drink, j) => (
                              <div key={j} className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-white font-medium text-sm">{drink.name}</p>
                                    {drink.ingredients && (
                                      <p className="text-white/50 text-xs mt-0.5">{drink.ingredients}</p>
                                    )}
                                  </div>
                                  {drink.price && (
                                    <span className="text-primary font-semibold text-sm">{drink.price}</span>
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
          </>
        )}

        {/* Login CTA for non-users */}
        {!user && (
          <div className="glass-card p-5 text-center">
            <p className="text-white/60 mb-3 text-sm">Sign up to follow and message this user</p>
            <Button onClick={() => navigate("/auth")} className="btn-primary">
              Join PourCircle
            </Button>
          </div>
        )}
      </main>

      {user && <BottomNav />}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#1a1a1a] rounded-xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Report User</h3>
            <p className="text-white/60 text-sm mb-4">
              Why are you reporting @{profile.username}?
            </p>
            
            <div className="space-y-2 mb-4">
              {["Harassment or bullying", "Spam or fake profile", "Inappropriate content", "Impersonation", "Other"].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    reportReason === reason 
                      ? "border-primary bg-primary/10 text-white" 
                      : "border-white/10 text-white/70 hover:bg-white/5"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Additional details (optional)"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 mb-4 resize-none"
              rows={3}
            />

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                variant="outline"
                className="flex-1 border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReport}
                disabled={reportLoading || !reportReason}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
