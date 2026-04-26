import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API, WEB_URL } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Trash2, Users, Flag, Search, Shield, RefreshCw, ShieldCheck, ShieldOff, Store, Plus, Copy, Check, X, Eye, EyeOff, ChevronDown, ChevronUp, MapPin, ExternalLink, Building2 } from "lucide-react";
import { toast } from "sonner";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  
  // Create vendor state
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [createdVendor, setCreatedVendor] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [loadingVendorDetails, setLoadingVendorDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes, vendorsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/reports`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/vendors`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setReports(reportsRes.data);
      setVendors(vendorsRes.data);
    } catch (e) {
      if (e.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete @${username}? This cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`${API}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`User @${username} deleted`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to delete user");
    }
  };

  const handlePromoteUser = async (userId, username) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/promote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`@${username} is now an admin`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: true } : u));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to promote user");
    }
  };

  const handleDemoteUser = async (userId, username) => {
    if (!confirm(`Remove admin access from @${username}?`)) {
      return;
    }
    try {
      await axios.post(`${API}/admin/users/${userId}/demote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`@${username} is no longer an admin`);
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: false } : u));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to demote user");
    }
  };

  const isUserAdmin = (u) => u.is_admin || u.is_master_admin;

  // Vendor functions
  const handleCreateVendor = async () => {
    if (!newVendor.name || !newVendor.email || !newVendor.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setCreatingVendor(true);
    try {
      const response = await axios.post(`${API}/admin/vendors`, newVendor, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Store created vendor info for email template
      setCreatedVendor({
        ...response.data.vendor,
        password: newVendor.password // Keep password for email template
      });
      
      toast.success("Vendor created successfully!");
      setShowCreateVendor(false);
      setNewVendor({ name: "", email: "", password: "" });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to create vendor");
    } finally {
      setCreatingVendor(false);
    }
  };

  const handleToggleVendor = async (vendorId, currentStatus) => {
    try {
      await axios.put(`${API}/admin/vendors/${vendorId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(currentStatus ? "Vendor disabled" : "Vendor enabled");
      fetchData();
    } catch (e) {
      toast.error("Failed to update vendor status");
    }
  };

  const fetchVendorDetails = async (vendorId) => {
    if (expandedVendor === vendorId) {
      setExpandedVendor(null);
      setVendorDetails(null);
      return;
    }
    
    setExpandedVendor(vendorId);
    setLoadingVendorDetails(true);
    try {
      const response = await axios.get(`${API}/admin/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendorDetails(response.data);
    } catch (e) {
      toast.error("Failed to load vendor details");
    } finally {
      setLoadingVendorDetails(false);
    }
  };

  const getLocationUrl = (locationId) => {
    const baseUrl = WEB_URL || window.location.origin;
    return `${baseUrl}/venue/${locationId}`;
  };

  const getVendorLoginUrl = () => {
    // Use the web URL base for the vendor login
    const baseUrl = WEB_URL || window.location.origin;
    return `${baseUrl}/vendor/login`;
  };

  const generateEmailTemplate = () => {
    if (!createdVendor) return "";
    
    const loginUrl = getVendorLoginUrl();
    
    return `Subject: Welcome to PourCircle - Your Vendor Portal Access

Hi ${createdVendor.name} Team,

Welcome to PourCircle! Your vendor account has been created and you can now access your Vendor Portal to manage your venue.

🔗 VENDOR PORTAL LOGIN
${loginUrl}

📧 YOUR LOGIN CREDENTIALS
Email: ${createdVendor.email}
Password: ${createdVendor.password}

🚀 GETTING STARTED
1. Log in to your Vendor Portal using the link above
2. Upload your venue logo
3. Set your default hours and menus
4. Add your locations
5. Link your bartender Stars by searching their username

Once you've set up your page, your customers can find and follow your locations in the PourCircle app!

If you have any questions, please reply to this email.

Cheers,
The PourCircle Team`;
  };

  const copyEmailTemplate = () => {
    const template = generateEmailTemplate();
    navigator.clipboard.writeText(template);
    setCopiedEmail(true);
    toast.success("Email template copied to clipboard!");
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Dashboard
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={fetchData}
            className="text-white/70 hover:text-white"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="px-4 py-4 grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-white/60 text-sm">Users</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Store className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{vendors.length}</p>
          <p className="text-white/60 text-sm">Vendors</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Flag className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{reports.length}</p>
          <p className="text-white/60 text-sm">Reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "btn-primary" : "border-white/20 text-white"}
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button
            variant={activeTab === "vendors" ? "default" : "outline"}
            onClick={() => setActiveTab("vendors")}
            className={activeTab === "vendors" ? "btn-primary" : "border-white/20 text-white"}
          >
            <Store className="w-4 h-4 mr-2" />
            Vendors
          </Button>
          <Button
            variant={activeTab === "reports" ? "default" : "outline"}
            onClick={() => setActiveTab("reports")}
            className={activeTab === "reports" ? "btn-primary" : "border-white/20 text-white"}
          >
            <Flag className="w-4 h-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {activeTab === "users" && (
        <>
          {/* Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="px-4 space-y-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={u.profile_image} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {u.name?.charAt(0) || u.username?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{u.name || "No name"}</p>
                        {isUserAdmin(u) && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                            <Shield className="w-3 h-3" />
                            {u.is_master_admin ? "Master" : "Admin"}
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">@{u.username}</p>
                      <p className="text-white/40 text-xs">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.role === "bartender" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                    }`}>
                      {u.role}
                    </span>
                    <div className="flex items-center gap-1">
                      {!u.is_master_admin && (
                        isUserAdmin(u) ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDemoteUser(u.id, u.username)}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                            title="Remove admin access"
                          >
                            <ShieldOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePromoteUser(u.id, u.username)}
                            className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            title="Make admin"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </Button>
                        )
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        title="Delete user"
                        disabled={u.is_master_admin}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-white/40">
                  <span>Followers: {u.followers?.length || 0}</span>
                  <span>Following: {u.following?.length || 0}</span>
                  <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <p className="text-center text-white/60 py-8">No users found</p>
            )}
          </div>
        </>
      )}

      {activeTab === "reports" && (
        <div className="px-4 space-y-3">
          {reports.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Flag className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No reports yet</p>
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="glass-card p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-orange-400/20 text-orange-400 text-xs rounded-full">
                    {r.reason}
                  </span>
                  <span className="text-white/40 text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white text-sm">
                  <span className="text-white/60">Reporter:</span> @{r.reporter_username}
                </p>
                <p className="text-white text-sm">
                  <span className="text-white/60">Reported:</span> @{r.reported_username}
                </p>
                {r.details && (
                  <p className="text-white/60 text-sm mt-2">{r.details}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "vendors" && (
        <div className="px-4 space-y-4">
          {/* Create Vendor Button */}
          <Button 
            onClick={() => setShowCreateVendor(true)} 
            className="w-full btn-primary"
            data-testid="create-vendor-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Vendor
          </Button>

          {/* Create Vendor Form */}
          {showCreateVendor && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Create Vendor</h3>
                <button onClick={() => setShowCreateVendor(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Venue Name *</Label>
                  <Input
                    value={newVendor.name}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                    className="input-dark"
                    placeholder="The Blue Bar"
                    data-testid="vendor-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Email *</Label>
                  <Input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                    className="input-dark"
                    placeholder="vendor@example.com"
                    data-testid="vendor-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newVendor.password}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, password: e.target.value }))}
                      className="input-dark pr-10"
                      placeholder="Temporary password"
                      data-testid="vendor-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateVendor} 
                  disabled={creatingVendor}
                  className="w-full btn-primary"
                  data-testid="submit-vendor-btn"
                >
                  {creatingVendor ? "Creating..." : "Create Vendor"}
                </Button>
              </div>
            </div>
          )}

          {/* Email Template (shown after creating vendor) */}
          {createdVendor && (
            <div className="glass-card p-6 space-y-4 border-2 border-green-500/30">
              <div className="flex items-center justify-between">
                <h3 className="text-green-400 font-semibold flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Vendor Created! Copy Email Template
                </h3>
                <button onClick={() => setCreatedVendor(null)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-black/40 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono">
                  {generateEmailTemplate()}
                </pre>
              </div>
              <Button 
                onClick={copyEmailTemplate}
                className={copiedEmail ? "w-full bg-green-500 hover:bg-green-600" : "w-full btn-primary"}
                data-testid="copy-email-btn"
              >
                {copiedEmail ? (
                  <><Check className="w-4 h-4 mr-2" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy Email Template</>
                )}
              </Button>
            </div>
          )}

          {/* Vendors List */}
          <div className="space-y-3">
            {vendors.map((v) => (
              <div key={v.id} className="glass-card overflow-hidden">
                {/* Vendor Header - Clickable */}
                <button
                  onClick={() => fetchVendorDetails(v.id)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                  data-testid={`vendor-expand-${v.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{v.name}</p>
                        <p className="text-white/60 text-sm">{v.email}</p>
                        <p className="text-white/40 text-xs">@{v.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          v.is_active !== false ? "bg-green-400/20 text-green-400" : "bg-red-400/20 text-red-400"
                        }`}>
                          {v.is_active !== false ? "Active" : "Disabled"}
                        </span>
                        <p className="text-white/40 text-xs mt-1">
                          {v.location_count || 0} location{(v.location_count || 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {expandedVendor === v.id ? (
                        <ChevronUp className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Vendor Details */}
                {expandedVendor === v.id && (
                  <div className="border-t border-white/10 p-4 bg-white/5">
                    {loadingVendorDetails ? (
                      <div className="flex justify-center py-4">
                        <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                      </div>
                    ) : vendorDetails ? (
                      <div className="space-y-4">
                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/vendor/${v.id}`);
                            }}
                            className="btn-primary"
                          >
                            <Store className="w-4 h-4 mr-1" />
                            Manage Vendor
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVendor(v.id, v.is_active !== false);
                            }}
                            className={v.is_active !== false 
                              ? "border-red-400/30 text-red-400 hover:bg-red-400/10" 
                              : "border-green-400/30 text-green-400 hover:bg-green-400/10"
                            }
                          >
                            {v.is_active !== false ? "Disable Vendor" : "Enable Vendor"}
                          </Button>
                        </div>

                        {/* Locations */}
                        <div>
                          <h4 className="text-white font-medium flex items-center gap-2 mb-3">
                            <Building2 className="w-4 h-4 text-primary" />
                            Locations ({vendorDetails.locations?.length || 0})
                          </h4>
                          {vendorDetails.locations?.length > 0 ? (
                            <div className="space-y-2">
                              {vendorDetails.locations.map((loc) => (
                                <div 
                                  key={loc.id} 
                                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <div>
                                      <p className="text-white font-medium text-sm">{loc.name}</p>
                                      <p className="text-white/50 text-xs">{loc.address}</p>
                                      <p className="text-white/40 text-xs">{loc.followers?.length || 0} followers</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(getLocationUrl(loc.id), '_blank');
                                    }}
                                    className="border-white/20 text-white hover:bg-white/10"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View Profile
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/40 text-sm">No locations added yet</p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
            {vendors.length === 0 && (
              <div className="glass-card p-8 text-center">
                <Store className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No vendors yet. Create one above!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
