import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import { useSignup } from '../hooks/useSignup';

interface EmailSignupFormProps {
  onSuccess?: () => void;
}

const inputClass =
  'w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition disabled:opacity-60';

const EmailSignupForm: React.FC<EmailSignupFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isPending, errorMessage, reset } = useSignup({ onSuccess });

  const trimmedName = name.trim();
  const isValid =
    email.trim() !== '' &&
    trimmedName !== '' &&
    trimmedName.length <= 20 &&
    password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;
    signup({ email: email.trim(), name: trimmedName, password });
  };

  const handleChange = (setter: (v: string) => void) => (v: string) => {
    if (errorMessage) reset();
    setter(v);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="signup-email" className="block text-xs font-medium text-slate-400">
          이메일
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          maxLength={100}
          value={email}
          onChange={(e) => handleChange(setEmail)(e.target.value)}
          disabled={isPending}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-name" className="block text-xs font-medium text-slate-400">
          이름
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          required
          maxLength={20}
          value={name}
          onChange={(e) => handleChange(setName)(e.target.value)}
          disabled={isPending}
          placeholder="20자 이내"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="signup-password" className="block text-xs font-medium text-slate-400">
          비밀번호
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={255}
            value={password}
            onChange={(e) => handleChange(setPassword)(e.target.value)}
            disabled={isPending}
            placeholder="8자 이상"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={isPending}
            tabIndex={-1}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition disabled:opacity-60"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2"
        >
          {errorMessage}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!isValid || isPending}
      >
        {isPending ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
        ) : (
          '회원가입'
        )}
      </Button>
    </form>
  );
};

export default EmailSignupForm;
