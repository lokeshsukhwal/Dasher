'use client';

import React from 'react';
import { Clock, Zap, Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/30 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 border border-white/20">
            <Clock className="w-8 h-8 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Business Hours
            <span className="block text-primary-200">Comparator</span>
          </h1>
          
          {/* Description */}
          <p className="max-w-2xl mx-auto text-lg text-primary-100 mb-8">
            Instantly compare and verify business hour changes. 
            Generate professional remarks for your verification reports.
          </p>
          
          {/* Features badges */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Zap className="w-4 h-4 text-warning-400" />
              <span className="text-sm text-white font-medium">Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Shield className="w-4 h-4 text-success-400" />
              <span className="text-sm text-white font-medium">Accurate Detection</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#f8fafc"
          />
        </svg>
      </div>
    </header>
  );
}