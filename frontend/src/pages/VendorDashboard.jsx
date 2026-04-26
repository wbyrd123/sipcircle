import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API, WEB_URL } from "../App";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { 
  Store, MapPin, Clock, Menu, Users, LogOut, Camera, Plus, Trash2, 
  Save, ChevronDown, Search, X, ExternalLink, Loader2, Building2, QrCode, Download, Bell, Send
} from "lucide-react";
import { toast } from "sonner";
import PlaceAutocomplete from "../components/PlaceAutocomplete";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "../components/ui/alert-dialog";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("master"); // master, locations, stars
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Master page state
  const [masterName, setMasterName] = useState("");
  const [masterHours, setMasterHours] = useState([]);
  const [masterMenus, setMasterMenus] = useState([]);
  
  // Location state
  const [locationData, setLocationData] = useState({});
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", address: "", zip_code: "", phone: "", latitude: null, longitude: null });
  const [useManualAddress, setUseManualAddress] = useState(false);
  
  // Stars state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locationStars, setLocationStars] = useState([]);
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Notification state
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  
  const fileInputRef = useRef(null);
  const qrRef = useRef(null);
  const token = localStorage.getItem("pourcircle_vendor_token");

  useEffect(() => {
    if (!token) {
      navigate("/vendor/login");
      return;
    }
    fetchVendorData();
  }, [token]);

  const fetchVendorData = async () => {
    try {
      const [vendorRes, notifRes] = await Promise.all([
        axios.get(`${API}/vendor/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/vendor/notification-status`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setVendor(vendorRes.data);
      setMasterName(vendorRes.data.name || "");
      setMasterHours(vendorRes.data.hours || []);
      setMasterMenus(vendorRes.data.menus || []);
      setNotificationStatus(notifRes.data);
      
      if (vendorRes.data.locations?.length > 0) {
        setSelectedLocation(vendorRes.data.locations[0]);
        setLocationData(vendorRes.data.locations[0]);
      }
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("pourcircle_vendor_token");
        localStorage.removeItem("pourcircle_vendor");
        navigate("/vendor/login");
      }
      toast.error("Failed to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pourcircle_vendor_token");
    localStorage.removeItem("pourcircle_vendor");
    navigate("/vendor/login");
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `https://emergent-apps.storage.googleapis.com/${path}`;
  };

  const getLocationUrl = (locationId) => {
    const baseUrl = WEB_URL || window.location.origin;
    return `${baseUrl}/venue/${locationId}`;
  };

  const downloadQRCode = (locationId, locationName) => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) {
      toast.error("QR code not found");
      return;
    }

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    // Set canvas size (larger for better print quality)
    canvas.width = 1024;
    canvas.height = 1024;
    
    img.onload = () => {
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code centered with padding
      const padding = 64;
      ctx.drawImage(img, padding, padding, canvas.width - (padding * 2), canvas.height - (padding * 2));
      
      // Convert to PNG and download
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${locationName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success("QR code downloaded!");
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // ===================== MASTER PAGE FUNCTIONS =====================
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post(`${API}/vendor/logo`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setVendor(prev => ({ ...prev, logo: response.data.path }));
      toast.success("Logo updated");
    } catch (e) {
      toast.error("Failed to upload logo");
    }
  };

  const saveMasterPage = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/vendor/master-page`, {
        name: masterName,
        hours: masterHours,
        menus: masterMenus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Master page saved");
      fetchVendorData();
    } catch (e) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addHoursEntry = () => {
    setMasterHours([...masterHours, { day: "Monday", open: "09:00", close: "17:00" }]);
  };

  const updateHours = (index, field, value) => {
    const updated = [...masterHours];
    updated[index][field] = value;
    setMasterHours(updated);
  };

  const removeHours = (index) => {
    setMasterHours(masterHours.filter((_, i) => i !== index));
  };

  const addMenuEntry = () => {
    setMasterMenus([...masterMenus, { type: "link", name: "", url: "", items: [] }]);
  };

  const updateMenu = (index, field, value) => {
    const updated = [...masterMenus];
    updated[index][field] = value;
    setMasterMenus(updated);
  };

  const removeMenu = (index) => {
    setMasterMenus(masterMenus.filter((_, i) => i !== index));
  };

  // ===================== LOCATION FUNCTIONS =====================
  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.address || !newLocation.zip_code) {
      toast.error("Please fill in required fields");
      return;
    }
    
    setSaving(true);
    try {
      const response = await axios.post(`${API}/vendor/locations`, newLocation, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Location added");
      setShowAddLocation(false);
      setNewLocation({ name: "", address: "", zip_code: "", phone: "", latitude: null, longitude: null });
      setUseManualAddress(false);
      fetchVendorData();
    } catch (e) {
      toast.error("Failed to add location");
    } finally {
      setSaving(false);
    }
  };

  const saveLocationChanges = async () => {
    if (!selectedLocation) return;
    
    setSaving(true);
    try {
      await axios.put(`${API}/vendor/locations/${selectedLocation.id}`, {
        name: locationData.name,
        address: locationData.address,
        zip_code: locationData.zip_code,
        phone: locationData.phone,
        hours: locationData.hours,
        menus: locationData.menus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Location saved");
      fetchVendorData();
    } catch (e) {
      toast.error("Failed to save location");
    } finally {
      setSaving(false);
    }
  };

  const deleteLocation = async () => {
    if (!deleteConfirm) return;
    
    try {
      await axios.delete(`${API}/vendor/locations/${deleteConfirm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Location deleted");
      setDeleteConfirm(null);
      fetchVendorData();
    } catch (e) {
      toast.error("Failed to delete location");
    }
  };

  const updateLocationData = (field, value) => {
    setLocationData(prev => ({ ...prev, [field]: value }));
  };

  // ===================== NOTIFICATION FUNCTIONS =====================
  const getTimeUntilAvailable = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date - now;
    if (diffMs <= 0) return null;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const sendNotification = async (locationId = null) => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      toast.error("Please enter a title and message");
      return;
    }
    
    setSendingNotification(true);
    try {
      const payload = {
        title: notificationTitle,
        body: notificationBody
      };
      if (locationId) {
        payload.location_id = locationId;
      }
      
      const response = await axios.post(`${API}/vendor/send-notification`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Notification sent to ${response.data.recipients} followers!`);
      setNotificationTitle("");
      setNotificationBody("");
      setShowNotificationForm(false);
      
      // Refresh notification status
      const notifRes = await axios.get(`${API}/vendor/notification-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotificationStatus(notifRes.data);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  const addLocationHours = () => {
    const hours = locationData.hours || [];
    updateLocationData("hours", [...hours, { day: "Monday", open: "09:00", close: "17:00" }]);
  };

  const updateLocationHours = (index, field, value) => {
    const hours = [...(locationData.hours || [])];
    hours[index][field] = value;
    updateLocationData("hours", hours);
  };

  const removeLocationHours = (index) => {
    const hours = (locationData.hours || []).filter((_, i) => i !== index);
    updateLocationData("hours", hours);
  };

  const addLocationMenu = () => {
    const menus = locationData.menus || [];
    updateLocationData("menus", [...menus, { type: "link", name: "", url: "", items: [] }]);
  };

  const updateLocationMenu = (index, field, value) => {
    const menus = [...(locationData.menus || [])];
    menus[index][field] = value;
    updateLocationData("menus", menus);
  };

  const removeLocationMenu = (index) => {
    const menus = (locationData.menus || []).filter((_, i) => i !== index);
    updateLocationData("menus", menus);
  };

  // ===================== STARS FUNCTIONS =====================
  const searchBartenders = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await axios.get(`${API}/vendor/search-bartenders?username=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setSearching(false);
    }
  };

  const fetchLocationStars = async (locationId) => {
    try {
      const response = await axios.get(`${API}/vendor/locations/${locationId}/stars`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocationStars(response.data);
    } catch (e) {
      console.error("Failed to fetch stars:", e);
    }
  };

  useEffect(() => {
    if (selectedLocation && activeTab === "stars") {
      fetchLocationStars(selectedLocation.id);
    }
  }, [selectedLocation, activeTab]);

  const addStar = async (bartenderId) => {
    if (!selectedLocation) {
      toast.error("Please select a location first");
      return;
    }
    
    try {
      await axios.post(`${API}/vendor/locations/${selectedLocation.id}/stars/${bartenderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Star added");
      setSearchQuery("");
      setSearchResults([]);
      fetchLocationStars(selectedLocation.id);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to add star");
    }
  };

  const removeStar = async (bartenderId) => {
    try {
      await axios.delete(`${API}/vendor/locations/${selectedLocation.id}/stars/${bartenderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Star removed");
      fetchLocationStars(selectedLocation.id);
    } catch (e) {
      toast.error("Failed to remove star");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={getImageUrl(vendor?.logo)} />
              <AvatarFallback className="bg-primary/20 text-primary">
                <Store className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-white font-semibold">{vendor?.name}</h1>
              <p className="text-white/50 text-sm">Vendor Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white/60 hover:text-white">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["master", "locations", "stars"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === "master" && <><Store className="w-4 h-4 inline mr-2" />Master Page</>}
              {tab === "locations" && <><Building2 className="w-4 h-4 inline mr-2" />Locations</>}
              {tab === "stars" && <><Users className="w-4 h-4 inline mr-2" />Stars</>}
            </button>
          ))}
        </div>

        {/* Location Selector (for locations and stars tabs) */}
        {(activeTab === "locations" || activeTab === "stars") && vendor?.locations?.length > 0 && (
          <div className="glass-card p-4">
            <Label className="text-white/80 mb-2 block">Select Location</Label>
            <div className="relative">
              <select
                value={selectedLocation?.id || ""}
                onChange={(e) => {
                  const loc = vendor.locations.find(l => l.id === e.target.value);
                  setSelectedLocation(loc);
                  setLocationData(loc || {});
                }}
                className="w-full bg-white/5 text-white rounded-lg px-4 py-3 border border-white/10 appearance-none cursor-pointer"
                data-testid="location-selector"
              >
                {vendor.locations.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-gray-900">
                    {loc.name} - {loc.address}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>
          </div>
        )}

        {/* MASTER PAGE TAB */}
        {activeTab === "master" && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Venue Logo
              </h2>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={getImageUrl(vendor?.logo)} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    <Store className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-white/20 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Venue Name</h2>
              <Input
                value={masterName}
                onChange={(e) => setMasterName(e.target.value)}
                className="input-dark"
                placeholder="Your venue name"
                data-testid="master-name-input"
              />
            </div>

            {/* Hours */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Default Hours
                </h2>
                <Button size="sm" onClick={addHoursEntry} className="btn-primary">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <p className="text-white/50 text-sm mb-4">These hours will be used as defaults for all locations.</p>
              <div className="space-y-3">
                {masterHours.map((h, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-wrap">
                    <select
                      value={h.day}
                      onChange={(e) => updateHours(idx, "day", e.target.value)}
                      className="bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10"
                    >
                      {DAYS.map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                    </select>
                    <Input
                      type="time"
                      value={h.open}
                      onChange={(e) => updateHours(idx, "open", e.target.value)}
                      className="input-dark w-28"
                    />
                    <span className="text-white/40">to</span>
                    <Input
                      type="time"
                      value={h.close}
                      onChange={(e) => updateHours(idx, "close", e.target.value)}
                      className="input-dark w-28"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeHours(idx)} className="text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {masterHours.length === 0 && (
                  <p className="text-white/40 text-sm">No hours set. Click "Add" to add hours.</p>
                )}
              </div>
            </div>

            {/* Menus */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Menu className="w-5 h-5 text-primary" />
                  Default Menus
                </h2>
                <Button size="sm" onClick={addMenuEntry} className="btn-primary">
                  <Plus className="w-4 h-4 mr-1" /> Add Menu
                </Button>
              </div>
              <div className="space-y-4">
                {masterMenus.map((menu, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={menu.name}
                        onChange={(e) => updateMenu(idx, "name", e.target.value)}
                        className="input-dark flex-1"
                        placeholder="Menu name (e.g., Food Menu, Drink Menu)"
                      />
                      <Button size="icon" variant="ghost" onClick={() => removeMenu(idx)} className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={menu.type}
                        onChange={(e) => updateMenu(idx, "type", e.target.value)}
                        className="bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10"
                      >
                        <option value="link" className="bg-gray-900">Link to Website</option>
                        <option value="manual" className="bg-gray-900">Manual Entry</option>
                      </select>
                    </div>
                    {menu.type === "link" && (
                      <Input
                        value={menu.url || ""}
                        onChange={(e) => updateMenu(idx, "url", e.target.value)}
                        className="input-dark"
                        placeholder="https://yourwebsite.com/menu"
                      />
                    )}
                    {menu.type === "manual" && (
                      <Textarea
                        value={menu.content || ""}
                        onChange={(e) => updateMenu(idx, "content", e.target.value)}
                        className="input-dark min-h-[100px]"
                        placeholder="Enter menu items, descriptions, prices..."
                      />
                    )}
                  </div>
                ))}
                {masterMenus.length === 0 && (
                  <p className="text-white/40 text-sm">No menus added. Click "Add Menu" to add one.</p>
                )}
              </div>
            </div>

            {/* Push Notifications - Master (All Followers) */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Send Notification to All Followers
                </h2>
                {notificationStatus?.master?.notification_available ? (
                  <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">Available</span>
                ) : (
                  <span className="px-2 py-1 bg-orange-400/20 text-orange-400 text-xs rounded-full">
                    Available in {getTimeUntilAvailable(notificationStatus?.master?.next_available)}
                  </span>
                )}
              </div>
              <p className="text-white/50 text-sm mb-4">
                Send a push notification to all {notificationStatus?.master?.total_follower_count || 0} followers across all locations. 
                <span className="text-white/40"> (Limit: 1 per week)</span>
              </p>
              
              {notificationStatus?.master?.notification_available ? (
                <div className="space-y-3">
                  <Input
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="input-dark"
                    placeholder="Notification title (e.g., Happy Hour Alert!)"
                    maxLength={50}
                  />
                  <Textarea
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    className="input-dark"
                    placeholder="Your message to followers..."
                    rows={3}
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-xs">{notificationBody.length}/200 characters</span>
                    <Button
                      onClick={() => sendNotification(null)}
                      disabled={sendingNotification || !notificationTitle.trim() || !notificationBody.trim()}
                      className="btn-primary"
                      data-testid="send-master-notification"
                    >
                      {sendingNotification ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send to All Followers
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center py-4">
                  You've already sent a notification this week. Next available: {getTimeUntilAvailable(notificationStatus?.master?.next_available)}
                </p>
              )}
            </div>

            {/* Save Button */}
            <Button onClick={saveMasterPage} disabled={saving} className="w-full btn-primary" data-testid="save-master">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Master Page
            </Button>
          </div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab === "locations" && (
          <div className="space-y-6">
            {/* Add Location Button */}
            <Button onClick={() => setShowAddLocation(true)} className="w-full btn-secondary" data-testid="add-location-btn">
              <Plus className="w-4 h-4 mr-2" /> Add New Location
            </Button>

            {/* Add Location Form */}
            {showAddLocation && (
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Add New Location</h3>
                  <button onClick={() => { setShowAddLocation(false); setUseManualAddress(false); }} className="text-white/40 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Location Name *</Label>
                    <Input
                      value={newLocation.name}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                      className="input-dark"
                      placeholder="e.g., Downtown, Uptown"
                      data-testid="new-location-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Phone</Label>
                    <Input
                      value={newLocation.phone}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-dark"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  {/* Address with Google Maps Autocomplete */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-white/80">Address *</Label>
                      <button
                        type="button"
                        onClick={() => setUseManualAddress(!useManualAddress)}
                        className="text-primary text-xs hover:underline"
                      >
                        {useManualAddress ? "Use search" : "Enter manually"}
                      </button>
                    </div>
                    {useManualAddress ? (
                      <Input
                        value={newLocation.address}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, address: e.target.value }))}
                        className="input-dark"
                        placeholder="123 Main Street, City, State"
                        data-testid="new-location-address"
                      />
                    ) : (
                      <PlaceAutocomplete
                        placeholder="Search for address..."
                        onPlaceSelect={(place) => {
                          setNewLocation(prev => ({
                            ...prev,
                            address: place.address,
                            latitude: place.lat,
                            longitude: place.lng
                          }));
                        }}
                      />
                    )}
                    {newLocation.address && !useManualAddress && (
                      <p className="text-white/50 text-xs mt-1">Selected: {newLocation.address}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white/80">ZIP Code *</Label>
                    <Input
                      value={newLocation.zip_code}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, zip_code: e.target.value }))}
                      className="input-dark"
                      placeholder="12345"
                      data-testid="new-location-zip"
                    />
                  </div>
                </div>
                <Button onClick={handleAddLocation} disabled={saving} className="btn-primary" data-testid="submit-new-location">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Location
                </Button>
              </div>
            )}

            {/* Selected Location Edit */}
            {selectedLocation && !showAddLocation && (
              <div className="space-y-6">
                {/* View Profile Button */}
                <Button
                  onClick={() => window.open(getLocationUrl(selectedLocation.id), '_blank')}
                  variant="outline"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10"
                  data-testid="view-location-profile"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>

                {/* Basic Info */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">Name</Label>
                      <Input
                        value={locationData.name || ""}
                        onChange={(e) => updateLocationData("name", e.target.value)}
                        className="input-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Phone</Label>
                      <Input
                        value={locationData.phone || ""}
                        onChange={(e) => updateLocationData("phone", e.target.value)}
                        className="input-dark"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-white/80">Address</Label>
                      <Input
                        value={locationData.address || ""}
                        onChange={(e) => updateLocationData("address", e.target.value)}
                        className="input-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">ZIP Code</Label>
                      <Input
                        value={locationData.zip_code || ""}
                        onChange={(e) => updateLocationData("zip_code", e.target.value)}
                        className="input-dark"
                      />
                    </div>
                  </div>
                </div>

                {/* Location-specific Hours */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Hours (Location Override)
                    </h3>
                    <Button size="sm" onClick={addLocationHours} className="btn-primary">
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  <p className="text-white/50 text-sm mb-4">
                    Leave empty to use master page defaults. Add entries to override for this location.
                  </p>
                  <div className="space-y-3">
                    {(locationData.hours || []).map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 flex-wrap">
                        <select
                          value={h.day}
                          onChange={(e) => updateLocationHours(idx, "day", e.target.value)}
                          className="bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10"
                        >
                          {DAYS.map(d => <option key={d} value={d} className="bg-gray-900">{d}</option>)}
                        </select>
                        <Input
                          type="time"
                          value={h.open}
                          onChange={(e) => updateLocationHours(idx, "open", e.target.value)}
                          className="input-dark w-28"
                        />
                        <span className="text-white/40">to</span>
                        <Input
                          type="time"
                          value={h.close}
                          onChange={(e) => updateLocationHours(idx, "close", e.target.value)}
                          className="input-dark w-28"
                        />
                        <Button size="icon" variant="ghost" onClick={() => removeLocationHours(idx)} className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {(!locationData.hours || locationData.hours.length === 0) && (
                      <p className="text-white/40 text-sm italic">Using master page defaults</p>
                    )}
                  </div>
                </div>

                {/* Location-specific Menus */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Menu className="w-5 h-5 text-primary" />
                      Menus (Location Override)
                    </h3>
                    <Button size="sm" onClick={addLocationMenu} className="btn-primary">
                      <Plus className="w-4 h-4 mr-1" /> Add Menu
                    </Button>
                  </div>
                  <p className="text-white/50 text-sm mb-4">
                    Leave empty to use master page defaults. Add entries to override.
                  </p>
                  <div className="space-y-4">
                    {(locationData.menus || []).map((menu, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={menu.name}
                            onChange={(e) => updateLocationMenu(idx, "name", e.target.value)}
                            className="input-dark flex-1"
                            placeholder="Menu name"
                          />
                          <Button size="icon" variant="ghost" onClick={() => removeLocationMenu(idx)} className="text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <select
                          value={menu.type}
                          onChange={(e) => updateLocationMenu(idx, "type", e.target.value)}
                          className="bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10"
                        >
                          <option value="link" className="bg-gray-900">Link to Website</option>
                          <option value="manual" className="bg-gray-900">Manual Entry</option>
                        </select>
                        {menu.type === "link" && (
                          <Input
                            value={menu.url || ""}
                            onChange={(e) => updateLocationMenu(idx, "url", e.target.value)}
                            className="input-dark"
                            placeholder="https://yourwebsite.com/menu"
                          />
                        )}
                        {menu.type === "manual" && (
                          <Textarea
                            value={menu.content || ""}
                            onChange={(e) => updateLocationMenu(idx, "content", e.target.value)}
                            className="input-dark min-h-[100px]"
                            placeholder="Enter menu items..."
                          />
                        )}
                      </div>
                    ))}
                    {(!locationData.menus || locationData.menus.length === 0) && (
                      <p className="text-white/40 text-sm italic">Using master page defaults</p>
                    )}
                  </div>
                </div>

                {/* QR Code for Marketing */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-primary" />
                    Marketing QR Code
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    Download this QR code for flyers, table tents, or signage. Customers can scan it to follow your location on PourCircle.
                  </p>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div 
                      ref={qrRef}
                      className="bg-white p-4 rounded-xl"
                    >
                      <QRCodeSVG
                        value={getLocationUrl(selectedLocation.id)}
                        size={160}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-white/60 text-xs mb-1">Location URL</p>
                        <p className="text-white text-sm break-all font-mono">
                          {getLocationUrl(selectedLocation.id)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => downloadQRCode(selectedLocation.id, `${vendor?.name}-${locationData.name || 'location'}`)}
                        className="w-full btn-primary"
                        data-testid="download-qr-btn"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code (PNG)
                      </Button>
                      <p className="text-white/40 text-xs text-center">
                        High resolution (1024x1024) for print quality
                      </p>
                    </div>
                  </div>
                </div>

                {/* Push Notification - Location Specific */}
                {(() => {
                  const locStatus = notificationStatus?.locations?.find(l => l.id === selectedLocation.id);
                  return (
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <Bell className="w-5 h-5 text-primary" />
                          Send Notification to {locationData.name} Followers
                        </h3>
                        {locStatus?.notification_available ? (
                          <span className="px-2 py-1 bg-green-400/20 text-green-400 text-xs rounded-full">Available</span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-400/20 text-orange-400 text-xs rounded-full">
                            Available in {getTimeUntilAvailable(locStatus?.next_available)}
                          </span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm mb-4">
                        Notify {locStatus?.follower_count || 0} followers of this location.
                        <span className="text-white/40"> (Limit: 2 per month)</span>
                      </p>
                      
                      {locStatus?.notification_available ? (
                        <div className="space-y-3">
                          <Input
                            value={notificationTitle}
                            onChange={(e) => setNotificationTitle(e.target.value)}
                            className="input-dark"
                            placeholder="Notification title"
                            maxLength={50}
                          />
                          <Textarea
                            value={notificationBody}
                            onChange={(e) => setNotificationBody(e.target.value)}
                            className="input-dark"
                            placeholder="Your message..."
                            rows={3}
                            maxLength={200}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-white/40 text-xs">{notificationBody.length}/200 characters</span>
                            <Button
                              onClick={() => sendNotification(selectedLocation.id)}
                              disabled={sendingNotification || !notificationTitle.trim() || !notificationBody.trim()}
                              className="btn-primary"
                              data-testid="send-location-notification"
                            >
                              {sendingNotification ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4 mr-2" />
                              )}
                              Send Notification
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm text-center py-4">
                          Notification limit reached. Next available in {getTimeUntilAvailable(locStatus?.next_available)}.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Save & Delete Buttons */}
                <div className="flex gap-3">
                  <Button onClick={saveLocationChanges} disabled={saving} className="flex-1 btn-primary" data-testid="save-location">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Location
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setDeleteConfirm(selectedLocation.id)}
                    className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    data-testid="delete-location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {vendor?.locations?.length === 0 && !showAddLocation && (
              <div className="glass-card p-8 text-center">
                <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No locations yet. Add your first location above.</p>
              </div>
            )}
          </div>
        )}

        {/* STARS TAB */}
        {activeTab === "stars" && (
          <div className="space-y-6">
            {selectedLocation ? (
              <>
                {/* Search Bartenders */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Add Stars to {selectedLocation.name}
                  </h3>
                  <p className="text-white/50 text-sm mb-4">
                    Search for bartenders by username to add them as Stars at this location.
                  </p>
                  <div className="relative">
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchBartenders(e.target.value);
                      }}
                      className="input-dark"
                      placeholder="Search bartender username..."
                      data-testid="search-bartender-input"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                    )}
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {searchResults.map((bartender) => (
                        <div 
                          key={bartender.id} 
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={getImageUrl(bartender.profile_image)} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {bartender.name?.charAt(0) || "B"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">{bartender.name}</p>
                              <p className="text-white/50 text-sm">@{bartender.username}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addStar(bartender.id)}
                            className="btn-primary"
                            data-testid={`add-star-${bartender.username}`}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Stars */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Current Stars ({locationStars.length})
                  </h3>
                  {locationStars.length > 0 ? (
                    <div className="space-y-2">
                      {locationStars.map((star) => (
                        <div 
                          key={star.id} 
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={getImageUrl(star.profile_image)} />
                              <AvatarFallback className="bg-primary/20 text-primary">
                                {star.name?.charAt(0) || "B"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">{star.name}</p>
                              <p className="text-white/50 text-sm">@{star.username}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeStar(star.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            data-testid={`remove-star-${star.username}`}
                          >
                            <X className="w-4 h-4 mr-1" /> Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm">No Stars at this location yet. Search above to add bartenders.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="glass-card p-8 text-center">
                <Building2 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Please add a location first to manage Stars.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-gray-900 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Location?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete this location and remove all followers. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteLocation} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorDashboard;
