'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Building2, Database } from 'lucide-react';

interface HoursInputProps {
  oldHours: string;
  newHours: string;
  onOldHoursChange: (value: string) => void;
  onNewHoursChange: (value: string) => void;
}

export function HoursInput({ oldHours, newHours, onOldHoursChange, onNewHoursChange }: HoursInputProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card variant="gradient">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <CardTitle>Old Hours (MINT/System)</CardTitle>
              <CardDescription>Current hours in your system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            value={oldHours}
            onChange={(e) => onOldHoursChange(e.target.value)}
            placeholder={`Monday: 9:00 AM – 10:00 PM
Tuesday: 9:00 AM – 10:00 PM
Wednesday: 9:00 AM – 10:00 PM
Thursday: 9:00 AM – 10:00 PM
Friday: 9:00 AM – 11:00 PM
Saturday: 10:00 AM – 11:00 PM
Sunday: 11:00 AM – 8:00 PM`}
            className="w-full h-64 p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none text-sm font-mono bg-white placeholder:text-gray-400"
          />
        </CardContent>
      </Card>

      <Card variant="gradient">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>New Hours (GMB)</CardTitle>
              <CardDescription>Hours from Google My Business</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            value={newHours}
            onChange={(e) => onNewHoursChange(e.target.value)}
            placeholder={`Hours: 
Monday	Open 24 hours
Tuesday	Open 24 hours
Wednesday	Open 24 hours
Thursday
(Christmas Day)
Open 24 hours
Friday	Open 24 hours
Saturday	Open 24 hours
Sunday	Closed`}
            className="w-full h-64 p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none text-sm font-mono bg-white placeholder:text-gray-400"
          />
        </CardContent>
      </Card>
    </div>
  );
}