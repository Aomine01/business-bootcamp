'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Home, MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

interface RegistrationDetails {
  firstName: string;
  location: 'Surxondaryo' | 'Samarqand';
  isEntrepreneur: boolean;
}

export default function BuxoroNavoiySuccess() {
  const router = useRouter();
  const [details, setDetails] = useState<RegistrationDetails | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('last_registration_details');
      if (stored) {
        try {
          setDetails(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const location = details?.location || 'Surxondaryo';
  const name = details?.firstName || 'Ishtirokchi';

  const eventInfo = {
    Surxondaryo: {
      date: '2026-yil 12-iyun',
      time: '18:00 (Ro\'yxatga olish 17:30 da boshlanadi)',
      park: 'Termiz shahri, San\'at saroyi',
      accentColor: 'from-primary to-primary-container',
    },
    Samarqand: {
      date: '2026-yil 10-iyun',
      time: '18:00 (Ro\'yxatga olish 17:30 da boshlanadi)',
      park: 'Yoshlar hiyoboni',
      accentColor: 'from-secondary to-secondary-fixed-dim',
    },
  }[location];

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
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${eventInfo.accentColor}`} />

        {/* Animated Badge */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, damping: 10, stiffness: 150 }}
            className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${eventInfo.accentColor} text-white shadow-ambient-lg`}
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
          Tabriklaymiz, <span className="font-bold text-primary">{name}</span>! Siz Biznes Bootcamp 2026 dasturiga muvaffaqiyatli ro&apos;yxatdan o&apos;tdingiz.
        </p>

        {/* Details card */}
        <div className="rounded-2xl bg-surface-low border border-outline-variant/40 p-4 mb-6 text-left space-y-3.5">
          <div className="border-b border-outline-variant/35 pb-2.5">
            <span className="text-[10px] font-inter font-extrabold uppercase tracking-widest text-primary/70">TADBIR TAFSILOTLARI</span>
            <h3 className="font-montserrat text-sm font-extrabold text-primary mt-0.5">{location.toUpperCase()} VILOYATI BOOTCAMP</h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="flex items-start">
              <Calendar size={15} className="text-secondary mr-2.5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-on-surface-variant/70 text-[10px] font-semibold block">SANA</span>
                <span className="font-bold text-on-surface">{eventInfo.date}</span>
              </div>
            </div>

            <div className="flex items-start">
              <Clock size={15} className="text-secondary mr-2.5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-on-surface-variant/70 text-[10px] font-semibold block">VAQT</span>
                <span className="font-bold text-on-surface">{eventInfo.time}</span>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin size={15} className="text-secondary mr-2.5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-on-surface-variant/70 text-[10px] font-semibold block">MANZIL</span>
                <span className="font-bold text-on-surface">{eventInfo.park}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="rounded-2xl bg-secondary/5 border border-secondary/20 p-4 mb-8 text-left">
          <p className="text-[10px] font-inter font-extrabold uppercase tracking-wider text-secondary mb-2">
            ESLATMA VA TAVSIYALAR:
          </p>
          <ul className="space-y-2 font-sans text-xs text-on-surface-variant/90 leading-relaxed list-none pl-0">
            <li className="flex items-start">
              <span className="text-secondary mr-1.5 font-bold">•</span>
              O&apos;zingiz bilan qayd daftar yoki biznes loyiha g&apos;oyangizni oling.
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-1.5 font-bold">•</span>
              Tadbir ochiq havoda o&apos;tkazilishi sababli qulay kiyimda kelishingiz tavsiya etiladi.
            </li>
            <li className="flex items-start">
              <span className="text-secondary mr-1.5 font-bold">•</span>
              Ushbu sahifani saqlab qo&apos;ying yoki skrinshot qiling.
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push('/')}
          className="w-full flex justify-center items-center rounded-xl bg-primary hover:bg-primary-container text-white font-inter font-bold text-sm tracking-wider py-4 px-6 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Home size={16} className="mr-2" />
          BOSH SAHIFAGA QAYTISH
        </motion.button>
      </motion.div>
    </div>
  );
}
