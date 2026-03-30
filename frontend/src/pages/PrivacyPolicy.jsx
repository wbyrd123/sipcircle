import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Wine, ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Wine className="w-5 h-5 text-primary" />
          <span className="text-lg font-semibold text-white">SipCircle</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-white/80">
          <p className="text-white/60 text-sm">Effective Date: March 30, 2026</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
            <p>
              Welcome to SipCircle ("we," "our," or "us"). We are committed to protecting your privacy 
              and personal information. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our mobile application and website 
              (collectively, the "Service").
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using SipCircle, you acknowledge 
              that you have read, understood, and agree to be bound by this Privacy Policy and our{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Use</Link>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Age Requirement</h2>
            <p>
              SipCircle is intended for users who are of legal drinking age in their jurisdiction. 
              By using our Service, you represent and warrant that you are at least 21 years of age 
              in the United States, or the legal drinking age in your country of residence.
            </p>
            <p>
              SipCircle may collect date of birth, age-related information, or age-confirmation 
              information for the purpose of determining eligibility to use the platform, supporting 
              compliance efforts, enforcing platform restrictions, and maintaining the intended 
              age-limited nature of the service.
            </p>
            <p>
              We do not knowingly collect information from individuals under the legal drinking age.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Information We Collect</h2>
            <h3 className="text-lg font-medium text-white/90">3.1 Account Information</h3>
            <p>
              SipCircle may collect information you provide when creating or maintaining an account, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and username</li>
              <li>Email address and password</li>
              <li>Profile details and profile picture</li>
              <li>Venue affiliation (for bartenders)</li>
              <li>Work location and schedule information (for bartenders)</li>
              <li>Payment links (Venmo, Cash App, PayPal URLs)</li>
              <li>Other account-related information</li>
            </ul>

            <h3 className="text-lg font-medium text-white/90">3.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (device type, operating system)</li>
              <li>Usage data (features used, time spent in app)</li>
              <li>Log data (IP address, browser type, access times)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. How We Use Your Information</h2>
            <p>SipCircle may use collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Operate the platform and provide features</li>
              <li>Maintain account functionality</li>
              <li>Improve user experience</li>
              <li>Support moderation and safety efforts</li>
              <li>Enforce Terms of Use</li>
              <li>Comply with legal obligations</li>
              <li>Protect the platform and its users</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Public-Facing Nature of SipCircle</h2>
            <p>
              SipCircle is intended to be a public-facing discovery platform. Certain information 
              posted by bartenders, venues, or users may be visible to other users of the platform, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Public profile information (name, username, bio, profile picture)</li>
              <li>Public schedules and work locations</li>
              <li>Venue affiliations</li>
              <li>Featured drinks and happy hour information</li>
              <li>Nightlife-related content</li>
            </ul>
            <p>
              Users acknowledge that public content shared through the platform may be viewed by 
              others and should use caution and judgment when posting or relying on public information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">6. Information Sharing</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Public Profile Information:</strong> Bartender profiles (name, bio, work locations, 
              schedules, payment links) are publicly visible to other users.</li>
              <li><strong>Service Providers:</strong> We may share information with third-party vendors 
              who assist in operating our Service.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law 
              or to protect our rights and safety.</li>
              <li><strong>Safety and Enforcement:</strong> We may share information to support moderation, 
              safety efforts, and enforcement of our Terms of Use.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">7. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your 
              personal information. However, no method of transmission over the Internet or electronic 
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">8. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access, update, or delete your account information</li>
              <li>Request a copy of your personal data</li>
              <li>Opt out of promotional communications</li>
              <li>Delete your account at any time through the app settings</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">9. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed 
              to provide you services. We may retain certain information as required by law or for 
              legitimate business purposes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">10. Third-Party Links</h2>
            <p>
              Our Service may contain links to third-party websites or services (such as Venmo, 
              Cash App, or PayPal). We are not responsible for the privacy practices of these 
              third parties. We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">11. Children's Privacy</h2>
            <p>
              Our Service is not intended for anyone under the legal drinking age. We do not 
              knowingly collect personal information from minors. If we learn that we have 
              collected information from a minor, we will delete it promptly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Effective Date." 
              Your continued use of the Service after changes constitutes acceptance of 
              the updated policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, 
              please contact us at:
            </p>
            <p className="text-primary">sipcirclehelp@gmail.com</p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wine className="w-5 h-5 text-primary" />
            <span className="text-white font-semibold">SipCircle</span>
          </div>
          <div className="flex gap-4">
            <Link to="/terms" className="text-white/40 hover:text-white/60 text-sm">Terms of Use</Link>
            <span className="text-white/20">|</span>
            <span className="text-white/40 text-sm">© 2026 SipCircle. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
