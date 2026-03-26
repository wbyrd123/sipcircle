import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { Home, Search, MessageCircle, Calendar, User } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isBartender = user?.role === "bartender";

  const navItems = isBartender ? [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: User, label: "Profile", path: "/edit-profile" }
  ] : [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Search, label: "Discover", path: "/discover" },
    { icon: Calendar, label: "Invites", path: "/invites" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
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
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive(item.path) ? "text-primary" : "text-white/40 hover:text-white/60"
            }`}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
