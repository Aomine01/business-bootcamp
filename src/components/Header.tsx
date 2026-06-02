'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glassmorphism shadow-ambient transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center group">
            <span className="font-montserrat text-sm font-extrabold tracking-tight text-primary leading-none">
              BIZNES BOOTCAMP 2026
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
