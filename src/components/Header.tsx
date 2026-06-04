'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glassmorphism shadow-ambient transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex py-3 sm:py-4 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center group">
              <img
                src="/ytrj headr.png"
                alt="YTRJ logo"
                className="h-20 sm:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </Link>
            <div className="w-[1px] sm:w-[1.5px] h-12 sm:h-14 bg-primary/15" />
            <a 
              href="https://yoshlar.gov.uz/marathon" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center group"
            >
              <img
                src="/tashabus.png"
                alt="Marafon logo"
                className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

