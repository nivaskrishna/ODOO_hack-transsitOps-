import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline' | 'flat';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverEffect = false,
  ...props
}) => {
  const baseStyle = 'rounded-2xl border transition-all duration-300 p-6';
  
  const variantStyles = {
    default: 'bg-bg-card border-border-primary shadow-[var(--shadow-soft)]',
    glass: 'glass-panel border-border-primary',
    outline: 'bg-transparent border-border-primary',
    flat: 'bg-bg-secondary border-transparent'
  };

  const hoverStyle = hoverEffect ? 'hover-lift cursor-pointer hover:border-brand-green/30' : '';

  return (
    <div
      className={`${baseStyle} ${variantStyles[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 pb-4 border-b border-border-primary/50 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight text-text-primary ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-text-secondary ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`flex items-center pt-4 border-t border-border-primary/50 mt-4 ${className}`} {...props}>
    {children}
  </div>
);
