'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronLeft, ChevronRight, Check, Award, Briefcase, MapPin, User, FileText } from 'lucide-react';
import { TextInput, PhoneInput, TextArea } from '@/components/FormFields';
import { submitBuxoroNavoiyRegistration } from '@/lib/supabase';

// Form validation schema
const surveySchema = z.object({
  location: z.string().min(1, "Iltimos, hududni tanlang"),
  firstName: z.string().min(2, "Ismingiz kamida 2 ta harfdan iborat bo'lishi kerak"),
  surname: z.string().min(2, "Familiyangiz kamida 2 ta harfdan iborat bo'lishi kerak"),
  phoneNumber: z.string().length(9, "Telefon raqamingiz 9 ta raqamdan iborat bo'lishi kerak"),
  age: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 12 && num <= 100;
  }, "Yoshingiz 12 dan 100 gacha bo'lishi kerak"),
  telegramUsername: z.string().optional(),
  isEntrepreneur: z.boolean(),
  businessActivity: z.string().optional(),
  employeeCount: z.string().optional(),
  hasBusinessIdea: z.boolean().optional(),
  businessInterest: z.string().optional(),
  expectations: z.string().optional(),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export default function BuxoroNavoiySurvey() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step4Timestamp, setStep4Timestamp] = useState<number>(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    mode: 'onChange',
    defaultValues: {
      location: '',
      firstName: '',
      surname: '',
      phoneNumber: '',
      age: '',
      telegramUsername: '',
      isEntrepreneur: false,
      businessActivity: '',
      employeeCount: '1-5 nafar',
      hasBusinessIdea: false,
      businessInterest: '',
      expectations: '',
    },
  });

  // Watch fields for dynamic rendering and manual step validation
  const watchedLocation = watch('location');
  const watchedIsEntrepreneur = watch('isEntrepreneur');
  const watchedHasBusinessIdea = watch('hasBusinessIdea');

  const steps = [
    { id: 1, name: "Hudud", icon: MapPin },
    { id: 2, name: "Ma'lumotlar", icon: User },
    { id: 3, name: "Faoliyat", icon: Briefcase },
    { id: 4, name: "Kutishlar", icon: FileText },
  ];

  // Validate step before advancing
  const nextStep = async () => {
    let fieldsToValidate: Array<keyof SurveyFormValues> = [];

    if (step === 1) {
      fieldsToValidate = ['location'];
    } else if (step === 2) {
      fieldsToValidate = ['firstName', 'surname', 'phoneNumber', 'age'];
    } else if (step === 3) {
      if (watchedIsEntrepreneur) {
        fieldsToValidate = ['businessActivity', 'employeeCount'];
      } else {
        fieldsToValidate = ['businessInterest'];
      }
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

  const onSubmit = async (values: SurveyFormValues) => {
    // Prevent accidental double clicks or automatic submissions
    if (step < 4 || (Date.now() - step4Timestamp < 600)) {
      return;
    }
    setSubmitError(null);
    const fullPhoneNumber = `+998${values.phoneNumber}`;

    const payload = {
      first_name: values.firstName,
      surname: values.surname,
      phone_number: fullPhoneNumber,
      location: values.location === 'Samarqand' ? 'Buxoro' : values.location,
      age: parseInt(values.age, 10),
      telegram_username: values.telegramUsername ? (values.telegramUsername.startsWith('@') ? values.telegramUsername : `@${values.telegramUsername}`) : undefined,
      is_entrepreneur: values.isEntrepreneur,
      business_activity: values.isEntrepreneur ? values.businessActivity : undefined,
      employee_count: values.isEntrepreneur ? values.employeeCount : undefined,
      has_business_idea: !values.isEntrepreneur ? values.hasBusinessIdea : undefined,
      business_interest: !values.isEntrepreneur ? values.businessInterest : undefined,
      expectations: values.expectations || undefined,
    };

    const result = await submitBuxoroNavoiyRegistration(payload);

    if (result.success) {
      // Store details temporarily to display on success page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('last_registration_details', JSON.stringify({
          firstName: values.firstName,
          location: values.location,
          isEntrepreneur: values.isEntrepreneur,
        }));
      }
      router.push('/buxoro-navoiy/success');
    } else {
      setSubmitError(result.error || "Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  // Direction variant for step transitions
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full flex-grow flex flex-col justify-start items-center bg-background px-3 py-4 sm:px-6 sm:py-8">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[15%] left-[-10%] w-80 h-80 rounded-full bg-primary-fixed/20 blur-3xl pointer-events-none" />
      <div className="absolute top-[50%] right-[-10%] w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg flex flex-col space-y-6 z-10">

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
              MAXSUS SO&apos;ROVNOMA
            </span>
            <h1 className="font-montserrat text-xl sm:text-2xl font-extrabold text-primary tracking-tight leading-snug">
              Biznes Bootcamp 2026
            </h1>
            <p className="text-xs text-on-surface-variant font-medium mt-1">
              Navoiy va Samarqand viloyatlaridagi yosh tadbirkorlar va tadbirkorlikka qiziquvchilar uchun ro&apos;yxatdan o&apos;tish shakli.
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl border border-outline-variant/40 p-4 shadow-ambient">
          <div className="flex justify-between items-center relative">
            {/* Progress line */}
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
                      // Allow clicking previous steps
                      if (s.id < step) {
                        setStep(s.id);
                      } else if (s.id > step) {
                        // Validate to jump forward
                        let canJump = true;
                        for (let i = step; i < s.id; i++) {
                          let fields: Array<keyof SurveyFormValues> = [];
                          if (i === 1) fields = ['location'];
                          else if (i === 2) fields = ['firstName', 'surname', 'phoneNumber', 'age'];
                          else if (i === 3) fields = watchedIsEntrepreneur ? ['businessActivity', 'employeeCount'] : ['businessInterest'];

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
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 border-2 font-inter text-xs font-bold ${isCurrent
                        ? 'bg-primary border-primary text-white scale-110 shadow-md'
                        : isActive
                          ? 'bg-secondary border-secondary text-white'
                          : 'bg-white border-outline-variant text-on-surface-variant'
                      }`}
                  >
                    {isActive && step > s.id ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                  </button>
                  <span className={`text-[10px] mt-1.5 font-semibold font-sans ${isCurrent ? 'text-primary font-bold' : isActive ? 'text-secondary' : 'text-on-surface-variant/50'}`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-[24px] border border-outline-variant/50 p-4 sm:p-6 shadow-ambient-lg min-h-[400px] flex flex-col justify-between overflow-hidden relative">

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
                      <h2 className="font-montserrat text-base font-extrabold text-primary">Ishtirok hududini tanlang</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Qaysi viloyatdagi Biznes Bootcamp dasturiga qatnashasiz?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Samarqand Card */}
                      <button
                        type="button"
                        onClick={() => setValue('location', 'Samarqand', { shouldValidate: true })}
                        className={`flex flex-col text-left p-3.5 sm:p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group cursor-pointer ${watchedLocation === 'Samarqand'
                            ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/5 shadow-md'
                            : 'border-outline-variant/50 hover:border-primary/40 bg-white hover:bg-surface-low'
                          }`}
                      >
                        {/* Colorful Side Ribbon (Samarqand Colors) */}
                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-secondary" />

                        <div className="pl-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] sm:text-xs font-inter font-extrabold tracking-wider text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-full">
                              10-IYUN, 2026
                            </span>
                            {watchedLocation === 'Samarqand' && (
                              <div className="bg-secondary text-white rounded-full p-0.5">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <h3 className="font-montserrat text-base sm:text-lg font-extrabold text-primary mt-2">
                            SAMARQAND VILOYATI
                          </h3>
                          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed font-semibold">
                            📍 Yoshlar hiyoboni
                          </p>
                          <p className="font-sans text-xs text-on-surface-variant/80 mt-1.5">
                            Samarqand shahridagi yoshlar sayilgohi. Innovatsion g&apos;oyalar taqdimoti va mentorlik sessiyalari.
                          </p>
                        </div>
                      </button>

                      {/* Navoiy Card */}
                      <button
                        type="button"
                        onClick={() => setValue('location', 'Navoiy', { shouldValidate: true })}
                        className={`flex flex-col text-left p-3.5 sm:p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group cursor-pointer ${watchedLocation === 'Navoiy'
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/5 shadow-md'
                            : 'border-outline-variant/50 hover:border-primary/40 bg-white hover:bg-surface-low'
                          }`}
                      >
                        {/* Colorful Side Ribbon (Navoiy Colors) */}
                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-tertiary" />

                        <div className="pl-3">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] sm:text-xs font-inter font-extrabold tracking-wider text-tertiary-container bg-tertiary/20 px-2 py-0.5 rounded-full uppercase">
                              8-IYUN, 2026
                            </span>
                            {watchedLocation === 'Navoiy' && (
                              <div className="bg-primary text-white rounded-full p-0.5">
                                <Check size={14} strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          <h3 className="font-montserrat text-base sm:text-lg font-extrabold text-primary mt-2">
                            NAVOIY VILOYATI
                          </h3>
                          <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed font-semibold">
                            📍 A.Navoiy istirohat bog&apos;i
                          </p>
                          <p className="font-sans text-xs text-on-surface-variant/80 mt-1.5">
                            Navoiy shahridagi yashil park hududi. Innovatsion g&apos;oyalar taqdimoti va mentorlik sessiyalari.
                          </p>
                        </div>
                      </button>
                    </div>

                    {errors.location && (
                      <p className="text-xs text-error font-medium flex items-center mt-2">
                        <span>⚠️</span> {errors.location.message}
                      </p>
                    )}
                  </motion.div>
                )}

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
                      <h2 className="font-montserrat text-base font-extrabold text-primary">Shaxsiy ma&apos;lumotlar</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Biznes bootcampda ishtirok etuvchining aloqa ma&apos;lumotlari.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label="Ismingiz"
                        placeholder="Ismingizni kiriting"
                        error={errors.firstName?.message}
                        {...register('firstName')}
                      />
                      <TextInput
                        label="Familiyangiz"
                        placeholder="Familiyangizni kiriting"
                        error={errors.surname?.message}
                        {...register('surname')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <PhoneInput
                            label="Telefon raqamingiz"
                            value={value}
                            onChange={onChange}
                            error={errors.phoneNumber?.message}
                          />
                        )}
                      />
                      <TextInput
                        label="Yoshingiz"
                        type="number"
                        placeholder="Masalan: 22"
                        error={errors.age?.message}
                        {...register('age')}
                      />
                    </div>

                    <TextInput
                      label="Telegram profil nomi (Username)"
                      placeholder="Masalan: @username (ixtiyoriy)"
                      error={errors.telegramUsername?.message}
                      {...register('telegramUsername')}
                    />
                  </motion.div>
                )}

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
                      <h2 className="font-montserrat text-base font-extrabold text-primary">Kasbiy faoliyat</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Sizning hozirgi tadbirkorlik maqomingiz.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                        Siz tadbirkormisiz?
                      </label>
                      <div className="flex space-x-3 w-full">
                        <button
                          type="button"
                          onClick={() => setValue('isEntrepreneur', true, { shouldValidate: true })}
                          className={`flex-1 flex items-center justify-center space-x-1.5 py-3 px-2 rounded-xl border-2 font-inter font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${watchedIsEntrepreneur
                              ? 'border-secondary bg-secondary/5 text-secondary shadow-sm'
                              : 'border-outline-variant/50 hover:border-primary/40 bg-white text-on-surface-variant'
                            }`}
                        >
                          <span>💼</span>
                          <span>Ha, tadbirkorman</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setValue('isEntrepreneur', false, { shouldValidate: true });
                            setValue('businessActivity', '');
                          }}
                          className={`flex-1 flex items-center justify-center space-x-1.5 py-3 px-2 rounded-xl border-2 font-inter font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${!watchedIsEntrepreneur
                              ? 'border-primary bg-primary/5 text-primary shadow-sm'
                              : 'border-outline-variant/50 hover:border-primary/40 bg-white text-on-surface-variant'
                            }`}
                        >
                          <span>🎓</span>
                          <span>Yo&apos;q, emasman</span>
                        </button>
                      </div>
                    </div>

                    {/* Conditional fields based on status */}
                    <AnimatePresence mode="wait">
                      {watchedIsEntrepreneur ? (
                        <motion.div
                          key="is-entrepreneur-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 overflow-hidden"
                        >
                          <TextInput
                            label="Faoliyat yo'nalishingiz"
                            placeholder="Masalan: Qishloq xo'jaligi, Savdo, IT xizmatlar va h.k."
                            error={errors.businessActivity?.message}
                            {...register('businessActivity', {
                              required: { value: watchedIsEntrepreneur, message: "Ushbu maydon to'ldirilishi shart" }
                            })}
                          />

                          <div className="space-y-1.5">
                            <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                              Xodimlaringiz soni
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {['1-5 nafar', '5-10 nafar', '10 dan ortiq'].map((label) => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => setValue('employeeCount', label)}
                                  className={`py-2.5 px-2 rounded-lg border font-sans text-xs font-semibold transition-all duration-200 cursor-pointer ${watch('employeeCount') === label
                                      ? 'bg-primary border-primary text-white shadow-sm'
                                      : 'border-outline-variant/60 text-on-surface hover:bg-surface-low'
                                    }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="is-not-entrepreneur-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 overflow-hidden"
                        >
                          <div className="space-y-1.5">
                            <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
                              Biznes g&apos;oyangiz bormi?
                            </label>
                            <div className="flex space-x-3 w-full">
                              <button
                                type="button"
                                onClick={() => setValue('hasBusinessIdea', true)}
                                className={`flex-1 py-2.5 px-2 rounded-lg border font-sans text-xs font-semibold transition-all duration-200 cursor-pointer ${watchedHasBusinessIdea === true
                                    ? 'bg-primary border-primary text-white shadow-sm'
                                    : 'border-outline-variant/60 text-on-surface hover:bg-surface-low'
                                  }`}
                              >
                                👍 Ha, g&apos;oyam bor
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setValue('hasBusinessIdea', false);
                                }}
                                className={`flex-1 py-2.5 px-2 rounded-lg border font-sans text-xs font-semibold transition-all duration-200 cursor-pointer ${watchedHasBusinessIdea === false
                                    ? 'bg-primary border-primary text-white shadow-sm'
                                    : 'border-outline-variant/60 text-on-surface hover:bg-surface-low'
                                  }`}
                              >
                                👎 Yo&apos;q, g&apos;oyam yo&apos;q
                              </button>
                            </div>
                          </div>

                          <TextInput
                            label={watchedHasBusinessIdea ? "G'oyangiz qaysi sohada?" : "Qaysi sohaga qiziqasiz?"}
                            placeholder="Masalan: IT, Sayyohlik, Ishlab chiqarish, Umumiy ovqatlanish"
                            error={errors.businessInterest?.message}
                            {...register('businessInterest', {
                              required: { value: !watchedIsEntrepreneur, message: "Ushbu maydon to'ldirilishi shart" }
                            })}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

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
                      <h2 className="font-montserrat text-base font-extrabold text-primary">Kutishlar va yakunlash</h2>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">Sizning bootcampdan asosiy kutilmalaringiz.</p>
                    </div>

                    <TextArea
                      label="Bootcampdan nimalarni kutmoqdasiz?"
                      placeholder="Bootcamp davomida qaysi ko'nikmalarni egallamoqchisiz yoki qanday biznes muammolarga yechim topmoqchisiz?"
                      error={errors.expectations?.message}
                      {...register('expectations')}
                    />

                    {/* Event Confirmation details overview */}
                    <div className="bg-surface-low border border-outline-variant/40 rounded-xl p-3.5 space-y-2.5">
                      <h4 className="text-[10px] sm:text-xs font-inter font-extrabold uppercase tracking-widest text-primary">Ro&apos;yxatdan o&apos;tish tafsilotlari:</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm font-sans">
                        <div>
                          <span className="text-on-surface-variant/75 font-semibold block text-[10px] sm:text-[11px] uppercase">HUDUD:</span>
                          <span className="font-bold text-primary text-xs sm:text-sm">{watchedLocation} viloyati</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant/75 font-semibold block text-[10px] sm:text-[11px] uppercase">TADBIR VAQTI:</span>
                          <span className="font-bold text-secondary text-xs sm:text-sm">
                            {watchedLocation === 'Samarqand' ? '10-Iyun, 2026' : '8-Iyun, 2026'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-on-surface-variant/75 font-semibold block text-[10px] sm:text-[11px] uppercase">MANZIL:</span>
                          <span className="font-bold text-primary text-xs sm:text-sm leading-normal">
                            {watchedLocation === 'Samarqand' ? 'Yoshlar hiyoboni' : 'A.Navoiy istirohat bog\'i'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stepper Navigation Actions */}
            <div className="flex space-x-3 pt-4 border-t border-outline-variant/30 mt-auto">
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
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Yuborilmoqda...
                    </>
                  ) : (
                    "RO'YXATDAN O'TISH"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Security / Privacy disclaimer */}
        <p className="text-[10px] text-center text-on-surface-variant/60 font-sans leading-relaxed">
          Taqdim etilgan ma&apos;lumotlar xavfsiz saqlanadi va faqat Business Bootcamp 2026 tashkilotchilari tomonidan foydalaniladi.
        </p>

      </div>
    </div>
  );
}
