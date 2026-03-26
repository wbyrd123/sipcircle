import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import BottomNav from "../components/BottomNav";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import { 
  ArrowLeft, Plus, Calendar, MapPin, Clock, Check, X, HelpCircle, Users, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

const InvitesPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [invites, setInvites] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  
  // Create form
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invitesRes, followingRes] = await Promise.all([
        axios.get(`${API}/invites`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/following`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setInvites(invitesRes.data);
      setFollowing(followingRes.data);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setLocationName(place.name);
    setAddress(place.address);
    setMapsUrl(place.mapsUrl);
  };

  const createInvite = async () => {
    if (!locationName || !dateTime || selectedUsers.length === 0) {
      toast.error("Please select a location, date/time, and at least one person");
      return;
    }

    setCreating(true);
    try {
      await axios.post(`${API}/invites`, {
        recipient_ids: selectedUsers,
        location_name: locationName,
        address,
        maps_url: mapsUrl,
        datetime_str: dateTime,
        message
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success("Invite sent!");
      setShowCreate(false);
      resetForm();
      fetchData();
    } catch (e) {
      toast.error("Failed to create invite");
    } finally {
      setCreating(false);
    }
  };

  const respondToInvite = async (inviteId, response) => {
    try {
      await axios.post(`${API}/invites/${inviteId}/respond?response=${response}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response === "accepted" ? "You're going!" : response === "declined" ? "Declined" : "Maybe");
      fetchData();
    } catch (e) {
      toast.error("Failed to respond");
    }
  };

  const resetForm = () => {
    setSelectedUsers([]);
    setLocationName("");
    setAddress("");
    setMapsUrl("");
    setDateTime("");
    setMessage("");
  };

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const getMyResponse = (invite) => {
    return invite.responses?.[user.id];
  };

  return (
    <div className="min-h-screen bg-background pb-safe" data-testid="invites-page">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-white/60 hover:text-white"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Invites</h1>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="btn-primary" data-testid="create-invite-btn">
              <Plus className="w-4 h-4 mr-2" />
              New Invite
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-md mx-4">
            <DialogHeader>
              <DialogTitle className="text-white text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Create Invite
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-white/80">Search Location</Label>
                <PlaceAutocomplete 
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Search for a bar, restaurant..."
                />
              </div>
              
              {/* Show selected location */}
              {locationName && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <p className="text-white font-medium">{locationName}</p>
                  {address && <p className="text-white/60 text-sm mt-1">{address}</p>}
                  {mapsUrl && (
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary text-sm mt-2 hover:underline"
                    >
                      <MapPin className="w-3 h-3" />
                      View on Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white/80">Date & Time</Label>
                <Input
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  placeholder="Friday at 8pm"
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Message (optional)</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Let's grab some drinks!"
                  className="input-dark"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Invite People</Label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {following.length > 0 ? (
                    following.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => toggleUser(person.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          selectedUsers.includes(person.id) 
                            ? "bg-primary/20 border border-primary/50" 
                            : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={getImageUrl(person.profile_image)} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {getInitials(person.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm">{person.name}</span>
                        {selectedUsers.includes(person.id) && (
                          <Check className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-white/40 text-sm text-center py-4">
                      Follow some bartenders first!
                    </p>
                  )}
                </div>
              </div>
              <Button 
                onClick={createInvite} 
                disabled={creating}
                className="w-full btn-primary"
              >
                {creating ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invites.length > 0 ? (
          <div className="space-y-4">
            {invites.map((invite) => {
              const isCreator = invite.creator_id === user.id;
              const myResponse = getMyResponse(invite);
              
              return (
                <div key={invite.id} className="glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-accent text-xs text-primary">
                      {isCreator ? "YOUR INVITE" : `FROM ${invite.creator_name?.toUpperCase()}`}
                    </span>
                    {myResponse && (
                      <span className={`font-accent text-xs ${
                        myResponse === "accepted" ? "text-green-400" : 
                        myResponse === "declined" ? "text-red-400" : "text-yellow-400"
                      }`}>
                        {myResponse.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg">{invite.location_name}</h3>
                  
                  {invite.address && (
                    <div className="flex items-center gap-2 text-white/60 text-sm mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{invite.address}</span>
                    </div>
                  )}
                  
                  {invite.maps_url && (
                    <a 
                      href={invite.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary text-sm mt-2 hover:underline"
                    >
                      <MapPin className="w-4 h-4" />
                      Open in Google Maps
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  
                  <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{invite.datetime_str}</span>
                  </div>
                  
                  {invite.message && (
                    <p className="text-white/80 text-sm mt-3 p-3 bg-white/5 rounded-lg">
                      "{invite.message}"
                    </p>
                  )}

                  {/* Responses summary for creator */}
                  {isCreator && (
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <Check className="w-4 h-4" />
                        {Object.values(invite.responses || {}).filter(r => r === "accepted").length}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <HelpCircle className="w-4 h-4" />
                        {Object.values(invite.responses || {}).filter(r => r === "maybe").length}
                      </div>
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <X className="w-4 h-4" />
                        {Object.values(invite.responses || {}).filter(r => r === "declined").length}
                      </div>
                    </div>
                  )}

                  {/* Response buttons for recipients */}
                  {!isCreator && !myResponse && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => respondToInvite(invite.id, "accepted")}
                        className="flex-1 bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Going
                      </Button>
                      <Button 
                        onClick={() => respondToInvite(invite.id, "maybe")}
                        className="flex-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 hover:bg-yellow-600/30"
                      >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Maybe
                      </Button>
                      <Button 
                        onClick={() => respondToInvite(invite.id, "declined")}
                        className="flex-1 bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Can't
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60 mb-2">No invites yet</p>
            <p className="text-white/40 text-sm mb-6">Create one to meet up with friends!</p>
            <Button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Invite
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default InvitesPage;
