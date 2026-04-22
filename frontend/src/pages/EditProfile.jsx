import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Switch } from "../components/ui/switch";
import { 
  ArrowLeft, Camera, Plus, Trash2, Save, LogOut, MapPin, Clock, GlassWater, UserX, Shield, FileText, ScrollText, ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "../components/ui/alert-dialog";
import { Capacitor } from '@capacitor/core';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, token, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Form state
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [venmoLink, setVenmoLink] = useState(user?.venmo_link || "");
  const [cashappLink, setCashappLink] = useState(user?.cashapp_link || "");
  const [paypalLink, setPaypalLink] = useState(user?.paypal_link || "");
  const [locations, setLocations] = useState(user?.work_locations || []);
  const [requireFollowApproval, setRequireFollowApproval] = useState(user?.require_follow_approval || false);
  const [followersVisibility, setFollowersVisibility] = useState(user?.followers_visibility || "everyone");

  const isBartender = user?.role === "bartender";
  const isNativePlatform = Capacitor.isNativePlatform();

  // Convert base64 to Blob for upload
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Native camera/photo picker using Capacitor Camera plugin with safe dynamic import
  const handleNativeImagePick = async () => {
    try {
      // Dynamically import to avoid crashes if plugin not properly installed
      const { Camera: CapacitorCamera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      // Request permissions first
      const permissions = await CapacitorCamera.checkPermissions();
      if (permissions.photos === 'denied' || permissions.camera === 'denied') {
        const requested = await CapacitorCamera.requestPermissions();
        if (requested.photos === 'denied' && requested.camera === 'denied') {
          toast.error("Camera and photo library access is required to upload a profile picture");
          return;
        }
      }

      // Show action sheet to choose camera or gallery
      const image = await CapacitorCamera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // Shows action sheet: Camera, Photos, or Cancel
        width: 500,
        height: 500,
        correctOrientation: true,
        presentationStyle: 'popover', // Important for iPad - prevents crash
      });

      if (!image.base64String) {
        return;
      }

      setUploading(true);

      // Convert base64 to blob
      const mimeType = `image/${image.format || 'jpeg'}`;
      const blob = base64ToBlob(image.base64String, mimeType);
      const file = new File([blob], `profile.${image.format || 'jpg'}`, { type: mimeType });

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API}/profile/image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      updateUser({ profile_image: response.data.path });
      toast.success("Profile picture updated!");
    } catch (e) {
      // User cancelled - don't show error
      if (e.message?.includes('cancelled') || e.message?.includes('User cancelled')) {
        return;
      }
      console.error("Image pick error:", e);
      // Fall back to file input on any error
      toast.error("Camera not available. Please use the file picker.");
      fileInputRef.current?.click();
    } finally {
      setUploading(false);
    }
  };

  // Web file input handler (fallback for browsers)
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/profile/image`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      updateUser({ profile_image: response.data.path });
      toast.success("Profile picture updated!");
    } catch (e) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Unified image picker - uses native on iOS/Android, file input on web
  const handleImagePick = () => {
    if (isNativePlatform) {
      handleNativeImagePick();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const endpoint = isBartender ? "/profile/bartender" : "/profile/customer";
      const data = isBartender 
        ? { name, bio, venmo_link: venmoLink, cashapp_link: cashappLink, paypal_link: paypalLink, work_locations: locations, require_follow_approval: requireFollowApproval, followers_visibility: followersVisibility }
        : { name, bio, require_follow_approval: requireFollowApproval, followers_visibility: followersVisibility };
      
      const response = await axios.put(`${API}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(response.data);
      toast.success("Profile updated!");
      navigate(-1);
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } catch (e) {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const addLocation = () => {
    setLocations([...locations, {
      id: crypto.randomUUID(),
      name: "",
      address: "",
      schedule: [],
      happy_hours: [],
      drinks: []
    }]);
  };

  const updateLocation = (index, field, value) => {
    const updated = [...locations];
    updated[index][field] = value;
    setLocations(updated);
  };

  const removeLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const addSchedule = (locIndex) => {
    const updated = [...locations];
    updated[locIndex].schedule.push({ day: "Monday", start: "18:00", end: "02:00" });
    setLocations(updated);
  };

  const updateSchedule = (locIndex, schedIndex, field, value) => {
    const updated = [...locations];
    updated[locIndex].schedule[schedIndex][field] = value;
    setLocations(updated);
  };

  const removeSchedule = (locIndex, schedIndex) => {
    const updated = [...locations];
    updated[locIndex].schedule = updated[locIndex].schedule.filter((_, i) => i !== schedIndex);
    setLocations(updated);
  };

  const addHappyHour = (locIndex) => {
    const updated = [...locations];
    updated[locIndex].happy_hours.push({ day: "Monday", start: "17:00", end: "19:00", description: "" });
    setLocations(updated);
  };

  const updateHappyHour = (locIndex, hhIndex, field, value) => {
    const updated = [...locations];
    updated[locIndex].happy_hours[hhIndex][field] = value;
    setLocations(updated);
  };

  const removeHappyHour = (locIndex, hhIndex) => {
    const updated = [...locations];
    updated[locIndex].happy_hours = updated[locIndex].happy_hours.filter((_, i) => i !== hhIndex);
    setLocations(updated);
  };

  // Add signature drink
  const addSignatureDrink = (locIndex) => {
    const updated = [...locations];
    if (!updated[locIndex].signature_drinks) {
      updated[locIndex].signature_drinks = [];
    }
    updated[locIndex].signature_drinks.push({ 
      id: crypto.randomUUID(),
      name: "", 
      ingredients: "", 
      price: "" 
    });
    setLocations(updated);
  };

  const updateSignatureDrink = (locIndex, drinkIndex, field, value) => {
    const updated = [...locations];
    updated[locIndex].signature_drinks[drinkIndex][field] = value;
    setLocations(updated);
  };

  const removeSignatureDrink = (locIndex, drinkIndex) => {
    const updated = [...locations];
    updated[locIndex].signature_drinks = updated[locIndex].signature_drinks.filter((_, i) => i !== drinkIndex);
    setLocations(updated);
  };

  // Add happy hour drink
  const addHappyHourDrink = (locIndex, hhIndex) => {
    const updated = [...locations];
    if (!updated[locIndex].happy_hours[hhIndex].drinks) {
      updated[locIndex].happy_hours[hhIndex].drinks = [];
    }
    updated[locIndex].happy_hours[hhIndex].drinks.push({ 
      id: crypto.randomUUID(),
      name: "", 
      ingredients: "", 
      price: "" 
    });
    setLocations(updated);
  };

  const updateHappyHourDrink = (locIndex, hhIndex, drinkIndex, field, value) => {
    const updated = [...locations];
    updated[locIndex].happy_hours[hhIndex].drinks[drinkIndex][field] = value;
    setLocations(updated);
  };

  const removeHappyHourDrink = (locIndex, hhIndex, drinkIndex) => {
    const updated = [...locations];
    updated[locIndex].happy_hours[hhIndex].drinks = updated[locIndex].happy_hours[hhIndex].drinks.filter((_, i) => i !== drinkIndex);
    setLocations(updated);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return `${API}/files/${path}?auth=${token}`;
  };

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="edit-profile">
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
          <h1 className="text-lg font-semibold text-white">Edit Profile</h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
          data-testid="save-btn"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save"}
        </Button>
      </header>

      <main className="p-6 space-y-8 pb-20">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-28 h-28 border-2 border-primary">
              <AvatarImage src={getImageUrl(user.profile_image)} />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleImagePick}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-black hover:bg-primary/90 transition-colors"
              data-testid="upload-photo-btn"
            >
              <Camera className="w-5 h-5" />
            </button>
            {/* File input fallback for web browsers */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {uploading && <p className="text-white/60 text-sm mt-2">Uploading...</p>}
        </div>

        {/* Basic Info */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Info</h2>
          <div className="space-y-2">
            <Label className="text-white/80">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dark"
              data-testid="name-input"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white/80">Bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="input-dark min-h-[100px]"
              data-testid="bio-input"
            />
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Privacy Settings
          </h2>
          <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
            <div className="flex-1">
              <p className="text-white font-medium">Require Follow Approval</p>
              <p className="text-white/50 text-sm mt-1">
                When enabled, you'll need to approve follow requests before others can follow you
              </p>
            </div>
            <Switch
              checked={requireFollowApproval}
              onCheckedChange={setRequireFollowApproval}
              data-testid="require-approval-toggle"
            />
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <p className="text-white font-medium mb-2">Who can see your followers/following</p>
            <p className="text-white/50 text-sm mb-3">
              Control who can view your followers and following lists
            </p>
            <select
              value={followersVisibility}
              onChange={(e) => setFollowersVisibility(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-primary focus:outline-none"
              data-testid="followers-visibility-select"
            >
              <option value="everyone" className="bg-[#1a1a1a]">Everyone</option>
              <option value="followers" className="bg-[#1a1a1a]">Followers only</option>
              <option value="only_me" className="bg-[#1a1a1a]">Only me</option>
            </select>
          </div>
        </div>

        {/* Bartender-specific fields */}
        {isBartender && (
          <>
            {/* Payment Links */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Payment Usernames</h2>
              <p className="text-white/50 text-sm">Add your usernames so customers can send tips</p>
              <div className="space-y-2">
                <Label className="text-white/80">Venmo Username</Label>
                <Input
                  value={venmoLink}
                  onChange={(e) => setVenmoLink(e.target.value)}
                  placeholder="@yourname"
                  className="input-dark"
                  data-testid="venmo-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">Cash App Username</Label>
                <Input
                  value={cashappLink}
                  onChange={(e) => setCashappLink(e.target.value)}
                  placeholder="$yourname"
                  className="input-dark"
                  data-testid="cashapp-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80">PayPal Username</Label>
                <Input
                  value={paypalLink}
                  onChange={(e) => setPaypalLink(e.target.value)}
                  placeholder="yourname"
                  className="input-dark"
                  data-testid="paypal-input"
                />
              </div>
            </div>

            {/* Work Locations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Work Locations
                </h2>
                <Button onClick={addLocation} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </div>

              {locations.map((loc, locIndex) => (
                <div key={loc.id || locIndex} className="glass-card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-white font-medium">Location {locIndex + 1}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeLocation(locIndex)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Bar/Venue Name</Label>
                    <Input
                      value={loc.name}
                      onChange={(e) => updateLocation(locIndex, "name", e.target.value)}
                      placeholder="The Golden Tap"
                      className="input-dark"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Address</Label>
                    <Input
                      value={loc.address}
                      onChange={(e) => updateLocation(locIndex, "address", e.target.value)}
                      placeholder="123 Main St, City, State"
                      className="input-dark"
                    />
                  </div>

                  {/* Schedule */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-white/80 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Schedule
                      </Label>
                      <Button onClick={() => addSchedule(locIndex)} size="sm" variant="ghost" className="text-primary text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Shift
                      </Button>
                    </div>
                    {loc.schedule?.map((s, sIndex) => (
                      <div key={sIndex} className="flex gap-2 items-center">
                        <select
                          value={s.day}
                          onChange={(e) => updateSchedule(locIndex, sIndex, "day", e.target.value)}
                          className="flex-1 input-dark h-10 px-3 rounded-lg"
                        >
                          {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <Input
                          type="time"
                          value={s.start}
                          onChange={(e) => updateSchedule(locIndex, sIndex, "start", e.target.value)}
                          className="input-dark w-24"
                        />
                        <span className="text-white/40">to</span>
                        <Input
                          type="time"
                          value={s.end}
                          onChange={(e) => updateSchedule(locIndex, sIndex, "end", e.target.value)}
                          className="input-dark w-24"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeSchedule(locIndex, sIndex)}
                          className="text-white/40 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Happy Hours */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-secondary flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Happy Hours
                      </Label>
                      <Button onClick={() => addHappyHour(locIndex)} size="sm" variant="ghost" className="text-secondary text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        Add Happy Hour
                      </Button>
                    </div>
                    {loc.happy_hours?.map((hh, hhIndex) => (
                      <div key={hhIndex} className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 space-y-2">
                        <div className="flex gap-2 items-center">
                          <select
                            value={hh.day}
                            onChange={(e) => updateHappyHour(locIndex, hhIndex, "day", e.target.value)}
                            className="flex-1 input-dark h-10 px-3 rounded-lg"
                          >
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <Input
                            type="time"
                            value={hh.start}
                            onChange={(e) => updateHappyHour(locIndex, hhIndex, "start", e.target.value)}
                            className="input-dark w-24"
                          />
                          <span className="text-white/40">to</span>
                          <Input
                            type="time"
                            value={hh.end}
                            onChange={(e) => updateHappyHour(locIndex, hhIndex, "end", e.target.value)}
                            className="input-dark w-24"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeHappyHour(locIndex, hhIndex)}
                            className="text-white/40 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          value={hh.description}
                          onChange={(e) => updateHappyHour(locIndex, hhIndex, "description", e.target.value)}
                          placeholder="General description (e.g., Half off all wells)"
                          className="input-dark"
                        />
                        
                        {/* Happy Hour Drinks */}
                        <div className="mt-3 pt-3 border-t border-secondary/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60 text-xs font-accent">Happy Hour Drinks</span>
                            <Button 
                              onClick={() => addHappyHourDrink(locIndex, hhIndex)} 
                              size="sm" 
                              variant="ghost" 
                              className="text-secondary text-xs h-6 px-2"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Drink
                            </Button>
                          </div>
                          {hh.drinks?.map((drink, drinkIndex) => (
                            <div key={drink.id || drinkIndex} className="p-2 rounded-lg bg-black/20 mb-2 space-y-2">
                              <div className="flex gap-2 items-center">
                                <Input
                                  value={drink.name}
                                  onChange={(e) => updateHappyHourDrink(locIndex, hhIndex, drinkIndex, "name", e.target.value)}
                                  placeholder="Drink name"
                                  className="input-dark flex-1 h-9 text-sm"
                                />
                                <Input
                                  value={drink.price}
                                  onChange={(e) => updateHappyHourDrink(locIndex, hhIndex, drinkIndex, "price", e.target.value)}
                                  placeholder="$5"
                                  className="input-dark w-20 h-9 text-sm"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeHappyHourDrink(locIndex, hhIndex, drinkIndex)}
                                  className="text-white/40 hover:text-red-400 h-9 w-9"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <Input
                                value={drink.ingredients}
                                onChange={(e) => updateHappyHourDrink(locIndex, hhIndex, drinkIndex, "ingredients", e.target.value)}
                                placeholder="Ingredients (e.g., Tequila, lime, triple sec)"
                                className="input-dark h-9 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Signature Drinks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-primary flex items-center gap-2">
                        <GlassWater className="w-4 h-4" />
                        Signature Drinks
                      </Label>
                      <Button 
                        onClick={() => addSignatureDrink(locIndex)} 
                        size="sm" 
                        variant="ghost" 
                        className="text-primary text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Drink
                      </Button>
                    </div>
                    {loc.signature_drinks?.map((drink, drinkIndex) => (
                      <div key={drink.id || drinkIndex} className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                        <div className="flex gap-2 items-center">
                          <Input
                            value={drink.name}
                            onChange={(e) => updateSignatureDrink(locIndex, drinkIndex, "name", e.target.value)}
                            placeholder="Drink name"
                            className="input-dark flex-1"
                          />
                          <Input
                            value={drink.price}
                            onChange={(e) => updateSignatureDrink(locIndex, drinkIndex, "price", e.target.value)}
                            placeholder="$12"
                            className="input-dark w-24"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeSignatureDrink(locIndex, drinkIndex)}
                            className="text-white/40 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          value={drink.ingredients}
                          onChange={(e) => updateSignatureDrink(locIndex, drinkIndex, "ingredients", e.target.value)}
                          placeholder="Ingredients (e.g., Bourbon, bitters, orange peel, sugar)"
                          className="input-dark"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Blocked Users */}
        <Button 
          onClick={() => navigate("/followers")}
          variant="outline"
          className="w-full border-white/20 text-white/70 hover:bg-white/5"
          data-testid="blocked-users-btn"
        >
          <Shield className="w-4 h-4 mr-2" />
          Manage Blocked Users
        </Button>

        {/* Legal & Policies */}
        <div className="glass-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Legal & Policies
          </h2>
          <Link 
            to="/privacy" 
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            data-testid="privacy-policy-link"
          >
            <ScrollText className="w-5 h-5 text-white/60" />
            <span className="text-white/80">Privacy Policy</span>
          </Link>
          <Link 
            to="/terms" 
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            data-testid="terms-of-use-link"
          >
            <FileText className="w-5 h-5 text-white/60" />
            <span className="text-white/80">Terms of Use</span>
          </Link>
          <Link 
            to="/safety" 
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            data-testid="safety-standards-link"
          >
            <ShieldCheck className="w-5 h-5 text-white/60" />
            <span className="text-white/80">Safety Standards</span>
          </Link>
        </div>

        {/* Logout */}
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-400/50 text-red-400 hover:bg-red-400/10"
          data-testid="logout-btn"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>

        {/* Delete Account */}
        <Button 
          onClick={() => setShowDeleteConfirm(true)}
          variant="outline"
          className="w-full border-red-600/50 text-red-500 hover:bg-red-600/10"
          data-testid="delete-account-btn"
        >
          <UserX className="w-4 h-4 mr-2" />
          Delete Account
        </Button>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="bg-[#0a0a0a] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete your account?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                This action cannot be undone. This will permanently delete your account, 
                all your messages, followers, and remove your profile from PourCircle.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default EditProfile;
