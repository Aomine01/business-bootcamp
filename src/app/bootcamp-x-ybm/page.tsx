'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, ChevronRight, Check, User, Briefcase, GraduationCap } from 'lucide-react';
import { TextInput, PhoneInput, TextArea } from '@/components/FormFields';
import { submitBootcampXYbmRegistration } from '@/lib/supabase';

// Form validation schema with conditional refinement
const ybmSchema = z.object({
  // 1-BO’LIM. Umumiy ma’lumotlar
  fullName: z.string().min(3, "Ism va familiyangiz kamida 3 ta harfdan iborat bo'lishi kerak"),
  birthDate: z.string().min(1, "Tug'ilgan sana kiritilishi shart"),
  phoneNumber: z.string().length(9, "Telefon raqamingiz 9 ta raqamdan iborat bo'lishi kerak"),
  region: z.string().min(1, "Yashash hududingizni tanlang"),
  entrepreneurshipStatus: z.string().min(1, "Tadbirkorlik maqomingizni belgilang"),

  // 2-BO’LIM. Biznesingiz haqida (Optional, validated via superRefine)
  businessName: z.string().optional(),
  businessDirection: z.string().optional(),
  businessDescription: z.string().optional(),
  monthlyTurnover: z.string().optional(),
  socialMedia: z.string().optional(),

  // 3-BO’LIM. G’oyangiz haqida (Optional, validated via superRefine)
  ideaDescription: z.string().optional(),
  ideaDirection: z.string().optional(),

  // 4-BO’LIM. Yakuniy savol
  expectedResults: z.string().min(10, "Kutilayotgan natijangizni batafsil yozing (kamida 10 ta belgi)"),
  discoverySource: z.string().optional(),
}).superRefine((data, ctx) => {
  const isEntrepreneur = data.entrepreneurshipStatus !== "Yo’q, lekin biznes g’oyam bor";

  if (isEntrepreneur) {
    if (!data.businessName || data.businessName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessName'],
        message: "Biznesingiz yoki brendingiz nomini kiriting",
      });
    }
    if (!data.businessDirection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessDirection'],
        message: "Faoliyat yo'nalishingizni tanlang",
      });
    }
    if (!data.businessDescription || data.businessDescription.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessDescription'],
        message: "Mahsulot yoki xizmatingiz haqida batafsil yozing (kamida 10 ta belgi)",
      });
    }
    if (!data.monthlyTurnover) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monthlyTurnover'],
        message: "O'rtacha oylik aylanmangizni tanlang",
      });
    }
  } else {
    if (!data.ideaDescription || data.ideaDescription.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ideaDescription'],
        message: "Biznes g'oyangizni batafsil yozing (kamida 10 ta belgi)",
      });
    }
    if (!data.ideaDirection) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ideaDirection'],
        message: "G'oyangiz qaysi yo'nalishga tegishli ekanligini tanlang",
      });
    }
  }
});

type YbmFormValues = z.infer<typeof ybmSchema>;

