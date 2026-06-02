'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, HeartHandshake, Rocket, ArrowRight } from 'lucide-react';

export interface ProjectCardProps {
  title: string;
  description: string;
  slug: string;
  accentColor: 'blue' | 'green' | 'teal' | 'gold';
  iconName: 'fund' | 'school' | 'komak' | 'generation';
}

const iconMap = {
  fund: Briefcase,
  school: GraduationCap,
  komak: HeartHandshake,
  generation: Rocket,
};

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
};

export default function ProjectCard({ title, description, slug, accentColor, iconName }: ProjectCardProps) {
  const Icon = iconMap[iconName];
  const styles = colorStyles[accentColor];

  return (
    <Link href={`/${slug}`} className="block w-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-[24px] border ${styles.border} bg-white p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex flex-col justify-between h-full min-h-[180px]`}
      >
        {/* Color Gradient Overlay for background touch */}
        <div className={`absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl ${styles.gradient} rounded-bl-full opacity-40 pointer-events-none`} />

        <div>
          {/* Card Header: Icon & Category */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${styles.iconBg}`}>
              <Icon size={24} />
            </div>
            <span className={`text-[11px] font-inter font-extrabold uppercase tracking-widest ${styles.accentText}`}>
              BOOTCAMP 2026 PROJECT
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="font-montserrat text-lg font-bold text-primary tracking-tight leading-snug mb-2">
            {title}
          </h3>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center text-sm font-inter font-bold text-primary group mt-auto">
          <span>Learn More & Register</span>
          <motion.span 
            className="ml-1.5 transition-transform"
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          >
            <ArrowRight size={16} className="text-secondary" />
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}
