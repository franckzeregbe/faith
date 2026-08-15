import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pastoral.tool',
  appName: 'FAITH',
  webDir: 'dist',
  backgroundColor: '#f8f1e7',
  android: {
    backgroundColor: '#f8f1e7',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#f8f1e7',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f8f1e7',
      overlaysWebView: false,
    },
  },
};

export default config;
