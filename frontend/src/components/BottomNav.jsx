import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, API } from "../App";
import axios from "axios";
import { Home, Search, Calendar, User, UserPlus, Store } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const [followRequestCount, setFollowRequestCount] = useState(0);

  const isBartender = user?.role === "bartender";

  // Fetch follow request count
  useEffect(() => {
    const fetchRequestCount = async () => {
      if (!token || !user?.require_follow_approval) return;
      try {
        const response = await axios.get(`${API}/follow-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFollowRequestCount(response.data.length);
      } catch (e) {
        console.error("Error fetching follow requests:", e);
      }
    };
    fetchRequestCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRequestCount, 30000);
    return () => clearInterval(interval);
  }, [token, user?.require_follow_approval]);

  const navItems = isBartender ? [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: Store, label: "Venues", path: "/venues" },
    { icon: UserPlus, label: "Requests", path: "/follow-requests", badge: followRequestCount },
    { icon: User, label: "Profile", path: "/edit-profile" }
  ] : [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: Store, label: "Venues", path: "/venues" },
    { icon: UserPlus, label: "Requests", path: "/follow-requests", badge: followRequestCount },
    { icon: User, label: "Profile", path: "/edit-profile" }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/5" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`relative flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive(item.path) ? "text-primary" : "text-white/40 hover:text-white/60"
            }`}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
