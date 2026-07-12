import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-brand-green hover:bg-brand-green/90 text-white shadow-sm ripple-btn focus-visible:ring-brand-green',
    secondary: 'bg-bg-secondary hover:bg-border-primary text-text-primary focus-visible:ring-border-primary',
    outline: 'border border-border-primary hover:bg-bg-secondary text-text-primary hover:border-text-secondary/20 focus-visible:ring-border-primary',
    danger: 'bg-brand-danger hover:bg-brand-danger/90 text-white shadow-sm ripple-btn focus-visible:ring-brand-danger',
    ghost: 'hover:bg-bg-secondary text-text-secondary hover:text-text-primary'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'h-10 w-10 p-0 rounded-full'
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
