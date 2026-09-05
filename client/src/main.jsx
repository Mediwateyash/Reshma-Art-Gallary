import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';
import './index.css';

// Initialize native mobile features if running inside Capacitor
if (Capacitor.isNativePlatform()) {
  try {
    StatusBar.setStyle({ style: Style.Dark });
    StatusBar.setBackgroundColor({ color: '#0f172a' });
    StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('StatusBar initialization error:', err);
  }

  try {
    SplashScreen.hide();
  } catch (err) {
    console.warn('SplashScreen initialization error:', err);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
