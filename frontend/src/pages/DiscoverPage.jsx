import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, Search, MapPin, Users } from "lucide-react";

const DiscoverPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [bartenders, setBartenders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBartenders();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBartenders(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchBartenders = async (query = "") => {
    try {
      const url = query ? `${API}/bartenders?search=${encodeURIComponent(query)}` : `${API}/bartenders`;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(url, { headers });
      setBartenders(response.data);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return token ? `${API}/files/${path}?auth=${token}` : `${API}/files/${path}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  return (
    <div className="min-h-screen bg-background pb-safe" data-testid="discover-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-white/60 hover:text-white"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Discover Bartenders</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, or location..."
            className="input-dark pl-10"
            data-testid="search-input"
          />
        </div>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bartenders.length > 0 ? (
          <div className="grid gap-4">
            {bartenders.map((bartender) => (
              <button
                key={bartender.id}
                onClick={() => navigate(`/b/${bartender.username}`)}
                className="glass-card-hover p-4 flex items-center gap-4 text-left"
                data-testid={`bartender-${bartender.username}`}
              >
                <Avatar className="w-16 h-16 border-2 border-white/10">
                  <AvatarImage src={getImageUrl(bartender.profile_image)} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl">
                    {getInitials(bartender.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate">{bartender.name}</h3>
                  <p className="text-white/60 text-sm">@{bartender.username}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-white/60 text-xs">
                      <Users className="w-3 h-3" />
                      {bartender.followers?.length || 0} followers
                    </span>
                    {bartender.work_locations?.[0] && (
                      <span className="flex items-center gap-1 text-white/60 text-xs">
                        <MapPin className="w-3 h-3" />
                        {bartender.work_locations[0].name}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">
              {search ? "No bartenders found" : "No bartenders yet"}
            </p>
            <p className="text-white/40 text-sm">
              {search ? "Try a different search term" : "Be the first to join!"}
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default DiscoverPage;
