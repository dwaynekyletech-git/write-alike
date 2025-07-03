import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md' 
}) => {
  const baseStyles = 'bg-background border border-border rounded-lg';
  const hoverStyles = hover ? 'hover:border-border-hover hover:shadow-md cursor-pointer' : '';
  
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const classes = `${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`;
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-text-primary ${className}`}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-text-secondary ${className}`}>
      {children}
    </div>
  );
};