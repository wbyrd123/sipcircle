import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const TermsOfUse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" data-testid="terms-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 h-14 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white">Terms of Use</h1>
        </div>
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto">
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-white/60 text-sm mb-6">Effective Date: March 30, 2026</p>
          
          <p className="text-white/80 leading-relaxed mb-6">
            Welcome to SipCircle. These Terms of Use govern your access to and use of the SipCircle application, 
            website, and related services. By creating an account, accessing, or using SipCircle, you agree to 
            be bound by these Terms. If you do not agree to these Terms, do not use SipCircle.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            By using SipCircle, you acknowledge that you have read, understood, and agree to these Terms of Use, 
            as well as any related policies referenced within them.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Intended Purpose of the Platform</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle is a bartender discovery and nightlife-follow platform intended for users who are of legal 
            drinking age in their jurisdiction.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle is designed to allow users to discover bartenders, follow bartender profiles, view public 
            work schedules, see venue affiliations, browse featured drinks, review happy hour information, view 
            public nightlife-related posts, and engage with public-facing bartender and venue content.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            <strong className="text-white">SipCircle is NOT intended</strong> to function as a private messaging service, 
            dating platform, anonymous communication tool, or platform for locating, monitoring, harassing, stalking, 
            exploiting, or targeting any person.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            By using SipCircle, you agree to use the platform only for its intended purpose.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Eligibility</h2>
          <p className="text-white/80 leading-relaxed mb-4">You may use SipCircle only if:</p>
          <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
            <li>You are of legal drinking age in your jurisdiction.</li>
            <li>You are legally permitted to use the platform under applicable law.</li>
            <li>You provide truthful, current, and accurate information when registering and using your account.</li>
          </ul>
          <p className="text-white/80 leading-relaxed mb-4">
            By using SipCircle, you represent and warrant that you meet these eligibility requirements.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle reserves the right to deny access to, suspend, restrict, or terminate any account if it 
            reasonably believes that a user is underage, provided false, misleading, or incomplete information, 
            violated these Terms, or used the platform in a manner inconsistent with its intended purpose.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Account Registration and Accuracy of Information</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            When you create an account, you agree to provide accurate and complete information and to keep your 
            information reasonably updated.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            You are responsible for maintaining the confidentiality of your account credentials and for all 
            activity that occurs under your account.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            You may not create an account using false information, false identity details, or misleading profile 
            information. You may not create an account on behalf of another person or business without authorization.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Public-Facing Nature of SipCircle</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle is intended to be a public-facing discovery platform. Certain information posted by bartenders, 
            venues, or users may be visible to other users of the platform, including public schedules, public profile 
            information, venue affiliations, featured drinks, and nightlife-related content.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            Users acknowledge that public content shared through the platform may be viewed by others and should use 
            caution and judgment when posting or relying on public information.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Permitted Uses</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            You may use SipCircle only for lawful purposes and only in accordance with these Terms. Permitted uses include:
          </p>
          <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
            <li>Discovering bartenders and nightlife-related public content.</li>
            <li>Following bartender or venue profiles.</li>
            <li>Viewing public schedules and public event-related information.</li>
            <li>Browsing featured drinks, happy hour information, and related content.</li>
            <li>Engaging with public-facing content in a respectful and lawful way.</li>
            <li>Using the platform for its intended promotional and discovery purpose.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Prohibited Conduct</h2>
          <p className="text-white/80 leading-relaxed mb-4">You agree that you will NOT use SipCircle to:</p>
          <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
            <li>Harass, threaten, intimidate, abuse, or harm any person.</li>
            <li>Stalk, monitor, track, exploit, or target any bartender, venue representative, user, or other individual.</li>
            <li>Engage in grooming, predatory behavior, coercive conduct, or other inappropriate behavior toward any person.</li>
            <li>Impersonate any individual, bartender, venue, business, or brand.</li>
            <li>Provide false, deceptive, or misleading registration or profile information.</li>
            <li>Create fake accounts or use the platform to deceive others about your identity or intent.</li>
            <li>Use publicly available schedule or venue information for harassment, surveillance, unwanted pursuit, or improper contact.</li>
            <li>Collect, scrape, harvest, copy, or misuse profile information, schedule data, or other platform content for harmful, exploitative, commercial, or unauthorized purposes.</li>
            <li>Upload, post, or share content that is abusive, defamatory, hateful, obscene, sexually explicit, threatening, discriminatory, fraudulent, or otherwise objectionable.</li>
            <li>Post private, confidential, or personal information about another person without authorization.</li>
            <li>Promote unlawful activity or use the platform in connection with unlawful conduct.</li>
            <li>Attempt to bypass account restrictions, safety features, moderation tools, or enforcement systems.</li>
            <li>Use SipCircle as a dating platform, private communications tool, or method of secretly contacting, targeting, or tracking individuals.</li>
            <li>Engage in any conduct that interferes with the safety, integrity, operation, or reputation of the platform.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. User Content</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            If SipCircle permits users to upload, post, publish, submit, or display content, you remain solely 
            responsible for the content you submit. You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
            <li>You have the right to submit the content.</li>
            <li>Your content is accurate to the best of your knowledge.</li>
            <li>Your content does not violate the rights of any third party.</li>
            <li>Your content does not violate these Terms or applicable law.</li>
            <li>Your content is consistent with the intended purpose of SipCircle.</li>
          </ul>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle does not guarantee the accuracy, completeness, or reliability of user-submitted content.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">9. Monitoring, Moderation, and Enforcement</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle reserves the right, but not the obligation, to monitor, review, investigate, remove, restrict, 
            disable access to, or refuse content or accounts that it believes may violate these Terms, violate applicable 
            law, endanger users or third parties, be deceptive, misleading, or harmful, or be inconsistent with the 
            intended purpose of the platform.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle may also review user reports, complaints, or safety concerns and take action it considers 
            appropriate, including removing content, limiting account features, suspending accounts, terminating 
            accounts, or cooperating with lawful requests from authorities when required.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">10. Reporting Misuse</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            Users may report content, profiles, or behavior that they believe is abusive, unsafe, unlawful, deceptive, 
            or inconsistent with the intended purpose of SipCircle. SipCircle reserves the right to review and respond 
            to reports in its discretion.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">11. Suspension and Termination</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle may suspend, restrict, or terminate your access to the platform at any time, with or without 
            notice, if SipCircle believes that you violated these Terms, you are using the platform in an unsafe or 
            harmful manner, you are underage or provided false age-related information, your account is fraudulent, 
            deceptive, or unauthorized, or your continued access could create risk for users, bartenders, venues, or SipCircle.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">12. Disclaimer Regarding User Behavior</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle is a platform for public discovery and promotion. SipCircle does not guarantee the truthfulness, 
            intentions, identity, conduct, or reliability of any user, bartender, venue, or third party using the platform.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            Users are responsible for their own actions and judgments when using SipCircle. SipCircle does not control 
            or guarantee the behavior of users and is not responsible for conduct by users that violates these Terms 
            or applicable law.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">13. Safety and Public Information</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            Users acknowledge that SipCircle may contain public-facing information related to bartenders, venues, 
            schedules, public events, and nightlife-related activity.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            Users agree not to misuse public information made available through the platform. SipCircle strongly 
            discourages any use of the platform for surveillance, harassment, stalking, unwanted pursuit, or any 
            other misuse of publicly available content.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">14. Disclaimer of Warranties</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, 
            SipCircle disclaims all warranties, express or implied, including warranties of merchantability, fitness 
            for a particular purpose, non-infringement, accuracy, availability, and reliability.
          </p>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle does not warrant that the platform will be uninterrupted, error-free, secure, or free from 
            harmful conduct by users or third parties.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">15. Limitation of Liability</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            To the fullest extent permitted by law, SipCircle and its owners, officers, employees, contractors, 
            affiliates, and representatives shall not be liable for any indirect, incidental, consequential, special, 
            exemplary, or punitive damages, or for any loss of profits, data, goodwill, business opportunity, or other 
            intangible losses arising out of or related to:
          </p>
          <ul className="list-disc pl-6 text-white/80 space-y-2 mb-4">
            <li>Your access to or use of the platform.</li>
            <li>Your inability to access or use the platform.</li>
            <li>User content or user conduct.</li>
            <li>Misuse of public information by users or third parties.</li>
            <li>Unauthorized access to or use of your account.</li>
            <li>Any other matter related to SipCircle.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">16. Indemnification</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            You agree to defend, indemnify, and hold harmless SipCircle and its owners, officers, employees, 
            contractors, affiliates, and representatives from and against any claims, liabilities, damages, losses, 
            costs, and expenses, including reasonable legal fees, arising out of or related to your use of SipCircle, 
            your violation of these Terms, your violation of applicable law, your content, your misuse of the platform, 
            or your infringement of any rights of another person or entity.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">17. Changes to the Terms</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            SipCircle may update or modify these Terms from time to time. If SipCircle makes material changes, it 
            may provide notice through the app, website, or by other reasonable means. Your continued use of the 
            platform after changes become effective constitutes your acceptance of the updated Terms.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">18. Contact Information</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            If you have questions, concerns, or reports relating to these Terms or the use of SipCircle, you may 
            contact SipCircle at:
          </p>
          <p className="text-primary font-medium">sipcirclehelp@gmail.com</p>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-white/40 text-xs">
              Last updated: March 30, 2026
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUse;
