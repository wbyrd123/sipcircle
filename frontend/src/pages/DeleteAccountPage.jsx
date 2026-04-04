import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, Trash2, UserX, Database, Clock } from "lucide-react";

const DeleteAccountPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Delete Account</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Delete Your PourCircle Account
          </h1>
          <p className="text-white/60">
            Follow the steps below to permanently delete your account and data.
          </p>
        </div>

        {/* Steps */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-primary" />
            How to Delete Your Account
          </h2>
          
          <ol className="space-y-4 text-white/80">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">1</span>
              <span>Open the PourCircle app and <strong>sign in</strong> to your account</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">2</span>
              <span>Tap the <strong>Profile</strong> icon in the bottom navigation bar</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">3</span>
              <span>Scroll down to the bottom of your profile page</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">4</span>
              <span>Tap the <strong className="text-red-400">"Delete Account"</strong> button</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-bold">5</span>
              <span>Confirm your decision in the dialog that appears</span>
            </li>
          </ol>
        </div>

        {/* Data Deletion Info */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-secondary" />
            Data That Will Be Deleted
          </h2>
          
          <ul className="space-y-2 text-white/80">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Your profile information (name, username, bio)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Your profile photo
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Your email address
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Your follower and following lists
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Your work locations and schedules (bartenders)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Your payment links (Venmo, CashApp, PayPal)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Any invites you have sent or received
            </li>
          </ul>
        </div>

        {/* Retention Period */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Retention Period
          </h2>
          
          <p className="text-white/80">
            When you delete your account, all associated data is <strong>permanently deleted immediately</strong>. 
            This action cannot be undone.
          </p>
          <p className="text-white/60 text-sm">
            Note: If you have previously been reported by other users, those reports may be retained 
            for safety and compliance purposes.
          </p>
        </div>

        {/* Contact */}
        <div className="text-center text-white/60 text-sm">
          <p>Need help? Contact us at</p>
          <a href="mailto:support@pourcircle.app" className="text-primary hover:underline">
            support@pourcircle.app
          </a>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={() => navigate("/auth")}
            className="btn-primary"
          >
            Sign In to Delete Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default DeleteAccountPage;
