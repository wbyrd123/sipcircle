import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../App";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Wine, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="forgot-password-page">
      {/* Header */}
      <header className="p-4 flex items-center gap-3">
        <Link 
          to="/auth" 
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          data-testid="back-to-login"
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
          {submitted ? (
            <div className="glass-card p-8 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Check Your Email
                </h1>
                <p className="text-white/60">
                  If an account exists with <span className="text-white">{email}</span>, you'll receive a password reset link shortly.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-white/50 text-sm">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  Try Another Email
                </Button>
              </div>
              <Link 
                to="/auth" 
                className="text-primary text-sm hover:underline inline-block"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <div className="glass-card p-8 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Forgot Password?
                </h1>
                <p className="text-white/60">
                  No worries! Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark"
                    required
                    data-testid="forgot-email-input"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary btn-press"
                  disabled={loading}
                  data-testid="send-reset-btn"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center">
                <Link 
                  to="/auth" 
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  Remember your password? <span className="text-primary">Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
