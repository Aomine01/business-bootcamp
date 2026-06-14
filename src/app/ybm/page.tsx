'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, ChevronRight, Check, User, Briefcase, FileText, GraduationCap } from 'lucide-react';
import { TextInput, PhoneInput, TextArea } from '@/components/FormFields';
import { submitYbmRegistration } from '@/lib/supabase';

// Form validation schema with conditional refinement
const ybmSchema = z.object({
  // 1-BO’LIM. Shaxsiy ma’lumotlar
  fullName: z.string().min(3, "Ism va familiyangiz kamida 3 ta harfdan iborat bo'lishi kerak"),
  birthDate: z.string().min(1, "Tug'ilgan sana kiritilishi shart"),
  gender: z.string().min(1, "Jinsingizni tanlang"),
  phoneNumber: z.string().length(9, "Telefon raqamingiz 9 ta raqamdan iborat bo'lishi kerak"),
  region: z.string().min(1, "Yashash hududingizni tanlang"),

  // 2-BO’LIM. Biznes faoliyati
  businessName: z.string().optional(),
  businessStatus: z.string().min(1, "Biznesdagi maqomingizni tanlang"),
  businessDirection: z.string().min(1, "Faoliyat yo'nalishingizni tanlang"),
  businessDescription: z.string().min(10, "Batafsil ma'lumot kiriting (kamida 10 ta belgi)"),
  businessForm: z.string().optional(),
  employeeCount: z.string().optional(),
  monthlyTurnover: z.string().optional(),
  socialMedia: z.string().optional(),

  // 3-BO’LIM. Biznes tahlili
  competitiveAdvantage: z.string().optional(),
  growthSixMonths: z.string().optional(),
  fiveYearVision: z.string().optional(),
  painSolved: z.string().optional(),
  mainChallenges: z.string().optional(),

  // 4-BO’LIM. Yakuniy savollar
  discoverySource: z.string().optional(),
  expectedResults: z.string().min(10, "Kutilayotgan natijangizni batafsil yozing (kamida 10 ta belgi)"),
}).superRefine((data, ctx) => {
  const isIdea = data.businessStatus === "G’oya egasi";

  if (!isIdea) {
    if (!data.businessName || data.businessName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessName'],
        message: "Biznesingiz yoki brendingiz nomini kiriting",
      });
    }
    if (!data.businessForm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessForm'],
        message: "Biznes shaklini tanlang",
      });
    }
    if (!data.employeeCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['employeeCount'],
        message: "Biznesdagi xodimlar sonini tanlang",
      });
    }
    if (!data.monthlyTurnover) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monthlyTurnover'],
        message: "O'rtacha oylik aylanmangizni tanlang",
      });
    }
    if (!data.competitiveAdvantage || data.competitiveAdvantage.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['competitiveAdvantage'],
        message: "Raqobatchilardan ajratib turadigan jihatni yozing (kamida 5 ta belgi)",
      });
    }
    if (!data.growthSixMonths || data.growthSixMonths.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['growthSixMonths'],
        message: "Oxirgi 6 oydagi o'sish ko'rsatkichlarini yozing (kamida 5 ta belgi)",
      });
    }
    if (!data.fiveYearVision || data.fiveYearVision.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fiveYearVision'],
        message: "5 yillik tasavvuringizni yozing (kamida 5 ta belgi)",
      });
    }
    if (!data.painSolved || data.painSolved.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['painSolved'],
        message: "Jamiyatdagi qanday og'riqni hal qilayotganini yozing (kamida 5 ta belgi)",
      });
    }
    if (!data.mainChallenges || data.mainChallenges.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mainChallenges'],
        message: "Asosiy qiyinchiliklarni yozing (kamida 5 ta belgi)",
      });
    }
  }
});

type YbmFormValues = z.infer<typeof ybmSchema>;

