'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
}

export function Card({ children, className, variant = 'default', hover = false }: CardProps) {
  const variants = {
    default: 'bg-white border border-dark-200 shadow-sm',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-white to-dark-50 border border-dark-100 shadow-lg',
  };
  
  return (
    <div
      className={cn(
        'rounded-2xl p-6',
        variants[variant],
        hover && 'hover:shadow-lg hover:scale-[1.01] transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-dark-900', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-dark-500 mt-1', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}