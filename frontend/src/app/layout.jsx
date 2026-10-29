'use client';

import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>TierFlow - Investment & Referral Platform</title>
        <meta name="description" content="Next generation investment and multi-level referral platform" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className="bg-[#F8FAFC] text-slate-800 antialiased font-sans">
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0B132B',
                color: '#fff',
                fontSize: '13px',
                borderRadius: '12px',
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
