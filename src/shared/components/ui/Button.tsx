import React from 'react';

type ButtonVariant =
  | 'primary'
  | 'ghost'
  | 'danger'
  | 'menu'
  | 'iconGhost'
  | 'avatar'
  | 'custom';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'avatar';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ui-accent-muted text-ui-text-inverse hover:bg-ui-accent-soft',
  ghost: 'text-ui-text-muted border border-ui-line-muted hover:bg-ui-surface-subtle hover:border-ui-line-strong',
  danger: 'text-red-400 border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/60',
  menu: 'text-ui-text-muted hover:bg-ui-surface-strong/50 text-left justify-start',
  iconGhost: 'text-ui-text-subtle hover:bg-ui-surface-subtle',
  avatar: 'bg-gradient-to-br from-ui-accent-soft to-ui-accent-muted text-ui-text-inverse hover:opacity-80',
  custom: '',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 rounded-xl text-xs',
  md: 'px-4 py-2.5 rounded-xl text-sm',
  lg: 'px-4 py-3.5 rounded-2xl text-sm',
  icon: 'h-12 w-12 rounded-2xl p-0',
  avatar: 'h-9 w-9 rounded-xl p-0 text-sm',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}) => {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-ring active:scale-95',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
