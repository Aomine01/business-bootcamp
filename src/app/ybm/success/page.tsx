'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Building, User } from 'lucide-react';

interface YbmRegistrationDetails {
  fullName: string;
  businessName?: string;
  ideaDescription?: string;
  isEntrepreneur: boolean;
}

export default function YbmSuccessPage() {
  const [details, setDetails] = useState<YbmRegistrationDetails | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('ybm_last_registration_details');
      if (stored) {
        try {
          setDetails(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const fullName = details?.fullName || 'Ishtirokchi';
  const isEntrepreneur = details?.isEntrepreneur ?? true;
  const businessOrIdea = isEntrepreneur 
    ? (details?.businessName || 'Biznes') 
    : (details?.ideaDescription || 'G\'oya');

  return (
    <div className="w-full flex-grow flex flex-col justify-center items-center bg-background px-4 py-8">
      {/* Background Blurs */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-72 h-72 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-full max-w-md rounded-[24px] border border-outline-variant/50 bg-white p-6 sm:p-8 shadow-ambient-lg text-center relative overflow-hidden z-10"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-secondary to-primary-container" />

        {/* Animated Badge */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, damping: 10, stiffness: 150 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary-fixed-dim text-white shadow-ambient-lg"
          >
            <Check size={36} className="stroke-[3]" />
          </motion.div>
        </div>

        {/* Success Headlines */}
        <div className="flex items-center justify-center space-x-1.5 mb-2">
          <Sparkles className="text-tertiary" size={18} />
          <h1 className="font-montserrat text-2xl font-extrabold text-primary">
            Muvaffaqiyatli!
          </h1>
          <Sparkles className="text-tertiary" size={18} />
        </div>
        
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
          Tabriklaymiz, <span className="font-bold text-primary">{fullName}</span>! Sizning Yoshlar Biznes Maktabi so&apos;rovnomangiz muvaffaqiyatli qabul qilindi.
        </p>

        {/* Details card */}
        <div className="rounded-2xl bg-surface-low border border-outline-variant/40 p-4 mb-6 text-left space-y-3.5">
          <div className="border-b border-outline-variant/35 pb-2.5">
            <span className="text-[10px] font-inter font-extrabold uppercase tracking-widest text-primary/70">ARIZA SHAKLI</span>
            <h3 className="font-montserrat text-sm font-extrabold text-primary mt-0.5">YOSHLAR BIZNES MAKTABI (YBM)</h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-start">
              <User size={15} className="text-secondary mr-2.5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-on-surface-variant/70 text-[10px] font-semibold block">F.I.SH.</span>
                <span className="font-bold text-on-surface">{fullName}</span>
              </div>
            </div>

            <div className="flex items-start">
              <Building size={15} className="text-secondary mr-2.5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-on-surface-variant/70 text-[10px] font-semibold block">
                  {isEntrepreneur ? "BIZNES / BREND NOMI" : "BIZNES G'OYASI"}
                </span>
                <span className="font-bold text-on-surface line-clamp-2 max-w-[280px]">
                  {businessOrIdea}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Note / Recommendations */}
        <div className="rounded-2xl bg-secondary/5 border border-secondary/20 p-4 mb-8 text-left">
          <p className="text-[10px] font-inter font-extrabold uppercase tracking-wider text-secondary mb-2">
            ESLATMA:
          </p>
          <ul className="space-y-2 font-sans text-xs text-on-surface-variant/90 leading-relaxed list-none pl-0">
            <li className="flex items-start">
              <span className="text-secondary mr-1.5 font-bold">•</span>
              Siz yuborgan arizani Yoshlar Biznes Maktabi mentorlari o&apos;rganib chiqishadi.
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-1.5 font-bold">•</span>
              Ariza ma&apos;qullangan taqdirda, tashkilotchilarimiz siz ko&apos;rsatgan telefon raqam yoki Telegram orqali bog&apos;lanishadi.
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-1.5 font-bold">•</span>
              Ushbu sahifani eslatma sifatida saqlab qo&apos;yishingiz mumkin.
            </li>
          </ul>
        </div>

        {/* Isolated flow: no back button link */}
      </motion.div>
    </div>
  );
}
