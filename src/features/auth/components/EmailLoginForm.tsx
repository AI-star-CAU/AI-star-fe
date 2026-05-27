import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';

interface EmailLoginFormProps {
  onSuccess?: () => void;
}

const EmailLoginForm: React.FC<EmailLoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="nm-label">이메일</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => handleChange(setEmail)(e.target.value)}
          disabled={isPending}
          placeholder="you@example.com"
          className="nm-input"
        />
      </div>

      <div>
        <label htmlFor="password" className="nm-label">비밀번호</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => handleChange(setPassword)(e.target.value)}
            disabled={isPending}
            placeholder="8자 이상"
            className="nm-input"
            style={{ paddingRight: 32 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={isPending}
            tabIndex={-1}
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            style={{
              position: 'absolute',
              right: 4,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-3)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          style={{
            fontFamily: 'var(--type)',
            fontSize: 11,
            letterSpacing: '0.12em',
            color: 'var(--red-deep)',
            borderLeft: '3px solid var(--red)',
            paddingLeft: 10,
            paddingTop: 6,
            paddingBottom: 6,
            background: 'rgba(160, 48, 40, 0.06)',
          }}
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || isPending}
        className="nm-btn nm-btn-red"
        style={{ width: '100%' }}
      >
        {isPending ? '발행 중…' : '구독 시작 ▸'}
      </button>
    </form>
  );
};

export default EmailLoginForm;
