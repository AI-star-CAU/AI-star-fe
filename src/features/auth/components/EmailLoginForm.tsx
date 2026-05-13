import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import { useLogin } from '../hooks/useLogin';

interface EmailLoginFormProps {
  onSuccess?: () => void;
}

const EmailLoginForm: React.FC<EmailLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isPending, errorMessage, reset } = useLogin({ onSuccess });

  const isValid = email.trim() !== '' && password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;
    login({ email: email.trim(), password });
  };

  const handleChange = <T,>(setter: (v: T) => void) => (v: T) => {
    if (errorMessage) reset();
    setter(v);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-medium text-slate-400">
          이메일
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => handleChange(setEmail)(e.target.value)}
          disabled={isPending}
          placeholder="you@example.com"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition disabled:opacity-60"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-xs font-medium text-slate-400">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => handleChange(setPassword)(e.target.value)}
          disabled={isPending}
          placeholder="8자 이상"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition disabled:opacity-60"
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
          '로그인'
        )}
      </Button>
    </form>
  );
};

export default EmailLoginForm;
