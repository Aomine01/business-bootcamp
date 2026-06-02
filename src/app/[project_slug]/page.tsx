'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft } from 'lucide-react';
import { TextInput, PhoneInput, TextArea } from '@/components/FormFields';
import { submitRegistration } from '@/lib/supabase';

const projectSlugMap: Record<string, string> = {
  'yoshlar-tadbirkorligini-rivojlantirish-jamgarmasi': "Yoshlar Tadbirkorligini rivojlantirish jamg'armasi",
  'yoshlar-biznes-maktabi': "Yoshlar biznes maktabi",
  'komak': "Ko'mak",
  'yosh-avlod-tadbirkorlari': "Yosh avlod Tadbirkorlari",
};

const validationSchema = z.object({
  firstName: z.string().min(2, "Ismingiz kamida 2 ta harfdan iborat bo'lishi kerak"),
  surname: z.string().min(2, "Familiyangiz kamida 2 ta harfdan iborat bo'lishi kerak"),
  phoneNumber: z.string().length(9, "Telefon raqamingiz 9 ta raqamdan iborat bo'lishi kerak"),
  interestReason: z.string().min(10, "Ushbu loyiha haqidagi fikringizni kamida 10 ta belgida yozing"),
});

type FormValues = z.infer<typeof validationSchema>;

export default function RegistrationForm() {
  const params = useParams();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const slug = params.project_slug as string;
  const projectName = projectSlugMap[slug] || "Business Bootcamp Loyihasi";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstName: '',
      surname: '',
      phoneNumber: '',
      interestReason: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const fullPhoneNumber = `+998${values.phoneNumber}`;
    
    const payload = {
      project_name: projectName,
      first_name: values.firstName,
      surname: values.surname,
      phone_number: fullPhoneNumber,
      interest_reason: values.interestReason,
    };

    const result = await submitRegistration(payload);

    if (result.success) {
      router.push(`/${slug}/success`);
    } else {
      setSubmitError(result.error || "Tizimga yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
  };

  return (
    <motion.div
      initial={{ x: '100vw', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100vw', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="w-full flex-grow flex flex-col justify-start items-center bg-background px-4 py-6 sm:px-6"
    >
      <div className="w-full max-w-md flex flex-col space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => router.push('/')}
            className="self-start inline-flex items-center text-xs font-inter font-bold uppercase tracking-wider text-primary/70 hover:text-primary transition-colors py-1.5"
          >
            <ChevronLeft size={16} className="mr-1 text-secondary" />
            Bosh Sahifaga
          </button>
          
          <div className="border-l-4 border-secondary pl-3 py-1">
            <span className="text-[10px] font-inter font-extrabold uppercase tracking-widest text-secondary">
              RO&apos;YXATDAN O&apos;TISH
            </span>
            <h1 className="font-montserrat text-xl sm:text-2xl font-extrabold text-primary tracking-tight leading-snug">
              {projectName}
            </h1>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-[24px] border border-outline-variant/50 p-6 shadow-ambient">
          
          {submitError && (
            <div className="mb-5 p-3.5 rounded-[8px] bg-error-container text-on-error-container border border-error/20 text-xs font-sans font-medium flex items-center">
              <span className="mr-2 text-sm">⚠️</span> {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-5">
            
            <TextInput
              label="Ismingiz (First Name)"
              placeholder="Ismingizni kiriting"
              error={errors.firstName?.message}
              {...register('firstName')}
              disabled={isSubmitting}
            />

            <TextInput
              label="Familiyangiz (Surname)"
              placeholder="Familiyangizni kiriting"
              error={errors.surname?.message}
              {...register('surname')}
              disabled={isSubmitting}
            />

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  label="Telefon raqamingiz"
                  value={value}
                  onChange={onChange}
                  error={errors.phoneNumber?.message}
                  disabled={isSubmitting}
                />
              )}
            />

            <TextArea
              label="Loyiha qiziqish sababi"
              placeholder="Ushbu loyihaga nega qiziqasiz? Biznes maqsadlaringiz nima?"
              error={errors.interestReason?.message}
              {...register('interestReason')}
              disabled={isSubmitting}
            />

            {/* Sticky/Tappable submit button container */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center rounded-[8px] bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-white font-inter font-bold text-sm tracking-wider py-4 px-6 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    YUBORILMOQDA...
                  </>
                ) : (
                  "RO'YXATDAN O'TISH"
                )}
              </button>
            </div>
            
          </form>
        </div>

        {/* Security / Privacy disclaimer */}
        <p className="text-[10px] text-center text-on-surface-variant/60 font-sans leading-relaxed">
          Taqdim etilgan ma&apos;lumotlar xavfsiz saqlanadi va faqat Business Bootcamp 2026 tashkilotchilari tomonidan foydalaniladi.
        </p>

      </div>
    </motion.div>
  );
}
