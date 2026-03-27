import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Wine, Users, MessageCircle, MapPin, QrCode, DollarSign } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Users, title: "Build Your Following", desc: "Connect with regulars and grow your clientele" },
    { icon: DollarSign, title: "Easy Tips", desc: "Venmo & CashApp integration for seamless tipping" },
    { icon: MapPin, title: "Share Your Schedule", desc: "Let followers know where you're working" },
    { icon: MessageCircle, title: "Direct Messages", desc: "Stay connected with your favorite patrons" },
    { icon: QrCode, title: "QR Code Profile", desc: "Scannable codes for instant profile access" },
    { icon: Wine, title: "Happy Hour Updates", desc: "Share specials and drink menus" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1770597105012-eb0007c137d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yJTIwZGFyayUyMG1vb2R5fGVufDB8fHx8MTc3NDAxODY3NHww&ixlib=rb-4.1.0&q=85')` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
        
        {/* Header */}
        <header className="relative z-10 p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wine className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>SipCircle</span>
          </div>
          <Button 
            onClick={() => navigate("/auth")} 
            variant="outline"
            className="btn-secondary"
            data-testid="header-signin-btn"
          >
            Sign In / Register
          </Button>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 pb-20">
          <span className="font-accent text-primary text-sm mb-4 animate-fade-in">The Digital Speakeasy</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up" style={{ fontFamily: "'Playfair Display', serif" }}>
            Where Bartenders<br />
            <span className="text-gradient">Meet Their People</span>
          </h1>
          <p className="text-lg text-white/70 max-w-md mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Build your following, share your schedule, and connect with patrons who appreciate your craft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button 
              onClick={() => navigate("/auth?role=bartender")} 
              className="btn-primary btn-press"
              data-testid="hero-bartender-btn"
            >
              I'm a Bartender
            </Button>
            <Button 
              onClick={() => navigate("/auth?role=customer")} 
              className="btn-secondary btn-press"
              data-testid="hero-customer-btn"
            >
              I'm a Bar-Goer
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-accent text-primary text-sm">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Everything You Need
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="glass-card-hover p-8 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass-card p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to Pour?
          </h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto">
            Join the community of bartenders and bar enthusiasts today.
          </p>
          <Button 
            onClick={() => navigate("/auth")} 
            className="btn-primary btn-press"
            data-testid="cta-get-started-btn"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wine className="w-6 h-6 text-primary" />
            <span className="text-white font-semibold">SipCircle</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-white/40 text-sm hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <p className="text-white/40 text-sm">© 2025 SipCircle. Drink responsibly.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
