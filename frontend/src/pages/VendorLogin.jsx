import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Store, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const VendorLogin = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error("Please enter your credentials");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/vendor/auth/login`, {
        identifier,
        password
      });
      
      localStorage.setItem("pourcircle_vendor_token", response.data.token);
      localStorage.setItem("pourcircle_vendor", JSON.stringify(response.data.vendor));
      toast.success(`Welcome back, ${response.data.vendor.name}!`);
      navigate("/vendor/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Vendor Portal</h1>
          <p className="text-white/60 mt-2">Sign in to manage your venue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="glass-card p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-white/80">Email or Username</Label>
            <Input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="input-dark"
              placeholder="Enter email or username"
              data-testid="vendor-login-identifier"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark pr-10"
                placeholder="Enter password"
                data-testid="vendor-login-password"
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
            type="submit"
            className="w-full btn-primary"
            disabled={loading}
            data-testid="vendor-login-submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/40 text-sm mt-6">
          Need vendor access?{" "}
          <a href="mailto:admin@pourcircle.net" className="text-primary hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;
