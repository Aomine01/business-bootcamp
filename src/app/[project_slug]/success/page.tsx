'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Home } from 'lucide-react';

const projectSlugMap: Record<string, string> = {
  'yoshlar-tadbirkorligini-rivojlantirish-jamgarmasi': "Yoshlar Tadbirkorligini rivojlantirish jamg'armasi",
  'yoshlar-biznes-maktabi': "Yoshlar biznes maktabi",
  'komak': "Ko'mak",
  'yosh-avlod-tadbirkorlari': "Yosh avlod Tadbirkorlari",
};

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.project_slug as string;
  const projectName = projectSlugMap[slug] || "Bootcamp Loyihasi";

  return (
    <div className="w-full flex-grow flex flex-col justify-center items-center bg-background px-4 py-8">
      {/* Dynamic background accents */}
      <div className="absolute top-[30%] left-[10%] w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[30%] right-[10%] w-64 h-64 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-full max-w-sm rounded-[24px] border border-outline-variant/50 bg-white p-8 shadow-ambient-lg text-center relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-secondary-container" />

        {/* Animated Checkmark Circle */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, damping: 12, stiffness: 150 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container/20 text-secondary border border-secondary/20 shadow-inner"
          >
            <motion.div
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Check size={40} className="stroke-[3]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Success Headlines */}
        <h1 className="font-montserrat text-2xl font-extrabold text-primary mb-3">
          Muvaffaqiyatli!
        </h1>
        
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">
          Siz <span className="font-bold text-primary">{projectName}</span> loyihasi bo&apos;yicha ro&apos;yxatdan o&apos;tdingiz.
        </p>

        {/* Details card */}
        <div className="rounded-xl bg-surface-container/50 border border-outline-variant/30 p-4 mb-8 text-left">
          <p className="text-[11px] font-inter font-bold uppercase tracking-wider text-secondary mb-1">
            KEYINGI QADAMLAR:
          </p>
          <p className="font-sans text-xs text-on-surface-variant/90 leading-relaxed">
            Biznes-tahlilchilarimiz siz bilan tez orada bog&apos;lanishadi. Bootcamp davomida barcha savollaringizga to&apos;liq javob olasiz!
          </p>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="w-full flex justify-center items-center rounded-[8px] bg-gradient-to-r from-primary to-primary-container text-white font-inter font-bold text-sm tracking-wider py-3.5 px-6 shadow-md hover:shadow-lg transition-all"
        >
          <Home size={18} className="mr-2" />
          BOSH SAHIFAGA QAYTISH
        </motion.button>
      </motion.div>
    </div>
  );
}
