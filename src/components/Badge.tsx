import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border';
  
  const variants = {
    default: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    success: 'bg-brand-success/10 text-brand-success border-brand-success/20',
    warning: 'bg-brand-warning/10 text-brand-warning border-brand-warning/20',
    danger: 'bg-brand-danger/10 text-brand-danger border-brand-danger/20',
    info: 'bg-brand-info/10 text-brand-info border-brand-info/20',
    neutral: 'bg-bg-secondary text-text-secondary border-border-primary',
    outline: 'bg-transparent text-text-primary border-border-primary'
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
