'use client';

import React from 'react';
import { Card } from './ui/Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
  description?: string;
}

export function StatsCard({ title, value, icon: Icon, variant, description }: StatsCardProps) {
  const variants = {
    success: {
      bg: 'bg-success-50',
      iconBg: 'bg-success-100',
      iconColor: 'text-success-600',
      valueColor: 'text-success-700',
    },
    warning: {
      bg: 'bg-warning-50',
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-600',
      valueColor: 'text-warning-700',
    },
    danger: {
      bg: 'bg-danger-50',
      iconBg: 'bg-danger-100',
      iconColor: 'text-danger-600',
      valueColor: 'text-danger-700',
    },
    info: {
      bg: 'bg-primary-50',
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-600',
      valueColor: 'text-primary-700',
    },
    default: {
      bg: 'bg-dark-50',
      iconBg: 'bg-dark-100',
      iconColor: 'text-dark-600',
      valueColor: 'text-dark-700',
    },
  };
  
  const v = variants[variant];
  
  return (
    <Card className={cn('transition-all duration-300 hover:scale-105', v.bg)}>
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-xl', v.iconBg)}>
          <Icon className={cn('w-6 h-6', v.iconColor)} />
        </div>
        <div>
          <p className="text-sm font-medium text-dark-500">{title}</p>
          <p className={cn('text-2xl font-bold', v.valueColor)}>{value}</p>
          {description && (
            <p className="text-xs text-dark-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
}