import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ArrowLeft, Trash2, Users, Flag, Search, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/reports`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setReports(reportsRes.data);
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
      <div className="px-4 py-4 grid grid-cols-2 gap-4">
        <div className="glass-card p-4 text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{users.length}</p>
          <p className="text-white/60 text-sm">Total Users</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Flag className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{reports.length}</p>
          <p className="text-white/60 text-sm">Reports</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className={activeTab === "users" ? "btn-primary" : "border-white/20 text-white"}
          >
            <Users className="w-4 h-4 mr-2" />
            Users
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
                      <p className="text-white font-medium">{u.name || "No name"}</p>
                      <p className="text-white/60 text-sm">@{u.username}</p>
                      <p className="text-white/40 text-xs">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.role === "bartender" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                    }`}>
                      {u.role}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
    </div>
  );
};

export default AdminPage;
