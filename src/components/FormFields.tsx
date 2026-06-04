import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 placeholder:text-on-surface-variant/40 ${
            error ? 'border-error focus:border-error focus:ring-error/5' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
            <span className="mr-1">⚠️</span> {error}
          </span>
        )}
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  error?: string;
  value?: string;
  onChange?: (val: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, value = '', onChange, className = '', ...props }, ref) => {
    
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers
      const rawVal = e.target.value.replace(/\D/g, '');
      // Limit to 9 digits (Uzbekistan local number without +998)
      const limited = rawVal.substring(0, 9);
      if (onChange) {
        onChange(limited);
      }
    };

    // Format output for display: e.g. 90 123 45 67 -> (90) 123-45-67
    const formatDisplay = (val: string) => {
      if (!val) return '';
      let formatted = '';
      if (val.length > 0) {
        formatted += `(${val.substring(0, 2)}`;
      }
      if (val.length > 2) {
        formatted += `) ${val.substring(2, 5)}`;
      }
      if (val.length > 5) {
        formatted += `-${val.substring(5, 7)}`;
      }
      if (val.length > 7) {
        formatted += `-${val.substring(7, 9)}`;
      }
      return formatted;
    };

    return (
      <div className="w-full flex flex-col space-y-1.5">
        <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
          {label}
        </label>
        
        <div className="relative flex items-center w-full">
          {/* Prefix indicator */}
          <div className="absolute left-3 flex items-center justify-center font-sans text-sm font-semibold text-primary/70 pointer-events-none border-r border-outline-variant/30 pr-2">
            🇺🇿 +998
          </div>
          
          <input
            ref={ref}
            type="tel"
            value={formatDisplay(value)}
            onChange={handleInput}
            placeholder="(90) 123-45-67"
            className={`w-full rounded-[8px] bg-white border border-outline-variant/60 pl-20 pr-4 py-3 text-on-surface font-sans text-base sm:text-sm font-semibold outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 placeholder:text-on-surface-variant/30 ${
              error ? 'border-error focus:border-error focus:ring-error/5' : ''
            } ${className}`}
            {...props}
          />
        </div>
        
        {error ? (
          <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
            <span className="mr-1">⚠️</span> {error}
          </span>
        ) : (
          <span className="text-[10px] font-sans text-on-surface-variant/65">
            9 xonali mobil operator raqamingizni kiriting.
          </span>
        )}
      </div>
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col space-y-1.5">
        <label className="text-xs font-inter font-bold uppercase tracking-wider text-primary">
          {label}
        </label>
        <textarea
          ref={ref}
          className={`w-full rounded-[8px] bg-white border border-outline-variant/60 px-4 py-3 text-on-surface font-sans text-base sm:text-sm outline-none transition-all duration-200 focus:border-primary-container focus:ring-2 focus:ring-primary/5 placeholder:text-on-surface-variant/40 resize-none min-h-[120px] ${
            error ? 'border-error focus:border-error focus:ring-error/5' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-sans font-medium text-error mt-1 flex items-center">
            <span className="mr-1">⚠️</span> {error}
          </span>
        )}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';
