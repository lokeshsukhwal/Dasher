'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  pulse = false 
}: BadgeProps) {
  const variants = {
    default: 'bg-dark-100 text-dark-700',
    success: 'bg-success-100 text-success-700 border border-success-200',
    warning: 'bg-warning-100 text-warning-700 border border-warning-200',
    danger: 'bg-danger-100 text-danger-700 border border-danger-200',
    info: 'bg-primary-100 text-primary-700 border border-primary-200',
    outline: 'bg-transparent border-2 border-dark-300 text-dark-600',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  );
}