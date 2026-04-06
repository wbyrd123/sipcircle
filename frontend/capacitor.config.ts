import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pourcircle.app',
  appName: 'SipCircle',
  webDir: 'build',
  server: {
    // For development, you can use your preview URL
    // Comment this out for production builds
    // url: 'https://craft-scene.preview.emergentagent.com',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#050505',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#050505',
    },
    Camera: {
      // iOS specific settings
      presentationStyle: 'popover', // Required for iPad to prevent crashes
    },
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'SipCircle',
  },
};

export default config;
