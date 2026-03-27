import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import { ArrowLeft, UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";

const FollowRequestsPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API}/follow-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (e) {
      console.error("Error fetching requests:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requesterId) => {
    setProcessing(prev => ({ ...prev, [requesterId]: true }));
    try {
      await axios.post(`${API}/follow-requests/${requesterId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Follow request approved!");
      setRequests(prev => prev.filter(r => r.id !== requesterId));
    } catch (e) {
      toast.error("Failed to approve request");
    } finally {
      setProcessing(prev => ({ ...prev, [requesterId]: false }));
    }
  };

  const handleDeny = async (requesterId) => {
    setProcessing(prev => ({ ...prev, [requesterId]: true }));
    try {
      await axios.post(`${API}/follow-requests/${requesterId}/deny`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Follow request denied");
      setRequests(prev => prev.filter(r => r.id !== requesterId));
    } catch (e) {
      toast.error("Failed to deny request");
    } finally {
      setProcessing(prev => ({ ...prev, [requesterId]: false }));
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
    <div className="min-h-screen bg-background pb-24" data-testid="follow-requests-page">
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
        <h1 className="text-lg font-semibold text-white">Follow Requests</h1>
        {requests.length > 0 && (
          <span className="ml-auto bg-primary/20 text-primary text-sm px-2 py-1 rounded-full">
            {requests.length}
          </span>
        )}
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((requester) => (
              <div
                key={requester.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5"
              >
                <button 
                  onClick={() => navigate(`/u/${requester.username}`)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <Avatar className="w-14 h-14 border border-white/10">
                    <AvatarImage src={getImageUrl(requester.profile_image)} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {getInitials(requester.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-medium truncate">{requester.name}</p>
                    <p className="text-white/60 text-sm">@{requester.username}</p>
                    <p className="text-white/40 text-xs capitalize">{requester.role === 'bartender' ? 'Bartender' : 'Bar-Goer'}</p>
                  </div>
                </button>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(requester.id)}
                    disabled={processing[requester.id]}
                    size="sm"
                    className="bg-primary text-black hover:bg-primary/90"
                    data-testid={`approve-${requester.id}`}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeny(requester.id)}
                    disabled={processing[requester.id]}
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/5"
                    data-testid={`deny-${requester.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <UserPlus className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">No pending follow requests</p>
            <p className="text-white/40 text-sm">
              When someone requests to follow you, they'll appear here
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default FollowRequestsPage;
