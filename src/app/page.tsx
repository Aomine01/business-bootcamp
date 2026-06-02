'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';

const projects = [
  {
    title: "Yoshlar Tadbirkorligini rivojlantirish jamg'armasi",
    description: "Moliyaviy ko'mak, imtiyozli kreditlar va yosh tadbirkorlarning startap loyihalarini qo'llab-quvvatlash jamg'armasi.",
    slug: "yoshlar-tadbirkorligini-rivojlantirish-jamgarmasi",
    accentColor: "blue" as const,
    logoUrl: "/ytrj.png",
  },
  {
    title: "Yoshlar biznes maktabi",
    description: "Tadbirkorlik asoslari, biznes rejalashtirish va amaliy marketing ko'nikmalarini o'rgatishga yo'naltirilgan o'quv dasturlari.",
    slug: "yoshlar-biznes-maktabi",
    accentColor: "green" as const,
    logoUrl: "/YBM logo-03.png",
  },
  {
    title: "Ko'mak",
    description: "Biznes yuritishdagi muammolarni hal qilish, huquqiy va amaliy maslahatlar olish uchun yordam platformasi.",
    slug: "komak",
    accentColor: "teal" as const,
    logoUrl: "/komak.svg",
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
            O&apos;zingizga ma&apos;qul kelgan yo&apos;nalishni tanlang va ro&apos;yxatdan o&apos;ting. Biznesingizni biz bilan boshlang!
          </p>
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
