'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export function StatsCard({ title, value, icon: Icon, variant }: StatsCardProps) {
  const variants = {
    success: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      valueColor: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      iconBg: 'bg-amber-500',
      valueColor: 'text-amber-700',
      border: 'border-amber-200',
    },
    danger: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      iconBg: 'bg-red-500',
      valueColor: 'text-red-700',
      border: 'border-red-200',
    },
    info: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      valueColor: 'text-blue-700',
      border: 'border-blue-200',
    },
    default: {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      iconBg: 'bg-gray-500',
      valueColor: 'text-gray-700',
      border: 'border-gray-200',
    },
  };
  
  const v = variants[variant];
  
  return (
    <div className={cn(
      'rounded-2xl p-5 border transition-all duration-300 hover:scale-105 hover:shadow-lg',
      v.bg, v.border
    )}>
      <div className="flex items-center gap-4">
        <div className={cn('p-3 rounded-xl shadow-lg', v.iconBg)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn('text-3xl font-black', v.valueColor)}>{value}</p>
        </div>
      </div>
    </div>
  );
}