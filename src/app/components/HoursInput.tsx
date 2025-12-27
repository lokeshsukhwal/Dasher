'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Building2, Clock } from 'lucide-react';

interface HoursInputProps {
    oldHours: string;
    newHours: string;
    onOldHoursChange: (value: string) => void;
    onNewHoursChange: (value: string) => void;
}

export function HoursInput({
    oldHours,
    newHours,
    onOldHoursChange,
    onNewHoursChange,
}: HoursInputProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Old Hours Input */}
            <Card variant="gradient" className="h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning-100 rounded-lg">
                            <Clock className="w-5 h-5 text-warning-600" />
                        </div>
                        <div>
                            <CardTitle>Current Business Hours (Mint)</CardTitle>
                            <CardDescription>Paste the existing hours from your system</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <textarea
                        value={oldHours}
                        onChange={(e) => onOldHoursChange(e.target.value)}
                        placeholder={`Wednesday: 9:00 AM – 10:00 PM
Thursday: 9:00 AM – 10:00 PM
Friday: 9:00 AM – 11:00 PM
Saturday: 10:00 AM – 11:00 PM
Sunday: 11:00 AM – 8:00 PM
Monday: 9:00 AM – 10:00 PM
Tuesday: 9:00 AM – 10:00 PM`}
                        className="w-full h-64 p-4 rounded-xl border border-dark-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none text-sm font-mono bg-white placeholder:text-dark-400"
                    />
                </CardContent>
            </Card>

            {/* New Hours Input */}
            <Card variant="gradient" className="h-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <CardTitle>New Business Hours (GMB)</CardTitle>
                            <CardDescription>Paste the hours from Google My Business</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <textarea
                        value={newHours}
                        onChange={(e) => onNewHoursChange(e.target.value)}
                        placeholder={`Hours: 
Wednesday	Open 24 hours
Thursday
(Christmas Day)
Open 24 hours
Hours might differ
Friday	Open 24 hours
Saturday	Open 24 hours
Sunday	Closed
Monday	Open 24 hours
Tuesday	Open 24 hours`}
                        className="w-full h-64 p-4 rounded-xl border border-dark-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none text-sm font-mono bg-white placeholder:text-dark-400"
                    />
                </CardContent>
            </Card>
        </div>
    );
}