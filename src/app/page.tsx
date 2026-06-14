'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';

const projects = [
  {
    title: "Yoshlar Tadbirkorligini rivojlantirish jamg'armasi",
    description: "Moliyaviy ko'mak, imtiyozli kreditlar va yosh tadbirkorlarning startap loyihalarini qo'llab-quvvatlash jamg'armasi.",
    slug: "yoshlar-tadbirkorligini-rivojlantirish-jamgarmasi",
    accentColor: "blue" as const,
    logoUrl: "/ytrj headr.png",
  },
  {
    title: "Yoshlar biznes maktabi",
    description: "Tadbirkorlik asoslari, biznes rejalashtirish va amaliy marketing ko'nikmalarini o'rgatishga yo'naltirishga qaratilgan o'quv dasturlari.",
    slug: "yoshlar-biznes-maktabi",
    accentColor: "green" as const,
    logoUrl: "/YBM logo-03.png",
  },
  {
    title: "Ko'mak",
    description: "Biznes yuritishdagi muammolarni hal qilish, huquqiy va amaliy maslahatlar olish uchun yordam platformasi.",
    slug: "komak",
    accentColor: "teal" as const,
    logoUrl: "/komaknew.png",
  },
  {
    title: "Yangi avlod tadbirkorlari",
    description: "Yangi avlod innovatorlari va startapchilarni birlashtiruvchi hamjamiyat va hamkorlik ekotizimi.",
    slug: "yangi-avlod-tadbirkorlari",
    accentColor: "gold" as const,
    logoUrl: "/yangi avlod tadbirkorlari.png",
  },
  {
    title: "Yosh tadbirkorlar chempionati",
    description: "Eng yaxshi biznes loyihalar va startaplar o'rtasida o'tkaziladigan respublika tanlovi hamda amaliy tanlov loyihasi.",
    slug: "yosh-tadbirkorlar-chempionati",
    accentColor: "purple" as const,
    logoUrl: "/yosh tadbirkorlar chempionati.png",
  },
  {
    title: "Qizlar biznes akademiyasi",
    description: "Xotin-qizlar tadbirkorligini rivojlantirish, ularga biznes va yetakchilik ko'nikmalarini o'rgatish bo'yicha maxsus akademiya.",
    slug: "qizlar-biznes-akademiyasi",
    accentColor: "pink" as const,
    logoUrl: "/qizlar_biznes_akademiyasi_logo.jpg",
  },
];

export default function Home() {
  const router = useRouter();
  
  return (
    <div className="w-full flex-grow flex flex-col justify-start items-center bg-background px-4 py-8 sm:px-6 md:py-12">
      {/* Decorative background shapes */}
      <div className="absolute top-[20%] left-[-10%] w-72 h-72 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-72 h-72 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />

      {/* Content wrapper */}
      <div className="w-full max-w-2xl flex flex-col space-y-8">
        
        {/* Welcome / Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center flex flex-col items-center"
        >
          <h1 className="font-montserrat text-3xl sm:text-4xl font-extrabold text-primary tracking-tight leading-tight">
            Kelajakni birgalikda quramiz
          </h1>
          <p className="mt-2.5 font-sans text-sm sm:text-base text-on-surface-variant max-w-md">
            Yoshlar tadbirkorligini rivojlantirish jamg&apos;armasi (YTRJ) tomonidan tashkil etilgan loyihalardan birini tanlang va o&apos;z qiziqishingizni bildiring. Biznesingizni biz bilan boshlang!
          </p>
        </motion.div>

        {/* Samarqand & Surxondaryo Special Bootcamp Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="relative overflow-hidden rounded-[24px] border border-secondary/20 bg-gradient-to-br from-primary to-primary-container p-6 text-white shadow-ambient-lg"
        >
          {/* Animated decorative bubble */}
          <div className="absolute right-[-10%] top-[-20%] w-48 h-48 rounded-full bg-secondary-fixed/10 blur-2xl pointer-events-none" />
          <div className="absolute left-[-5%] bottom-[-15%] w-32 h-32 rounded-full bg-tertiary/10 blur-xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-inter font-extrabold uppercase tracking-wider bg-secondary text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Yaqinda bo&apos;lib o&apos;tadi
              </span>
              <h2 className="font-montserrat text-xl sm:text-2xl font-extrabold tracking-tight">
                Qashqadaryo Biznes Bootcamp 2026
              </h2>
              <p className="font-sans text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed">
                Tadbirkorlikni boshlash, kengaytirish va yangi g&apos;oyalarni amalda tatbiq etish bo&apos;yicha maxsus master-klasslar va mentorlik darslari.
              </p>
              
              <div className="flex flex-col gap-3 pt-1 text-xs">
                <div className="flex items-center gap-2.5 text-white/90">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-secondary-fixed text-sm">📍</span>
                  <div>
                    <span className="font-bold block text-sm">Qashqadaryo: 15-Iyun</span>
                    <span className="text-[11px] text-white/70">Shahrisabz, Amir Temur xiyoboni</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/buxoro-navoiy')}
              className="flex items-center justify-center gap-2 rounded-xl bg-secondary hover:bg-secondary-fixed-dim text-white font-inter font-bold text-sm py-4 px-5 transition-all shadow-md hover:shadow-lg self-start md:self-center cursor-pointer whitespace-nowrap group"
            >
              SAVOLNOMANI TO&apos;LDIRISH
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* Project cards container */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-inter text-xs font-extrabold uppercase tracking-wider text-primary/70">
              Mavjud Yo&apos;nalishlar
            </span>
            <span className="font-sans text-[11px] text-on-surface-variant/70">
              6 ta faol loyiha
            </span>
          </div>

          {/* Cards Stack */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {projects.map((proj, idx) => (
              <motion.div
                key={proj.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="h-full"
              >
                <ProjectCard
                  title={proj.title}
                  description={proj.description}
                  slug={proj.slug}
                  accentColor={proj.accentColor}
                  logoUrl={proj.logoUrl}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl glassmorphism-accent p-4 text-center border border-outline-variant/30"
        >
          <p className="font-sans text-xs text-on-surface-variant/80">
            Ushbu QR-kodni skanerlash sizga bootcamp mashg&apos;ulotlari davomida yakka tartibdagi konsultatsiyalarga tezkor kirish imkonini beradi.
          </p>
        </motion.div>
        
      </div>
    </div>
  );
}
