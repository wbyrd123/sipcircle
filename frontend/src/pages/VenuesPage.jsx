import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { 
  Search, MapPin, Store, Users, Loader2, ArrowLeft, Star
} from "lucide-react";
import { toast } from "sonner";

const VenuesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [zipCode, setZipCode] = useState("");
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [followingVenues, setFollowingVenues] = useState([]);
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    fetchFollowingVenues();
  }, []);

  const fetchFollowingVenues = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/user/following-venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowingVenues(response.data);
    } catch (e) {
      console.error("Error fetching following venues:", e);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!zipCode.trim() || zipCode.length < 3) {
      toast.error("Please enter at least 3 digits of a zip code");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/venues/search?zip_code=${zipCode}`, { headers });
      setVenues(response.data);
      if (response.data.length === 0) {
        toast.info("No venues found in this area yet");
      }
    } catch (e) {
      toast.error("Failed to search venues");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (locationId) => {
    if (!user) {
      navigate(`/auth?redirect=/venues`);
      return;
    }

    setFollowLoading(prev => ({ ...prev, [locationId]: true }));
    try {
      await axios.post(`${API}/venues/${locationId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Now following this venue!");
      // Update local state
      setVenues(prev => prev.map(v => 
        v.id === locationId ? { ...v, is_following: true } : v
      ));
      fetchFollowingVenues();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to follow");
    } finally {
      setFollowLoading(prev => ({ ...prev, [locationId]: false }));
    }
  };

  const handleUnfollow = async (locationId) => {
    setFollowLoading(prev => ({ ...prev, [locationId]: true }));
    try {
      await axios.delete(`${API}/venues/${locationId}/follow`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Unfollowed venue");
      // Update local state
      setVenues(prev => prev.map(v => 
        v.id === locationId ? { ...v, is_following: false } : v
      ));
      setFollowingVenues(prev => prev.filter(v => v.id !== locationId));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to unfollow");
    } finally {
      setFollowLoading(prev => ({ ...prev, [locationId]: false }));
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token || ''}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "V";
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Restaurants & Bars
          </h1>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="px-4 pb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                type="text"
                placeholder="Enter zip code..."
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                data-testid="zip-code-input"
              />
            </div>
            <Button type="submit" className="btn-primary" disabled={loading} data-testid="search-venues-btn">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </form>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Call to Action for Vendors */}
        <div className="glass-card p-4 text-center">
          <p className="text-white/60 text-sm">
            Get information on signing up your restaurant or bar by emailing{" "}
            <a href="mailto:admin@pourcircle.net" className="text-primary font-medium">
              admin@pourcircle.net
            </a>
          </p>
        </div>

        {/* Following Venues Section */}
        {followingVenues.length > 0 && !hasSearched && (
          <div className="space-y-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Venues You Follow
            </h2>
            {followingVenues.map((venue) => (
              <button
                key={venue.id}
                onClick={() => navigate(`/venue/${venue.id}`)}
                className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-colors"
                data-testid={`following-venue-${venue.id}`}
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={getImageUrl(venue.venue_logo)} />
                  <AvatarFallback className="bg-primary/20 text-primary text-lg">
                    {getInitials(venue.venue_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold">{venue.venue_name}</h3>
                  <p className="text-white/60 text-sm">{venue.name}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {venue.address}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-3">
            <h2 className="text-white font-semibold">
              {venues.length > 0 ? `${venues.length} venues found` : "No venues found"}
            </h2>
            
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="glass-card p-4 flex items-center gap-4"
                data-testid={`venue-result-${venue.id}`}
              >
                <button
                  onClick={() => navigate(`/venue/${venue.id}`)}
                  className="flex items-center gap-4 flex-1"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={getImageUrl(venue.venue_logo)} />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {getInitials(venue.venue_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">{venue.venue_name}</h3>
                    <p className="text-white/60 text-sm">{venue.name}</p>
                    <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {venue.address}
                    </p>
                  </div>
                </button>
                <Button
                  onClick={() => venue.is_following ? handleUnfollow(venue.id) : handleFollow(venue.id)}
                  variant={venue.is_following ? "outline" : "default"}
                  size="sm"
                  disabled={followLoading[venue.id]}
                  className={venue.is_following ? "border-white/20 text-white" : "btn-primary"}
                  data-testid={`follow-venue-${venue.id}`}
                >
                  {followLoading[venue.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    venue.is_following ? "Following" : "Follow"
                  )}
                </Button>
              </div>
            ))}

            {venues.length === 0 && !loading && (
              <div className="text-center py-8">
                <Store className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No participating venues in this area yet</p>
                <p className="text-white/30 text-sm mt-2">Check back soon!</p>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && followingVenues.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Find Restaurants & Bars</h3>
            <p className="text-white/40 text-sm">Enter a zip code to discover participating venues near you</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default VenuesPage;
