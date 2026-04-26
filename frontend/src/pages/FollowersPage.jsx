import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, Users, MessageCircle, Ban, Check, Store, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "../components/ui/alert-dialog";

const FollowersPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followingVenues, setFollowingVenues] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("followers"); // "followers", "following", "blocked"
  const [blockConfirm, setBlockConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [followersRes, followingRes, followingVenuesRes, blockedRes] = await Promise.all([
        axios.get(`${API}/followers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/following`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/user/following-venues`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/blocked`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
      setFollowingVenues(followingVenuesRes.data);
      setBlockedUsers(blockedRes.data);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId) => {
    try {
      await axios.post(`${API}/block/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("User blocked");
      fetchData();
    } catch (e) {
      toast.error("Failed to block user");
    }
    setBlockConfirm(null);
  };

  const unblockUser = async (userId) => {
    try {
      await axios.delete(`${API}/block/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("User unblocked");
      fetchData();
    } catch (e) {
      toast.error("Failed to unblock user");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  return (
    <div className="min-h-screen bg-background pb-safe" data-testid="followers-page">
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
        <h1 className="text-lg font-semibold text-white">
          {activeTab === "following" ? "Following" : activeTab === "blocked" ? "Blocked Users" : "Followers"}
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex p-4 gap-2 overflow-x-auto">
        <Button
          onClick={() => setActiveTab("followers")}
          className={`flex-1 ${activeTab === "followers" ? "btn-primary" : "btn-secondary"}`}
          data-testid="followers-tab"
        >
          <Users className="w-4 h-4 mr-2" />
          Followers ({followers.length})
        </Button>
        <Button
          onClick={() => setActiveTab("following")}
          className={`flex-1 ${activeTab === "following" ? "btn-primary" : "btn-secondary"}`}
          data-testid="following-tab"
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Following ({following.length + followingVenues.length})
        </Button>
        <Button
          onClick={() => setActiveTab("blocked")}
          className={`flex-1 ${activeTab === "blocked" ? "btn-primary" : "btn-secondary"}`}
          data-testid="blocked-tab"
        >
          <Ban className="w-4 h-4 mr-2" />
          Blocked ({blockedUsers.length})
        </Button>
      </div>

      <main className="px-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "following" ? (
          <div className="space-y-4">
            {/* Following Users */}
            {following.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white/60 text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People ({following.length})
                </h3>
                {following.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => navigate(person.role === "bartender" ? `/b/${person.username}` : `/u/${person.username}`)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Avatar className="w-12 h-12 border border-white/10">
                      <AvatarImage src={getImageUrl(person.profile_image)} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-medium truncate">{person.name}</p>
                      <p className="text-white/60 text-sm">@{person.username}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      person.role === 'bartender' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                    }`}>
                      {person.role === 'bartender' ? 'Bartender' : 'Bar-Goer'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Following Venues */}
            {followingVenues.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white/60 text-sm font-medium flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Places ({followingVenues.length})
                </h3>
                {followingVenues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => navigate(`/venue/${venue.id}`)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Avatar className="w-12 h-12 border border-white/10">
                      <AvatarImage src={getImageUrl(venue.venue_logo)} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {venue.venue_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "V"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-white font-medium truncate">{venue.venue_name}</p>
                      <p className="text-white/60 text-sm">{venue.name}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">
                      Venue
                    </span>
                  </button>
                ))}
              </div>
            )}
            
            {following.length === 0 && followingVenues.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">You're not following anyone yet</p>
                <p className="text-white/30 text-sm mt-1">Discover bartenders and venues to follow!</p>
              </div>
            )}
          </div>
        ) : (activeTab === "followers" ? followers : blockedUsers).length > 0 ? (
          <div className="space-y-2">
            {(activeTab === "followers" ? followers : blockedUsers).map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5"
              >
                <Avatar className="w-12 h-12 border border-white/10">
                  <AvatarImage src={getImageUrl(person.profile_image)} />
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{person.name}</p>
                  <p className="text-white/60 text-sm">@{person.username}</p>
                </div>
                <div className="flex gap-2">
                  {activeTab === "followers" ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setBlockConfirm(person)}
                        className="text-white/60 hover:text-red-400"
                        data-testid={`block-${person.id}`}
                      >
                        <Ban className="w-5 h-5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => unblockUser(person.id)}
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                      data-testid={`unblock-${person.id}`}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Unblock
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {activeTab === "blocked" ? (
              <>
                <Ban className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No blocked users</p>
              </>
            ) : (
              <>
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 mb-2">No followers yet</p>
                <p className="text-white/40 text-sm">Share your profile to grow your following!</p>
              </>
            )}
          </div>
        )}
      </main>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={!!blockConfirm} onOpenChange={() => setBlockConfirm(null)}>
        <AlertDialogContent className="bg-[#0a0a0a] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Block {blockConfirm?.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              They won't be able to see your profile, message you, or follow you. You can unblock them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => blockUser(blockConfirm?.id)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
};

export default FollowersPage;