export default function YbmQuestionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step3Timestamp, setStep3Timestamp] = useState<number>(0);
  const [isDedicatedDomain, setIsDedicatedDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('business-bootcamp-ybm.uz')) {
        setIsDedicatedDomain(true);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<YbmFormValues>({
    resolver: zodResolver(ybmSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      birthDate: '',
      phoneNumber: '',
      region: '',
      entrepreneurshipStatus: '',
      businessName: '',
      businessDirection: '',
      businessDescription: '',
      monthlyTurnover: '',
      socialMedia: '',
      ideaDescription: '',
      ideaDirection: '',
      expectedResults: '',
      discoverySource: '',
    },
  });

  const watchedStatus = watch('entrepreneurshipStatus');
  const watchedRegion = watch('region');
  const watchedBusinessDirection = watch('businessDirection');
  const watchedIdeaDirection = watch('ideaDirection');
  const watchedTurnover = watch('monthlyTurnover');
  const watchedSource = watch('discoverySource');

  const isEntrepreneur = watchedStatus !== "Yo’q, lekin biznes g’oyam bor";

  const steps = [
    { id: 1, name: "Umumiy", icon: User },
    { id: 2, name: isEntrepreneur ? "Biznes" : "G'oya", icon: Briefcase },
    { id: 3, name: "Yakuniy", icon: GraduationCap },
  ];

  // Helper to validate step transitions
  const nextStep = async () => {
    let fieldsToValidate: Array<keyof YbmFormValues> = [];

    if (step === 1) {
      fieldsToValidate = ['fullName', 'birthDate', 'phoneNumber', 'region', 'entrepreneurshipStatus'];
    } else if (step === 2) {
      if (isEntrepreneur) {
        fieldsToValidate = ['businessName', 'businessDirection', 'businessDescription', 'monthlyTurnover'];
      } else {
        fieldsToValidate = ['ideaDescription', 'ideaDirection'];
      }
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => {
        const next = Math.min(prev + 1, 3);
        if (next === 3) {
          setStep3Timestamp(Date.now());
        }
        return next;
      });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values: YbmFormValues) => {
    if (step < 3 || (Date.now() - step3Timestamp < 600)) {
      return;
    }
    setSubmitError(null);
    const fullPhoneNumber = `+998${values.phoneNumber}`;

    const payload = {
      full_name: values.fullName,
      birth_date: values.birthDate,
      phone_number: fullPhoneNumber,
      region: values.region,
      entrepreneurship_status: values.entrepreneurshipStatus,
      business_name: isEntrepreneur ? values.businessName : undefined,
      business_direction: isEntrepreneur ? values.businessDirection : undefined,
      business_description: isEntrepreneur ? values.businessDescription : undefined,
      monthly_turnover: isEntrepreneur ? values.monthlyTurnover : undefined,
      social_media: isEntrepreneur ? (values.socialMedia || undefined) : undefined,
      idea_description: !isEntrepreneur ? values.ideaDescription : undefined,
      idea_direction: !isEntrepreneur ? values.ideaDirection : undefined,
      expected_results: values.expectedResults,
      discovery_source: values.discoverySource || undefined,
    };

    const result = await submitBootcampXYbmRegistration(payload);

    if (result.success) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ybm_last_registration_details', JSON.stringify({
          fullName: values.fullName,
          businessName: isEntrepreneur ? values.businessName : values.ideaDescription?.substring(0, 30) + "...",
        }));
      }
      if (isDedicatedDomain) {
        router.push('/success');
      } else {
        router.push('/bootcamp-x-ybm/success');
      }
    } else {
      setSubmitError(result.error || "Tizimga yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
  };

  const directionOptions = [
    "Savdo va e-tijorat", "Ishlab chiqarish", "Xizmat ko’rsatish", 
    "Oziq-ovqat", "Ta’lim", "IT/Texnologiya", 
    "Qishloq xo’jaligi", "Qurilish", "Logistika", 
    "Turizm", "Boshqa"
  ];

  return (
    <div className="w-full flex-grow flex flex-col justify-start items-center bg-background px-3 py-4 sm:px-6 sm:py-8">
      {/* Decorative Blurs */}
      <div className="absolute top-[10%] left-[-5%] w-96 h-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col space-y-6 z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => {
              if (isDedicatedDomain) {
                window.location.href = 'https://www.business-bootcamp.uz';
              } else {
                router.push('/');
              }
            }}
            className="self-start inline-flex items-center text-xs font-inter font-bold uppercase tracking-wider text-primary/70 hover:text-primary transition-colors py-1.5"
          >
            <ChevronLeft size={16} className="mr-1 text-secondary" />
            Bosh Sahifaga
          </button>

          <div className="border-l-4 border-secondary pl-4 py-1.5">
            <span className="text-[10px] font-inter font-extrabold uppercase tracking-widest text-secondary">
              YOSHLAR BIZNES MAKTABI
            </span>
            <h1 className="font-montserrat text-xl sm:text-2xl font-extrabold text-primary tracking-tight leading-snug">
              Yoshlar Biznes Maktabi x Bootcamp
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Yoshlar biznes maktabida o&apos;qishni istagan tadbirkorlar uchun maxsus so&apos;rovnoma.
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-4 shadow-ambient">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-surface-container" />
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 h-[2px] bg-secondary transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center z-10 relative">
                  <button
                    type="button"
                    onClick={async () => {
                      if (s.id < step) {
                        setStep(s.id);
                      } else if (s.id > step) {
                        let canJump = true;
                        for (let i = step; i < s.id; i++) {
                          let fields: Array<keyof YbmFormValues> = [];
                          if (i === 1) fields = ['fullName', 'birthDate', 'phoneNumber', 'region', 'entrepreneurshipStatus'];
                          else if (i === 2) fields = isEntrepreneur ? ['businessName', 'businessDirection', 'businessDescription', 'monthlyTurnover'] : ['ideaDescription', 'ideaDirection'];

                          const check = await trigger(fields);
                          if (!check) {
                            canJump = false;
                            setStep(i);
                            break;
                          }
                        }
                        if (canJump) setStep(s.id);
                      }
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 border-2 font-inter text-xs font-bold ${
                      isCurrent
                        ? 'bg-primary border-primary text-white scale-110 shadow-md'
                        : isActive
                          ? 'bg-secondary border-secondary text-white'
                          : 'bg-white border-outline-variant text-on-surface-variant'
                    }`}
                  >
                    {isActive && step > s.id ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                  </button>
                  <span className={`text-[10px] mt-1.5 font-semibold font-sans ${
                    isCurrent ? 'text-primary font-bold' : isActive ? 'text-secondary' : 'text-on-surface-variant/50'
                  }`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-[24px] border border-outline-variant/50 p-5 sm:p-7 shadow-ambient-lg min-h-[440px] flex flex-col justify-between overflow-hidden relative">
          
          {submitError && (
            <div className="mb-5 p-3.5 rounded-[8px] bg-error-container text-on-error-container border border-error/20 text-xs font-sans font-medium flex items-center">
              <span className="mr-2 text-sm">⚠️</span> {submitError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
                nextStep();
              }
            }}
            className="flex-grow flex flex-col justify-between"
          >
            <div className="mb-6">
              <AnimatePresence mode="wait" initial={false}>
                
                {/* STEP 1: Personal Info */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">1-BO’LIM. Umumiy ma’lumotlar</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Siz bilan bog&apos;lanish va tadbirkorlik maqomingizni aniqlash uchun zarur bo&apos;lgan asosiy ma&apos;lumotlar.</p>
                    </div>

                    <TextInput
                      label="To‘liq ismingiz (F.I.Sh.) *"
                      placeholder="F.I.Sh. kiriting"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label="Tug‘ilgan sanangiz *"
                        type="date"
                        error={errors.birthDate?.message}
                        {...register('birthDate')}
                      />

                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <PhoneInput
                            label="Telefon raqamingiz *"
                            value={value}
                            onChange={onChange}
                            error={errors.phoneNumber?.message}
                          />
                        )}
                      />
                    </div>

                    <div className="w-full flex flex-col space-y-1.5">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Yashash hududingiz *
                      </label>
                      <select
                        className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                          errors.region ? 'border-error focus:border-error focus:ring-error/5' : ''
                        }`}
                        value={watchedRegion}
                        {...register('region')}
                      >
                        <option value="">Tanlang...</option>
                        {[
                          "Qoraqalpog’iston Respublikasi", "Andijon", "Buxoro", 
                          "Farg’ona", "Jizzax", "Namangan", "Navoiy", 
                          "Qashqadaryo", "Samarqand", "Sirdaryo", 
                          "Surxondaryo", "Toshkent viloyati", "Toshkent shahri", "Xorazm"
                        ].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {errors.region && (
                        <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.region.message}
                        </span>
                      )}
                    </div>

                    <div className="w-full flex flex-col space-y-2 pt-1.5">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Hozirda tadbirkorlik bilan shug’ullanasizmi? *
                      </label>
                      <div className="flex flex-col space-y-2">
                        {[
                          "Ha, faoliyat yuritayotgan biznesim bor",
                          "Endi boshlayapman (ro’yxatdan o’tganman, faoliyat boshlanmagan)",
                          "Yo’q, lekin biznes g’oyam bor"
                        ].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setValue('entrepreneurshipStatus', opt, { shouldValidate: true });
                            }}
                            className={`py-3.5 px-4 rounded-xl border-2 font-inter font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-left ${
                              watchedStatus === opt
                                ? 'border-primary bg-primary/5 text-primary shadow-sm font-extrabold'
                                : 'border-outline-variant/50 hover:border-primary/40 bg-white text-on-surface-variant'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {errors.entrepreneurshipStatus && (
                        <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.entrepreneurshipStatus.message}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Conditional Details */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {isEntrepreneur ? (
                      <>
                        <div className="border-b border-outline-variant/30 pb-3 mb-2">
                          <h2 className="font-montserrat text-base font-extrabold text-primary">2-BO’LIM. Biznesingiz haqida</h2>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Faoliyat yuritayotgan yoki yangi ro&apos;yxatdan o&apos;tgan kompaniyangiz / brendingiz haqida tafsilotlar.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <TextInput
                            label="Biznesingiz yoki brendingiz nomi *"
                            placeholder="Nomi kiriting"
                            error={errors.businessName?.message}
                            {...register('businessName')}
                          />

                          <div className="w-full flex flex-col space-y-1.5">
                            <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                              Faoliyat yo’nalishingiz *
                            </label>
                            <select
                              className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                                errors.businessDirection ? 'border-error focus:border-error focus:ring-error/5' : ''
                              }`}
                              value={watchedBusinessDirection}
                              {...register('businessDirection')}
                            >
                              <option value="">Tanlang...</option>
                              {directionOptions.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            {errors.businessDirection && (
                              <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                                <span className="mr-1">⚠️</span> {errors.businessDirection.message}
                              </span>
                            )}
                          </div>
                        </div>

                        <TextArea
                          label="Mahsulot yoki xizmatingiz haqida qisqacha yozing (2–3 jumla) *"
                          placeholder="Biznesingiz nimani taqdim qilishi haqida batafsil ma'lumot"
                          error={errors.businessDescription?.message}
                          {...register('businessDescription')}
                        />

                        <div className="w-full flex flex-col space-y-1.5 pt-1.5">
                          <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                            O’rtacha oylik aylanmangiz *
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {["0–100 mln", "100–300 mln", "300–500 mln", "500 mln dan ortiq"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setValue('monthlyTurnover', opt, { shouldValidate: true });
                                }}
                                className={`py-3 px-2 rounded-xl border-2 font-inter font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center ${
                                  watchedTurnover === opt
                                    ? 'border-secondary bg-secondary/5 text-secondary shadow-sm'
                                    : 'border-outline-variant/50 hover:border-primary/40 bg-white text-on-surface-variant'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {errors.monthlyTurnover && (
                            <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                              <span className="mr-1">⚠️</span> {errors.monthlyTurnover.message}
                            </span>
                          )}
                        </div>

                        <div className="pt-1.5">
                          <TextInput
                            label="Ijtimoiy tarmoq yoki veb-sayt havolangiz"
                            placeholder="instagram.com/brand, brand.uz (ixtiyoriy)"
                            error={errors.socialMedia?.message}
                            {...register('socialMedia')}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="border-b border-outline-variant/30 pb-3 mb-2">
                          <h2 className="font-montserrat text-base font-extrabold text-primary">3-BO’LIM. G’oyangiz haqida</h2>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">Siz amalga oshirmoqchi bo&apos;lgan biznes g&apos;oyangiz haqida ma&apos;lumot.</p>
                        </div>

                        <TextArea
                          label="Biznes g’oyangizni 2–3 jumlada yozing *"
                          placeholder="Qanday biznes yaratmoqchisiz va qaysi muammoni hal qilasiz?"
                          error={errors.ideaDescription?.message}
                          {...register('ideaDescription')}
                        />

                        <div className="w-full flex flex-col space-y-1.5">
                          <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                            G’oyangiz qaysi yo’nalishga tegishli? *
                          </label>
                          <select
                            className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                              errors.ideaDirection ? 'border-error focus:border-error focus:ring-error/5' : ''
                            }`}
                            value={watchedIdeaDirection}
                            {...register('ideaDirection')}
                          >
                            <option value="">Tanlang...</option>
                            {directionOptions.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          {errors.ideaDirection && (
                            <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                              <span className="mr-1">⚠️</span> {errors.ideaDirection.message}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Final Section */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">4-BO’LIM. Yakuniy savollar</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Dasturga ariza topshirishdagi maqsadlaringiz va qiziqishlaringiz.</p>
                    </div>

                    <TextArea
                      label="Yoshlar Biznes Maktabidan qanday natija kutasiz? *"
                      placeholder="Dastur davomida qaysi bilimlarni olmoqchisiz yoki maqsadlaringiz qanday?"
                      error={errors.expectedResults?.message}
                      {...register('expectedResults')}
                    />

                    <div className="w-full flex flex-col space-y-1.5 pt-2">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Biz haqimizda qayerdan bilib oldingiz?
                      </label>
                      <select
                        className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                          errors.discoverySource ? 'border-error focus:border-error focus:ring-error/5' : ''
                        }`}
                        value={watchedSource}
                        {...register('discoverySource')}
                      >
                        <option value="">Tanlang... (ixtiyoriy)</option>
                        {[
                          "Instagram/Facebook",
                          "Telegram",
                          "Do’st tavsiyasi",
                          "O’zingiz bog’landingiz"
                        ].map((src) => (
                          <option key={src} value={src}>{src}</option>
                        ))}
                      </select>
                      {errors.discoverySource && (
                        <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.discoverySource.message}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Stepper Navigation Actions */}
            <div className="flex space-x-3 pt-5 border-t border-outline-variant/30 mt-auto">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="flex-1 flex justify-center items-center rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-inter font-bold text-sm tracking-wide py-3.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Orqaga
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-grow flex justify-center items-center rounded-xl bg-primary hover:bg-primary-container text-white font-inter font-bold text-sm tracking-wide py-3.5 transition-colors cursor-pointer"
                >
                  Keyingisi
                  <ChevronRight size={16} className="ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-grow flex justify-center items-center rounded-xl bg-gradient-to-r from-primary to-primary-container hover:from-primary-container hover:to-primary text-white font-inter font-bold text-sm tracking-wider py-3.5 px-6 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                    "YUBORISH"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Security / Privacy disclaimer */}
        <p className="text-[10px] text-center text-on-surface-variant/60 font-sans leading-relaxed">
          Taqdim etilgan ma&apos;lumotlar xavfsiz saqlanadi va faqat Yoshlar Biznes Maktabi (YBM) hamda Business Bootcamp 2026 tashkilotchilari tomonidan foydalaniladi.
        </p>

      </div>
    </div>
  );
}
