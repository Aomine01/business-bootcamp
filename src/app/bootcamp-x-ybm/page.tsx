'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, ChevronRight, Check, User, Briefcase, BarChart3, Target, GraduationCap } from 'lucide-react';
import { TextInput, PhoneInput, TextArea } from '@/components/FormFields';
import { submitBootcampXYbmRegistration } from '@/lib/supabase';

// Form validation schema
const ybmSchema = z.object({
  // Step 1: Personal Info
  fullName: z.string().min(3, "Ism va familiyangiz kamida 3 ta harfdan iborat bo'lishi kerak"),
  birthDate: z.string().min(1, "Tug'ilgan sana kiritilishi shart"),
  gender: z.string().min(1, "Jinsingizni tanlang"),
  phoneNumber: z.string().length(9, "Telefon raqamingiz 9 ta raqamdan iborat bo'lishi kerak"),
  region: z.string().min(1, "Yashash hududingizni tanlang"),

  // Step 2: Business Info
  businessName: z.string().min(2, "Biznesingiz yoki brendingiz nomini kiriting"),
  businessStatus: z.string().min(1, "Biznesdagi maqomingizni tanlang"),
  businessDirection: z.string().min(1, "Faoliyat yo'nalishingizni tanlang"),
  businessDescription: z.string().min(10, "Biznesingiz yoki xizmatingiz haqida batafsil yozing (kamida 10 ta belgi)"),
  businessStructure: z.string().min(1, "Biznes shaklini tanlang"),

  // Step 3: Metrics & Socials
  employeeCount: z.string().min(1, "Biznesda xodimlaringiz sonini tanlang"),
  monthlyTurnover: z.string().min(1, "O'rtacha oylik aylanmangizni tanlang"),
  socialMedia: z.string().min(3, "Ijtimoiy tarmoqlar yoki veb-sayt havolasini qoldiring"),

  // Step 4: Analysis & Vision
  competitiveAdvantage: z.string().min(10, "Raqobatchilardan ajratib turadigan jihatni yozing (kamida 10 ta belgi)"),
  growthSixMonths: z.string().min(5, "Oxirgi 6 oylik o'sishni kiriting (kamida 5 ta belgi)"),
  fiveYearVision: z.string().min(10, "5 yildan keyingi maqsadlarni kiriting (kamida 10 ta belgi)"),
  painPointSolved: z.string().optional(),

  // Step 5: Source & Expectations
  discoverySource: z.string().min(1, "Bizni qayerdan topganingizni tanlang"),
  mainChallenges: z.string().optional(),
  expectedResults: z.string().optional(),
});

type YbmFormValues = z.infer<typeof ybmSchema>;

