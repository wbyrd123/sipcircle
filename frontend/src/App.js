import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import BartenderDashboard from "./pages/BartenderDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import BartenderProfile from "./pages/BartenderProfile";
import EditProfile from "./pages/EditProfile";
import MessagesPage from "./pages/MessagesPage";
import ConversationPage from "./pages/ConversationPage";
import DiscoverPage from "./pages/DiscoverPage";
import InvitesPage from "./pages/InvitesPage";
import FollowersPage from "./pages/FollowersPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("sipcircle_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (e) {
          console.error("Auth error:", e);
          localStorage.removeItem("sipcircle_token");
          setToken(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (identifier, password) => {
    const response = await axios.post(`${API}/auth/login`, { identifier, password });
    localStorage.setItem("sipcircle_token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (data) => {
    const response = await axios.post(`${API}/auth/register`, data);
    localStorage.setItem("sipcircle_token", response.data.token);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem("sipcircle_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "bartender" ? "/dashboard" : "/home"} replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === "bartender" ? "/dashboard" : "/home"} /> : <LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to={user.role === "bartender" ? "/dashboard" : "/home"} /> : <AuthPage />} />
      
      {/* Bartender Routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["bartender"]}><BartenderDashboard /></ProtectedRoute>} />
      <Route path="/followers" element={<ProtectedRoute allowedRoles={["bartender"]}><FollowersPage /></ProtectedRoute>} />
      
      {/* Customer Routes */}
      <Route path="/home" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>} />
      
      {/* Shared Routes */}
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/messages/:partnerId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
      <Route path="/invites" element={<ProtectedRoute><InvitesPage /></ProtectedRoute>} />
      
      {/* Public Bartender Profile */}
      <Route path="/b/:username" element={<BartenderProfile />} />
      
      {/* Public Pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App min-h-screen bg-background">
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
