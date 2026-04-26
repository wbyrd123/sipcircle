import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, Ban, Flag, Mail } from "lucide-react";

const SafetyStandardsPage = () => {
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
          <h1 className="text-lg font-semibold text-white">Safety Standards</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto space-y-8">
        {/* Title */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            PourCircle Safety Standards
          </h1>
          <p className="text-white/60">
            Our commitment to user safety and child protection
          </p>
          <p className="text-white/40 text-sm mt-2">
            Last updated: April 2026
          </p>
        </div>

        {/* Age Requirement */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-secondary" />
            Age Requirement
          </h2>
          <p className="text-white/80">
            PourCircle is strictly for users who are <strong>21 years of age or older</strong>. 
            This app is designed for adults of legal drinking age and involves content related to 
            bars, bartenders, and alcoholic beverages.
          </p>
          <p className="text-white/80">
            We do not knowingly collect or solicit personal information from anyone under 21 years 
            of age. If we learn that we have collected personal information from a minor, we will 
            delete that information immediately.
          </p>
        </div>

        {/* Zero Tolerance Policy */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-400" />
            Zero Tolerance Policy Against CSAE
          </h2>
          <p className="text-white/80">
            PourCircle maintains a <strong>zero-tolerance policy</strong> against Child Sexual Abuse 
            and Exploitation (CSAE). We are committed to preventing the use of our platform for any 
            form of child exploitation.
          </p>
          
          <h3 className="text-white font-medium mt-4">Prohibited Content and Behavior</h3>
          <p className="text-white/80">The following is strictly prohibited on PourCircle:</p>
          <ul className="space-y-2 text-white/80 ml-4">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
              Any content depicting, promoting, or facilitating child sexual abuse or exploitation
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
              Sharing, distributing, or soliciting child sexual abuse material (CSAM)
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
              Grooming behavior or inappropriate contact with minors
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
              Sextortion or any form of sexual coercion
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
              Trafficking or exploitation of any kind
            </li>
          </ul>
        </div>

        {/* Enforcement */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Enforcement Measures
          </h2>
          <p className="text-white/80">
            When we identify or receive reports of CSAE-related content or behavior, we take 
            immediate action:
          </p>
          <ul className="space-y-2 text-white/80 ml-4">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <strong>Immediate removal</strong> of violating content
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <strong>Permanent ban</strong> of the offending account
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <strong>Reporting to authorities</strong> including the National Center for Missing 
              & Exploited Children (NCMEC) and relevant law enforcement agencies
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              <strong>Preservation of evidence</strong> for law enforcement investigations
            </li>
          </ul>
        </div>

        {/* Reporting */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-orange-400" />
            How to Report
          </h2>
          <p className="text-white/80">
            If you encounter any content or behavior that violates these safety standards, 
            please report it immediately:
          </p>
          <ul className="space-y-2 text-white/80 ml-4">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></span>
              <strong>In-app reporting:</strong> Use the Report button (flag icon) on any user profile
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></span>
              <strong>Email:</strong> Contact us at <a href="mailto:safety@pourcircle.app" className="text-primary hover:underline">safety@pourcircle.app</a>
            </li>
          </ul>
          <p className="text-white/60 text-sm mt-4">
            All reports are reviewed promptly and handled with strict confidentiality.
          </p>
        </div>

        {/* Contact */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Contact Us
          </h2>
          <p className="text-white/80">
            For questions about our safety standards or to report concerns:
          </p>
          <p className="text-white/80">
            <strong>Safety Team:</strong>{" "}
            <a href="mailto:safety@pourcircle.app" className="text-primary hover:underline">
              safety@pourcircle.app
            </a>
          </p>
          <p className="text-white/80">
            <strong>General Support:</strong>{" "}
            <a href="mailto:support@pourcircle.app" className="text-primary hover:underline">
              support@pourcircle.app
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-white/40 text-sm py-4">
          <p>PourCircle is committed to maintaining a safe platform for all users.</p>
        </div>
      </main>
    </div>
  );
};

export default SafetyStandardsPage;