export default function YbmQuestionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step4Timestamp, setStep4Timestamp] = useState<number>(0);

  // Connection status & Toast state
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showConnectionToast, setShowConnectionToast] = useState<'online' | 'offline' | null>(null);
  const [isSubmissionSlow, setIsSubmissionSlow] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
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
      businessForm: '',
      employeeCount: '',
      monthlyTurnover: '',
      socialMedia: '',
      competitiveAdvantage: '',
      growthSixMonths: '',
      fiveYearVision: '',
      painSolved: '',
      mainChallenges: '',
      expectedResults: '',
      discoverySource: '',
    },
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const draft = localStorage.getItem('ybm_registration_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          reset(parsed, { keepDefaultValues: true });
        } catch (e) {
          console.error("Failed to restore draft:", e);
        }
      }
    }
  }, [reset]);

  const watchedValues = watch();

  // Save draft to localStorage on values change
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(watchedValues).length > 0) {
      localStorage.setItem('ybm_registration_draft', JSON.stringify(watchedValues));
    }
  }, [watchedValues]);

  // Online / Offline event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => {
      setIsOnline(true);
      setShowConnectionToast('online');
      const timer = setTimeout(() => setShowConnectionToast(null), 3000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowConnectionToast('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const watchedStatus = watchedValues.businessStatus;
  const watchedRegion = watchedValues.region;
  const watchedGender = watchedValues.gender;
  const watchedBusinessDirection = watchedValues.businessDirection;
  const watchedBusinessForm = watchedValues.businessForm;
  const watchedEmployeeCount = watchedValues.employeeCount;
  const watchedTurnover = watchedValues.monthlyTurnover;
  const watchedSource = watchedValues.discoverySource;

  const isEntrepreneur = watchedStatus !== "G’oya egasi";

  const steps = [
    { id: 1, name: "Shaxsiy", icon: User },
    { id: 2, name: "Faoliyat", icon: Briefcase },
    { id: 3, name: "Tahlil", icon: FileText },
    { id: 4, name: "Yakuniy", icon: GraduationCap },
  ];

  // Helper to validate step transitions
  const nextStep = async () => {
    let fieldsToValidate: Array<keyof YbmFormValues> = [];

    if (step === 1) {
      fieldsToValidate = ['fullName', 'birthDate', 'gender', 'phoneNumber', 'region'];
    } else if (step === 2) {
      fieldsToValidate = isEntrepreneur
        ? ['businessName', 'businessStatus', 'businessDirection', 'businessDescription', 'businessForm', 'employeeCount', 'monthlyTurnover']
        : ['businessStatus', 'businessDirection', 'businessDescription'];
    } else if (step === 3) {
      fieldsToValidate = isEntrepreneur
        ? ['competitiveAdvantage', 'growthSixMonths', 'fiveYearVision', 'painSolved', 'mainChallenges']
        : [];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => {
        const next = Math.min(prev + 1, 4);
        if (next === 4) {
          setStep4Timestamp(Date.now());
        }
        return next;
      });
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (values: YbmFormValues) => {
    if (step < 4 || (Date.now() - step4Timestamp < 600)) {
      return;
    }

    // Offline block
    if (typeof window !== 'undefined' && !navigator.onLine) {
      setSubmitError("Siz oflaynsiz. Iltimos, internet aloqangizni tekshirib, qayta urinib ko'ring.");
      return;
    }

    setSubmitError(null);
    setIsSubmissionSlow(false);

    // Timeout alert for weak network
    const slowTimer = setTimeout(() => {
      setIsSubmissionSlow(true);
    }, 5000);

    const fullPhoneNumber = `+998${values.phoneNumber}`;

    const payload = {
      full_name: values.fullName,
      birth_date: values.birthDate,
      gender: values.gender,
      phone_number: fullPhoneNumber,
      region: values.region,
      business_status: values.businessStatus,
      business_direction: values.businessDirection,
      business_description: values.businessDescription,
      business_name: isEntrepreneur ? values.businessName : undefined,
      business_form: isEntrepreneur ? values.businessForm : undefined,
      employee_count: isEntrepreneur ? values.employeeCount : undefined,
      monthly_turnover: isEntrepreneur ? values.monthlyTurnover : undefined,
      social_media: values.socialMedia || undefined,
      competitive_advantage: isEntrepreneur ? values.competitiveAdvantage : undefined,
      growth_six_months: isEntrepreneur ? values.growthSixMonths : undefined,
      five_year_vision: isEntrepreneur ? values.fiveYearVision : undefined,
      pain_solved: isEntrepreneur ? values.painSolved : undefined,
      main_challenges: isEntrepreneur ? values.mainChallenges : undefined,
      expected_results: values.expectedResults,
      discovery_source: values.discoverySource || undefined,
    };

    try {
      const result = await submitYbmRegistration(payload);
      clearTimeout(slowTimer);
      setIsSubmissionSlow(false);

      if (result.success) {
        if (typeof window !== 'undefined') {
          // Clear draft on success
          localStorage.removeItem('ybm_registration_draft');
          sessionStorage.setItem('ybm_last_registration_details', JSON.stringify({
            fullName: values.fullName,
            businessName: isEntrepreneur ? values.businessName : values.businessDescription.substring(0, 30) + "...",
            isEntrepreneur,
          }));
        }
        router.push('/ybm/success');
      } else {
        setSubmitError(result.error || "Tizimga yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      }
    } catch (e: any) {
      clearTimeout(slowTimer);
      setIsSubmissionSlow(false);
      setSubmitError(e.message || "Kutilmagan xatolik yuz berdi. Aloqani tekshirib qayta urining.");
    }
  };

  const directionOptions = [
    "Chakana savdo", "Dizayn", "Elektron tijorat", "Energetika", "Farmasevtika",
    "Fintech", "Huquq", "Ilmiy tadqiqot", "Ishlab chiqarish", "Kimyo sanoati",
    "Ko‘chmas mulk", "Ko‘ngil ochar", "Kon sanoati", "Konsalting", "Logistika",
    "Marketing", "Media", "Mehmonxona xizmatlari", "Moliya", "Notijorat",
    "Oziq-ovqat va ichimliklar", "Qishloq xo‘jaligi", "Qurilish", "Reklama",
    "San’at", "Sog‘liqni saqlash", "Sport va salomatlik", "Ta’lim",
    "Telekommunikatsiya", "Texnologiya", "To‘qimachilik", "Transport",
    "Turizm", "Boshqalar"
  ];

  return (
    <div className="w-full flex-grow flex flex-col justify-start items-center bg-background px-3 py-4 sm:px-6 sm:py-8">
      {/* Offline Status Toast */}
      {showConnectionToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-lg text-xs font-semibold font-sans transition-all duration-300 flex items-center space-x-2 border ${
            showConnectionToast === 'offline'
              ? 'bg-error-container text-on-error-container border-error/20'
              : 'bg-green-50 text-green-800 border-green-200'
          }`}
        >
          <span>
            {showConnectionToast === 'offline' 
              ? '⚠️ Oflayn rejim. Ma\'lumotlaringiz qurilma xotirasida xavfsiz saqlanmoqda.' 
              : '✅ Aloqa tiklandi!'}
          </span>
        </div>
      )}

      {/* Decorative Blurs */}
      <div className="absolute top-[10%] left-[-5%] w-96 h-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[-5%] w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl flex flex-col space-y-6 z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col space-y-3">
          <div className="border-l-4 border-secondary pl-4 py-1.5">
            <span className="text-[10px] font-inter font-extrabold uppercase tracking-widest text-secondary">
              YOSHLAR BIZNES MAKTABI
            </span>
            <h1 className="font-montserrat text-xl sm:text-2xl font-extrabold text-primary tracking-tight leading-snug">
              Yoshlar Biznes Maktabi
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Tashabbuslar Marafonida qatnashadigan yosh tadbirkorlar uchun maxsus so&apos;rovnoma.
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-4 shadow-ambient">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-surface-container" />
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 h-[2px] bg-secondary transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
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
                          else if (i === 2) fields = isEntrepreneur ? ['businessName', 'businessStatus', 'businessDirection', 'businessDescription', 'businessForm', 'employeeCount', 'monthlyTurnover'] : ['businessStatus', 'businessDirection', 'businessDescription'];
                          else if (i === 3) fields = isEntrepreneur ? ['competitiveAdvantage', 'growthSixMonths', 'fiveYearVision', 'painSolved', 'mainChallenges'] : [];

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
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity" }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">1-BO’LIM. Shaxsiy ma’lumotlar</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Siz bilan bog&apos;lanish uchun zarur bo&apos;lgan asosiy ma&apos;lumotlar.</p>
                    </div>

                    <TextInput
                      label="Ismingiz va Familiyangiz *"
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

                    <div className="w-full flex flex-col space-y-2 pt-1.5">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Jinsingiz *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Erkak", "Ayol"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setValue('gender', opt, { shouldValidate: true });
                            }}
                            className={`py-3 px-4 rounded-xl border-2 font-inter font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer text-center ${
                              watchedGender === opt
                                ? 'border-primary bg-primary/5 text-primary shadow-sm font-extrabold'
                                : 'border-outline-variant/50 hover:border-primary/40 bg-white text-on-surface-variant'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {errors.gender && (
                        <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.gender.message}
                        </span>
                      )}
                    </div>

                    <div className="w-full flex flex-col space-y-1.5 pt-1.5">
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
                          "Toshkent sh.", "Toshkent v.", "Andijon", "Farg’ona", "Namangan", 
                          "Sirdaryo", "Jizzax", "Samarqand", "Navoiy", "Buxoro", 
                          "Xorazm", "Qoraqalpog’iston r.", "Qashqadaryo", "Surxondaryo"
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
                  </motion.div>
                )}

                {/* STEP 2: Business Activity */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity" }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">2-BO’LIM. Biznes faoliyati</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Siz yuritayotgan biznes yoki amalga oshirayotgan g&apos;oyangiz tafsilotlari.</p>
                    </div>

                    <div className="w-full flex flex-col space-y-2">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Biznesdagi maqomingiz *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {["Asoschi", "Yollanma raxbar", "Investor", "G’oya egasi", "boshqalar"].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setValue('businessStatus', opt, { shouldValidate: true });
                            }}
                            className={`py-2.5 px-3 rounded-xl border-2 font-inter font-bold text-xs transition-all duration-200 cursor-pointer text-center capitalize ${
                              watchedStatus === opt
                                ? 'border-primary bg-primary/5 text-primary shadow-sm font-extrabold'
                                : 'border-outline-variant/50 hover:border-primary/40 bg-white text-on-surface-variant'
                            }`}
                          >
                            {opt === 'boshqalar' ? 'Boshqalar' : opt}
                          </button>
                        ))}
                      </div>
                      {errors.businessStatus && (
                        <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                          <span className="mr-1">⚠️</span> {errors.businessStatus.message}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1.5">
                      <TextInput
                        label={isEntrepreneur ? "Biznesingiz yoki brend nomi *" : "Biznesingiz yoki brend nomi (ixtiyoriy)"}
                        placeholder="Brend nomini kiriting"
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
                      label="Mahsulot yoki ko’rsatadigan xizmatingiz haqida batafsil yozing *"
                      placeholder="Ishlab chiqaradigan mahsulotingiz yoki xizmatingiz haqida batafsil ma'lumot kiriting"
                      error={errors.businessDescription?.message}
                      {...register('businessDescription')}
                    />

                    {isEntrepreneur && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1.5">
                          <div className="w-full flex flex-col space-y-1.5">
                            <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                              Biznes shakli *
                            </label>
                            <select
                              className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                                errors.businessForm ? 'border-error focus:border-error focus:ring-error/5' : ''
                              }`}
                              value={watchedBusinessForm}
                              {...register('businessForm')}
                            >
                              <option value="">Tanlang...</option>
                              {["MChJ", "YaTT", "O’zini o’zi band qilgan", "Boshqa"].map((bf) => (
                                <option key={bf} value={bf}>{bf}</option>
                              ))}
                            </select>
                            {errors.businessForm && (
                              <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                                <span className="mr-1">⚠️</span> {errors.businessForm.message}
                              </span>
                            )}
                          </div>

                          <div className="w-full flex flex-col space-y-1.5">
                            <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                              Biznesda xodimlar soni *
                            </label>
                            <select
                              className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 ${
                                errors.employeeCount ? 'border-error focus:border-error focus:ring-error/5' : ''
                              }`}
                              value={watchedEmployeeCount}
                              {...register('employeeCount')}
                            >
                              <option value="">Tanlang...</option>
                              {["1-10 nafar", "11-20 nafar", "21-50 nafar", "50+ nafar"].map((ec) => (
                                <option key={ec} value={ec}>{ec}</option>
                              ))}
                            </select>
                            {errors.employeeCount && (
                              <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
                                <span className="mr-1">⚠️</span> {errors.employeeCount.message}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full flex flex-col space-y-1.5 pt-2">
                          <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                            O’rtacha oylik aylanmangiz *
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {["0-100 mln", "100-300 mln", "300-500 mln", "500 mlndan oshiq"].map((opt) => (
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
                      </>
                    )}

                    <div className="pt-2">
                      <TextInput
                        label="Ijtimoiy tarmoqlar yoki veb-sayt havolalari"
                        placeholder="instagram, telegram, veb-sayt havolalari (ixtiyoriy)"
                        error={errors.socialMedia?.message}
                        {...register('socialMedia')}
                      />
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Business Analysis */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity" }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">3-BO’LIM. Biznes tahlili</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Biznesingizning o&apos;sishi, raqobatdoshligi va muammolari haqida ma&apos;lumotlar {!isEntrepreneur && <span className="font-bold text-secondary">(G&apos;oya egasi uchun ixtiyoriy)</span>}.</p>
                    </div>

                    <TextArea
                      label={isEntrepreneur ? "Biznesingizni raqobatchilardan ajratib turadigan jihat nima? *" : "Biznesingizni raqobatchilardan ajratib turadigan jihat nima? (ixtiyoriy)"}
                      placeholder="Raqobatchilardan qanday farq qilasiz?"
                      error={errors.competitiveAdvantage?.message}
                      {...register('competitiveAdvantage')}
                    />

                    <TextArea
                      label={isEntrepreneur ? "Oxirgi 6 oyda qancha o’sishga erishdingiz? *" : "Oxirgi 6 oyda qancha o’sishga erishdingiz? (ixtiyoriy)"}
                      placeholder="O'sish sur'atlari, ko'rsatkichlar yoki yutuqlar"
                      error={errors.growthSixMonths?.message}
                      {...register('growthSixMonths')}
                    />

                    <TextArea
                      label={isEntrepreneur ? "Besh yildan keyin biznesingizni qanday tasavvur qilasiz? *" : "Besh yildan keyin biznesingizni qanday tasavvur qilasiz? (ixtiyoriy)"}
                      placeholder="Kelajakdagi maqsadlaringiz va rejalaringiz"
                      error={errors.fiveYearVision?.message}
                      {...register('fiveYearVision')}
                    />

                    <TextArea
                      label={isEntrepreneur ? "Biznesingiz jamiyatdagi nima og’riqni hal qilmoqda? *" : "Biznesingiz jamiyatdagi nima og’riqni hal qilmoqda? (ixtiyoriy)"}
                      placeholder="Jamiyatga keltiradigan foydangiz yoki yechimlar"
                      error={errors.painSolved?.message}
                      {...register('painSolved')}
                    />

                    <TextArea
                      label={isEntrepreneur ? "Biznesingizdagi asosiy qiyinchiliklar nimada? *" : "Biznesingizdagi asosiy qiyinchiliklar nimada? (ixtiyoriy)"}
                      placeholder="Qaysi muammolarga duch kelyapsiz va qanday ko'mak zarur?"
                      error={errors.mainChallenges?.message}
                      {...register('mainChallenges')}
                    />
                  </motion.div>
                )}

                {/* STEP 4: Final Section */}
                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity" }}
                    className="space-y-4"
                  >
                    <div className="border-b border-outline-variant/30 pb-3 mb-2">
                      <h2 className="font-montserrat text-base font-extrabold text-primary">4-BO’LIM. Yakuniy savollar</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Dasturga topshirish sabablari va kutilayotgan natijalar.</p>
                    </div>

                    <div className="w-full flex flex-col space-y-1.5">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Bizni qayerdan topdinggiz?
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

                    <TextArea
                      label="Yoshlar Biznes Maktabidan asosiy kutayotgan natijangiz nima? *"
                      placeholder="Ushbu dasturdan nimalarni kutmoqdasiz?"
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

              {step < 4 ? (
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
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>YUBORILMOQDA...</span>
                      </div>
                      {isSubmissionSlow && (
                        <span className="text-[10px] text-white/80 font-medium mt-1 animate-pulse">
                          Aloqa sekin, iltimos kuting...
                        </span>
                      )}
                    </div>
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
          Taqdim etilgan ma&apos;lumotlar xavfsiz saqlanadi va faqat Yoshlar Biznes Maktabi (YBM) tashkilotchilari tomonidan foydalaniladi.
        </p>

      </div>
    </div>
  );
}
