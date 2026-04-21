import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { Wine, ArrowLeft, GlassWater, Users } from "lucide-react";
import { toast } from "sonner";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  
  const [activeTab, setActiveTab] = useState("login");
  const [role, setRole] = useState(searchParams.get("role") || "customer");
  const [loading, setLoading] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ email: "", password: "", name: "", username: "" });

  const from = location.state?.from?.pathname || (role === "bartender" ? "/dashboard" : "/home");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(loginForm.identifier, loginForm.password);
      toast.success(`Welcome back, ${user.name}!`);
      // Navigation will be handled by AuthRedirect component after user state updates
      // Don't navigate here - let the route change handle it
    } catch (e) {
      toast.error(e.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!ageVerified) {
      toast.error("You must confirm you are of legal drinking age to register");
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const user = await register({ ...registerForm, role });
      toast.success(`Welcome to PourCircle, ${user.name}!`);
      // Navigation will be handled by AuthRedirect component after user state updates
      // Don't navigate here - let the route change handle it
    } catch (e) {
      if (e.response?.data?.detail) {
        toast.error(e.response.data.detail);
      } else if (e.code === 'ERR_NETWORK' || !navigator.onLine) {
        toast.error("Network error. Please check your internet connection and try again.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
      console.error("Registration error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-30"
        style={{ 
          backgroundImage: `url('https://images.pexels.com/photos/5550318/pexels-photo-5550318.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')` 
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="text-white/60 hover:text-white"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Wine className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-white">PourCircle</span>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="glass-card p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
                  <TabsTrigger value="login" data-testid="login-tab">Sign In</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Welcome Back
                    </h1>
                    <p className="text-white/60 text-sm">Sign in to your account</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-identifier" className="text-white/80">Email or Username</Label>
                      <Input
                        id="login-identifier"
                        type="text"
                        placeholder="you@example.com or username"
                        value={loginForm.identifier}
                        onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                        className="input-dark"
                        required
                        data-testid="login-identifier-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-white/80">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="input-dark"
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full btn-primary btn-press"
                      disabled={loading}
                      data-testid="login-submit-btn"
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <Link 
                        to="/forgot-password" 
                        className="text-primary text-sm hover:underline"
                        data-testid="forgot-password-link"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-6">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Join PourCircle
                    </h1>
                    <p className="text-white/60 text-sm">Create your account</p>
                  </div>

                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole("bartender")}
                      className={`p-4 rounded-xl border transition-all ${
                        role === "bartender" 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                      data-testid="role-bartender-btn"
                    >
                      <GlassWater className={`w-8 h-8 mx-auto mb-2 ${role === "bartender" ? "text-primary" : "text-white/60"}`} />
                      <p className={`text-sm font-medium ${role === "bartender" ? "text-primary" : "text-white/80"}`}>Bartender</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("customer")}
                      className={`p-4 rounded-xl border transition-all ${
                        role === "customer" 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                      data-testid="role-customer-btn"
                    >
                      <Users className={`w-8 h-8 mx-auto mb-2 ${role === "customer" ? "text-primary" : "text-white/60"}`} />
                      <p className={`text-sm font-medium ${role === "customer" ? "text-primary" : "text-white/80"}`}>Bar-Goer</p>
                    </button>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-white/80">Full Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Smith"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="input-dark"
                        required
                        data-testid="register-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-white/80">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="johnsmith"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="input-dark"
                        required
                        data-testid="register-username-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-white/80">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="input-dark"
                        required
                        data-testid="register-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white/80">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="input-dark"
                        required
                        data-testid="register-password-input"
                      />
                    </div>
                    
                    {/* Age Verification & Terms Acknowledgment */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                      <Checkbox
                        id="age-verification"
                        checked={ageVerified}
                        onCheckedChange={setAgeVerified}
                        className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        data-testid="age-verification-checkbox"
                      />
                      <label 
                        htmlFor="age-verification" 
                        className="text-sm text-white/70 leading-relaxed cursor-pointer"
                      >
                        I confirm that I am of <span className="text-white font-medium">legal drinking age</span> in my jurisdiction. 
                        I understand that PourCircle is intended only for discovering, following, and viewing public bartender, 
                        venue, event, and nightlife-related content. I agree not to use PourCircle for harassment, stalking, 
                        predatory behavior, impersonation, unlawful conduct, or any use outside the intended purpose of the platform. 
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Use
                        </Link>
                        {" "}and{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>.
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-primary btn-press"
                      disabled={loading || !ageVerified}
                      data-testid="register-submit-btn"
                    >
                      {loading ? "Creating account..." : `Create ${role === "bartender" ? "Bartender" : "Bar-Goer"} Account`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthPage;
