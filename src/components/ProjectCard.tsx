'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, HeartHandshake, Rocket, ArrowRight } from 'lucide-react';

export interface ProjectCardProps {
  title: string;
  description: string;
  slug: string;
  accentColor: 'blue' | 'green' | 'teal' | 'gold' | 'purple' | 'pink';
  logoUrl: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-primary-container/5',
    border: 'border-primary/10 hover:border-primary/30',
    iconBg: 'bg-primary-container text-primary-fixed',
    accentText: 'text-primary',
    gradient: 'from-primary/10 to-transparent',
  },
  green: {
    bg: 'bg-secondary/5',
    border: 'border-secondary/10 hover:border-secondary/30',
    iconBg: 'bg-secondary text-white',
    accentText: 'text-secondary',
    gradient: 'from-secondary/10 to-transparent',
  },
  teal: {
    bg: 'bg-teal-600/5',
    border: 'border-teal-600/10 hover:border-teal-600/30',
    iconBg: 'bg-teal-600 text-white',
    accentText: 'text-teal-700',
    gradient: 'from-teal-600/10 to-transparent',
  },
  gold: {
    bg: 'bg-tertiary/10',
    border: 'border-tertiary/20 hover:border-tertiary/40',
    iconBg: 'bg-tertiary text-primary',
    accentText: 'text-amber-600',
    gradient: 'from-tertiary/10 to-transparent',
  },
  purple: {
    bg: 'bg-purple-600/5',
    border: 'border-purple-600/10 hover:border-purple-600/30',
    iconBg: 'bg-purple-600 text-white',
    accentText: 'text-purple-700',
    gradient: 'from-purple-600/10 to-transparent',
  },
  pink: {
    bg: 'bg-pink-600/5',
    border: 'border-pink-600/10 hover:border-pink-600/30',
    iconBg: 'bg-pink-600 text-white',
    accentText: 'text-pink-700',
    gradient: 'from-pink-600/10 to-transparent',
  },
};

export default function ProjectCard({ title, description, slug, accentColor, logoUrl }: ProjectCardProps) {
  const styles = colorStyles[accentColor];

  return (
    <Link href={`/${slug}`} className="block w-full h-full">
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-[24px] border ${styles.border} bg-white p-5 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex flex-col justify-between h-full min-h-[260px] group`}
      >
        {/* Color Gradient Overlay for background touch */}
        <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl ${styles.gradient} rounded-bl-full opacity-40 pointer-events-none`} />

        {/* Full Size Logo Container */}
        <div className="flex-grow flex items-center justify-center min-h-[160px] mb-4 bg-surface-low/40 rounded-2xl p-4 transition-colors duration-300 group-hover:bg-white border border-outline-variant/10">
          <img 
            src={logoUrl} 
            alt={title} 
            className="max-h-[120px] max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
          />
        </div>

        {/* Project Name and Action */}
        <div className="flex flex-col space-y-1 pt-1">
          <h3 className="font-montserrat text-sm font-bold text-primary tracking-tight leading-snug truncate">
            {title}
          </h3>
          <div className="flex items-center text-[11px] font-inter font-bold text-secondary group-hover:text-primary transition-colors">
            <span>Batafsil va ro&apos;yxatdan o&apos;tish</span>
            <motion.span 
              className="ml-1.5 transition-transform"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              <ArrowRight size={12} />
            </motion.span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
