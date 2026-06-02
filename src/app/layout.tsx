import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Business Bootcamp 2026 - Portal',
  description: 'Select a youth entrepreneurship project and register your interest for the Business Bootcamp (2026) in Uzbekistan.',
  keywords: ['Business Bootcamp', 'Bootcamp 2026', 'Uzbekistan', 'Youth Entrepreneurship'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00113a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-on-background antialiased">
        <Header />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        
        {/* Event Footer */}
        <footer className="w-full py-6 mt-12 bg-primary text-white/60 text-center font-sans text-xs border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4">
            <p className="font-semibold tracking-wider text-white/80">BUSINESS BOOTCAMP 2026</p>
            <p className="mt-2 text-[10px] text-white/40">© {new Date().getFullYear()} Business Bootcamp Uzbekistan. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
