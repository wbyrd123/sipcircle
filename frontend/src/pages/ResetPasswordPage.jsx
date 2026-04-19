import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Wine, ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      await axios.get(`${API}/auth/verify-reset-token?token=${token}`);
      setTokenValid(true);
    } catch (e) {
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: newPassword
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="reset-password-page">
      {/* Header */}
      <header className="p-4 flex items-center gap-3">
        <Link 
          to="/auth" 
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div className="flex items-center gap-2">
          <Wine className="w-5 h-5 text-primary" />
          <span className="text-lg font-bold text-white">PourCircle</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {success ? (
            <div className="glass-card p-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Password Reset!
                </h1>
                <p className="text-white/60">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/auth")}
                className="btn-primary"
                data-testid="go-to-login-btn"
              >
                Go to Sign In
              </Button>
            </div>
          ) : !token || !tokenValid ? (
            <div className="glass-card p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Invalid Reset Link
                </h1>
                <p className="text-white/60">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/forgot-password")}
                className="btn-primary"
              >
                Request New Link
              </Button>
              <Link 
                to="/auth" 
                className="text-white/60 text-sm hover:text-white transition-colors block"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <div className="glass-card p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Create New Password
                </h1>
                <p className="text-white/60">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-white/80">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-dark pr-10"
                      required
                      minLength={6}
                      data-testid="new-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-white/40 text-xs">Must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white/80">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-dark"
                    required
                    data-testid="confirm-password-input"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary btn-press"
                  disabled={loading}
                  data-testid="reset-password-btn"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
