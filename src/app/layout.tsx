import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Biznes Bootcamp 2026 - Portal',
  description: 'Yoshlar tadbirkorlik loyihasini tanlang va O\'zbekistondagi Biznes Bootcamp 2026 dasturiga ro\'yxatdan o\'ting.',
  keywords: ['Biznes Bootcamp', 'Bootcamp 2026', 'O\'zbekiston', 'Yoshlar tadbirkorligi'],
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
          <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-1.5">
            <p className="font-semibold tracking-wider text-white/80">YOSHLAR TADBIRKORLIGINI RIVOJLANTIRISH JAMG&apos;ARMASI</p>
            <p className="text-[10px] text-white/40">© {new Date().getFullYear()} YTRJ. Barcha huquqlar himoyalangan.</p>
            <p className="mt-1">
              <a
                href="https://yoshlar.gov.uz/marathon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-fixed hover:text-secondary-fixed-dim transition-colors font-bold underline decoration-secondary/30 underline-offset-4"
              >
                yoshlar.gov.uz/marathon
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