export default function YbmQuestionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step5Timestamp, setStep5Timestamp] = useState<number>(0);
  const [isDedicatedDomain, setIsDedicatedDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('business-bootcamp-ybm.uz') || hostname.includes('ybm.localhost')) {
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
      gender: '',
      phoneNumber: '',
      region: '',
      businessName: '',
      businessStatus: '',
      businessDirection: '',
      businessDescription: '',
      businessStructure: '',
      employeeCount: '',
      monthlyTurnover: '',
      socialMedia: '',
      competitiveAdvantage: '',
      growthSixMonths: '',
      fiveYearVision: '',
      painPointSolved: '',
      discoverySource: '',
      mainChallenges: '',
      expectedResults: '',
    },
  });

  const watchedGender = watch('gender');
  const watchedRegion = watch('region');
  const watchedStatus = watch('businessStatus');
  const watchedDirection = watch('businessDirection');
  const watchedStructure = watch('businessStructure');
  const watchedEmployee = watch('employeeCount');
  const watchedTurnover = watch('monthlyTurnover');
  const watchedSource = watch('discoverySource');

  const steps = [
    { id: 1, name: "Shaxsiy", icon: User },
    { id: 2, name: "Biznes", icon: Briefcase },
    { id: 3, name: "Ko'rsatkichlar", icon: BarChart3 },
    { id: 4, name: "Kelajak", icon: Target },
    { id: 5, name: "Kutishlar", icon: GraduationCap },
  ];

  // Helper to validate step transitions
  const nextStep = async () => {
    let fieldsToValidate: Array<keyof YbmFormValues> = [];

    if (step === 1) {
      fieldsToValidate = ['fullName', 'birthDate', 'gender', 'phoneNumber', 'region'];
    } else if (step === 2) {
      fieldsToValidate = ['businessName', 'businessStatus', 'businessDirection', 'businessDescription', 'businessStructure'];
    } else if (step === 3) {
      fieldsToValidate = ['employeeCount', 'monthlyTurnover', 'socialMedia'];
    } else if (step === 4) {
      fieldsToValidate = ['competitiveAdvantage', 'growthSixMonths', 'fiveYearVision'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => {
        const next = Math.min(prev + 1, 5);
        if (next === 5) {
          setStep5Timestamp(Date.now());
        }
        return next;
      });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values: YbmFormValues) => {
    // Avoid double tap or instant enter submission
    if (step < 5 || (Date.now() - step5Timestamp < 600)) {
      return;
    }
    setSubmitError(null);
    const fullPhoneNumber = `+998${values.phoneNumber}`;

    const payload = {
      full_name: values.fullName,
      birth_date: values.birthDate,
      gender: values.gender,
      phone_number: fullPhoneNumber,
      region: values.region,
      business_name: values.businessName,
      business_status: values.businessStatus,
      business_direction: values.businessDirection,
      business_description: values.businessDescription,
      business_structure: values.businessStructure,
      employee_count: values.employeeCount,
      monthly_turnover: values.monthlyTurnover,
      social_media: values.socialMedia,
      competitive_advantage: values.competitiveAdvantage,
      growth_six_months: values.growthSixMonths,
      five_year_vision: values.fiveYearVision,
      pain_point_solved: values.painPointSolved || undefined,
      discovery_source: values.discoverySource,
      main_challenges: values.mainChallenges || undefined,
      expected_results: values.expectedResults || undefined,
    };

    const result = await submitBootcampXYbmRegistration(payload);

    if (result.success) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ybm_last_registration_details', JSON.stringify({
          fullName: values.fullName,
          businessName: values.businessName,
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
              style={{ width: `${((step - 1) / 4) * 100}%` }}
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
                          if (i === 1) fields = ['fullName', 'birthDate', 'gender', 'phoneNumber', 'region'];
                          else if (i === 2) fields = ['businessName', 'businessStatus', 'businessDirection', 'businessDescription', 'businessStructure'];
                          else if (i === 3) fields = ['employeeCount', 'monthlyTurnover', 'socialMedia'];
                          else if (i === 4) fields = ['competitiveAdvantage', 'growthSixMonths', 'fiveYearVision'];

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
                  <span className={`text-[9px] sm:text-[10px] mt-1.5 font-semibold font-sans ${
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
        <div className="bg-white rounded-[24px] border border-outline-variant/50 p-5 sm:p-7 shadow-ambient-lg min-h-[460px] flex flex-col justify-between overflow-hidden relative">
          
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
                      <h2 className="font-montserrat text-base font-extrabold text-primary">1. Shaxsiy ma&apos;lumotlar</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Siz bilan bog&apos;lanish va dasturga kiritish uchun zarur bo&apos;lgan asosiy ma&apos;lumotlar.</p>
                    </div>

                    <TextInput
                      label="To‘liq ismingiz (F.I.Sh) *"
                      placeholder="Masalan: Alisherov Sardor"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label="Tug‘ilgan sana *"
                        type="date"
                        error={errors.birthDate?.message}
                        {...register('birthDate')}
                      />

                      <div className="w-full flex flex-col space-y-1.5">
                        <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                          Jinsi *
                        </label>
                        <select
                          className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                            errors.gender ? 'border-error focus:border-error focus:ring-error/5' : ''
                          }`}
                          value={watchedGender}
                          {...register('gender')}
                        >
                          <option value="">Tanlang...</option>
                          <option value="Erkak">Erkak</option>
                          <option value="Ayol">Ayol</option>
                        </select>
                        {errors.gender && (
                          <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                            <span className="mr-1">⚠️</span> {errors.gender.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            "Toshkent shahar", "Toshkent viloyati", "Andijon viloyati", 
                            "Farg'ona viloyati", "Namangan viloyati", "Sirdaryo viloyati", 
                            "Jizzax viloyati", "Samarqand viloyati", "Navoiy viloyati", 
                            "Buxoro viloyati", "Xorazm viloyati", "Qashqadaryo viloyati", 
                            "Surxandaryo viloyati", "Qoraqalpog'iston Respublikasi"
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
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Business Info */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">2. Biznesingiz tafsilotlari</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Kompaniyangiz yoki brendingiz, shuningdek biznesdagi o&apos;rningiz haqida ma&apos;lumot.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label="Biznesingiz yoki brend nomi *"
                        placeholder="Masalan: EcoClean, Safar Express"
                        error={errors.businessName?.message}
                        {...register('businessName')}
                      />

                      <div className="w-full flex flex-col space-y-1.5">
                        <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                          Biznesdagi maqomingiz *
                        </label>
                        <select
                          className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                            errors.businessStatus ? 'border-error focus:border-error focus:ring-error/5' : ''
                          }`}
                          value={watchedStatus}
                          {...register('businessStatus')}
                        >
                          <option value="">Tanlang...</option>
                          {["Asoschi", "Yo'llanma rahbar", "Investor", "G’oya egasi", "Boshqa"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.businessStatus && (
                          <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                            <span className="mr-1">⚠️</span> {errors.businessStatus.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="w-full flex flex-col space-y-1.5">
                        <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                          Faoliyat yo’nalishingiz *
                        </label>
                        <select
                          className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                            errors.businessDirection ? 'border-error focus:border-error focus:ring-error/5' : ''
                          }`}
                          value={watchedDirection}
                          {...register('businessDirection')}
                        >
                          <option value="">Tanlang...</option>
                          {[
                            "Chakana savdo", "Dizayn", "Elektron tijorat", "Energetika", "Farmasevtika",
                            "Fintech", "Huquq", "Ilmiy tadqiqot", "Ishlab chiqarish", "Kimyo sanoati",
                            "Ko‘chmas mulk", "Ko‘ngil ochar", "Kon sanoati", "Konsalting", "Logistika",
                            "Marketing", "Media", "Moliya", "Notijorat", "Oziq-ovqat va ichimliklar",
                            "Qishloq xo‘jaligi", "Qurilish", "Reklama", "San'at", "Sog‘liqni saqlash",
                            "Sport va salomatlik", "Ta’lim", "Telekommunikatsiya", "Texnologiya",
                            "To‘qimachilik", "Transport", "Turizm", "Boshqalar"
                          ].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        {errors.businessDirection && (
                          <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                            <span className="mr-1">⚠️</span> {errors.businessDirection.message}
                          </span>
                        )}
                      </div>

                      <div className="w-full flex flex-col space-y-1.5">
                        <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                          Biznes shakli *
                        </label>
                        <select
                          className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                            errors.businessStructure ? 'border-error focus:border-error focus:ring-error/5' : ''
                          }`}
                          value={watchedStructure}
                          {...register('businessStructure')}
                        >
                          <option value="">Tanlang...</option>
                          {["MChJ", "YaTT", "O’zini o’zi band qilgan", "Boshqa"].map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        {errors.businessStructure && (
                          <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                            <span className="mr-1">⚠️</span> {errors.businessStructure.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <TextArea
                      label="Mahsulot yoki ko'rsatadigan xizmatingiz haqida batafsil yozing *"
                      placeholder="Biznesingiz qanday ishlaydi, nima taklif qiladi?"
                      error={errors.businessDescription?.message}
                      {...register('businessDescription')}
                    />
                  </motion.div>
                )}

                {/* STEP 3: Metrics & Socials */}
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
                      <h2 className="font-montserrat text-base font-extrabold text-primary">3. Biznes ko&apos;rsatkichlari va aloqa kanallari</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Xodimlar soni, oylik aylanma va marketing manbalari.</p>
                    </div>

                    <div className="w-full flex flex-col space-y-1.5">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Biznesda xodimlar soni *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {["1-10 nafar", "11-20 nafar", "21-50 nafar", "50+ nafar"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setValue('employeeCount', opt, { shouldValidate: true });
                            }}
                            className={`py-3 px-2 rounded-xl border-2 font-inter font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center ${
                              watchedEmployee === opt
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-outline-variant/50 hover:border-primary/40 bg-white text-on-surface-variant'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {errors.employeeCount && (
                        <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.employeeCount.message}
                        </span>
                      )}
                    </div>

                    <div className="w-full flex flex-col space-y-1.5 pt-2">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        O‘rtacha oylik aylanmangiz *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["0-100 mln", "100-300 mln", "300-500 mln", "500 mlndan oshiq"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setValue('monthlyTurnover', opt, { shouldValidate: true });
                            }}
                            className={`py-3.5 px-3 rounded-xl border-2 font-inter font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center ${
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

                    <div className="pt-2">
                      <TextInput
                        label="Ijtimoiy tarmoqlar yoki veb-sayt havolalari *"
                        placeholder="Masalan: instagram.com/brand, t.me/brand, brand.uz"
                        error={errors.socialMedia?.message}
                        {...register('socialMedia')}
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Analysis & Vision */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">4. Biznes tahlili va istiqboli</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Raqobatbardoshlik, oxirgi o&apos;sishlar va kelajakdagi maqsadlaringiz.</p>
                    </div>

                    <TextArea
                      label="Biznesingizni raqobatchilardan ajratib turadigan jihat nima? *"
                      placeholder="Sizning ustunligingiz nima? Nega mijozlar sizni tanlashi kerak?"
                      error={errors.competitiveAdvantage?.message}
                      {...register('competitiveAdvantage')}
                    />

                    <TextInput
                      label="Oxirgi 6 oyda qancha o’sishga erishdingiz? *"
                      placeholder="Masalan: Savdo 20% oshdi, 2 ta yangi filial ochildi"
                      error={errors.growthSixMonths?.message}
                      {...register('growthSixMonths')}
                    />

                    <TextArea
                      label="Besh yildan keyin biznesingizni qanday tasavvur qilasiz? *"
                      placeholder="Sizning strategik maqsadlaringiz va 5 yillik rejangiz"
                      error={errors.fiveYearVision?.message}
                      {...register('fiveYearVision')}
                    />

                    <TextArea
                      label="Biznesingiz jamiyatdagi nima og’riqni hal qilmoqda?"
                      placeholder="Sizning xizmat yoki mahsulotingiz ijtimoiy jihatdan qanday foyda keltiradi? (ixtiyoriy)"
                      error={errors.painPointSolved?.message}
                      {...register('painPointSolved')}
                    />
                  </motion.div>
                )}

                {/* STEP 5: Expectations & Submission */}
                {step === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">5. Kutishlar va so&apos;rovnoma yakuni</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Biznesingizdagi qiyinchiliklar va Yoshlar Biznes Maktabidan kutayotgan natijangiz.</p>
                    </div>

                    <div className="w-full flex flex-col space-y-1.5">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Bizni qayerdan topdinggiz? *
                      </label>
                      <select
                        className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                          errors.discoverySource ? 'border-error focus:border-error focus:ring-error/5' : ''
                        }`}
                        value={watchedSource}
                        {...register('discoverySource')}
                      >
                        <option value="">Tanlang...</option>
                        {[
                          "Instagram/facebook", 
                          "Do'st/Tanish tavsiya qildi", 
                          "Telegram", 
                          "Biz siz bilan o‘zimiz bog‘landik"
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

                    <TextArea
                      label="Biznesingizdagi asosiy qiyinchiliklar nimada?"
                      placeholder="Hozirgi vaqtda sizga nimalar to'sqinlik qilmoqda? (ixtiyoriy)"
                      error={errors.mainChallenges?.message}
                      {...register('mainChallenges')}
                    />

                    <TextArea
                      label="Yoshlar Biznes Maktabidan asosiy kutayotgan natijangiz nima?"
                      placeholder="Dastur tugagandan keyin nimaga erishmoqchisiz? (ixtiyoriy)"
                      error={errors.expectedResults?.message}
                      {...register('expectedResults')}
                    />
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

              {step < 5 ? (
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
