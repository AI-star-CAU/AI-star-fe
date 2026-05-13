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
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={255}
          value={password}
          onChange={(e) => handleChange(setPassword)(e.target.value)}
          disabled={isPending}
          placeholder="8자 이상"
          className={inputClass}
        />
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
