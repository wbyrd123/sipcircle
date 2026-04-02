import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

const SmartAppBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState(null);

  // App Store URLs - Update these with your actual app store URLs
  const APP_STORE_URL = "https://apps.apple.com/app/pourcircle/id123456789"; // Replace with actual App Store URL
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.pourcircle.wb"; // Replace with actual Play Store URL

  useEffect(() => {
    // Check if user is on mobile and hasn't dismissed the banner
    const dismissed = localStorage.getItem("appBannerDismissed");
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Detect platform
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform("ios");
    } else if (/android/i.test(userAgent)) {
      setPlatform("android");
    }

    // Show banner on mobile devices that haven't dismissed it
    if ((platform === "ios" || platform === "android") && !dismissed) {
      // Don't show if already in the app (Capacitor)
      if (!window.Capacitor?.isNativePlatform()) {
        setShowBanner(true);
      }
    }
  }, [platform]);

  const handleDismiss = () => {
    localStorage.setItem("appBannerDismissed", "true");
    setShowBanner(false);
  };

  const handleDownload = () => {
    const url = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    window.open(url, "_blank");
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] bg-black/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3 animate-slide-down"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      {/* Close button */}
      <button 
        onClick={handleDismiss}
        className="p-1 text-white/60 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      {/* App icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">🍸</span>
      </div>

      {/* App info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">PourCircle</p>
        <p className="text-white/60 text-xs">
          {platform === "ios" ? "Get it on the App Store" : "Get it on Google Play"}
        </p>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-primary text-black font-semibold text-sm rounded-full flex items-center gap-1 hover:bg-primary/90 transition-colors"
      >
        <Download className="w-4 h-4" />
        GET
      </button>
    </div>
  );
};

export default SmartAppBanner;
