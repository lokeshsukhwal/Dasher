'use client';

import React from 'react';
import { Card } from './ui/Card';
import { ComparisonResult } from '@/types';
import { formatTimeForDisplay } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ComparisonTableProps {
    results: ComparisonResult[] | null;
}

export function ComparisonTable({ results }: ComparisonTableProps) {
    const [expandedDay, setExpandedDay] = React.useState<string | null>(null);

    if (!results || results.length === 0) {
        return null;
    }

    const getStatusIcon = (result: ComparisonResult) => {
        if (result.changeType === 'NO_CHANGE') {
            return '✓';
        }
        if (result.changeDetails.openTimeExtended || result.changeDetails.closeTimeExtended) {
            return '↑';
        }
        if (result.changeDetails.openTimeReduced || result.changeDetails.closeTimeReduced) {
            return '↓';
        }
        if (result.newHours.isClosed) {
            return '×';
        }
        return '→';
    };

    const getStatusColor = (result: ComparisonResult) => {
        if (result.changeType === 'NO_CHANGE') {
            return 'bg-green-50 border-green-200';
        }
        if (result.changeDetails.openTimeExtended || result.changeDetails.closeTimeExtended) {
            return 'bg-blue-50 border-blue-200';
        }
        if (result.changeDetails.openTimeReduced || result.changeDetails.closeTimeReduced) {
            return 'bg-yellow-50 border-yellow-200';
        }
        return 'bg-red-50 border-red-200';
    };

    return (
        <Card className="mt-8">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Day</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Old Hours</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">New Hours</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result) => (
                            <React.Fragment key={result.day}>
                                <tr
                                    className={`border-b transition-colors cursor-pointer hover:bg-gray-50 ${getStatusColor(result)}`}
                                    onClick={() => setExpandedDay(expandedDay === result.day ? null : result.day)}
                                >
                                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{result.day}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {result.oldHours.isClosed ? 'Closed' : `${formatTimeForDisplay(result.oldHours.open)} - ${formatTimeForDisplay(result.oldHours.close)}`}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">
                                        {result.newHours.isClosed ? 'Closed' : `${formatTimeForDisplay(result.newHours.open)} - ${formatTimeForDisplay(result.newHours.close)}`}
                                    </td>
                                    <td className="px-6 py-3 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getStatusIcon(result)}</span>
                                            {expandedDay === result.day ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedDay === result.day && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={4} className="px-6 py-3">
                                            <div className="space-y-2 text-sm">
                                                {result.changeType === 'NO_CHANGE' && (
                                                    <p className="text-green-700">✓ No changes</p>
                                                )}
                                                {result.changeDetails.openTimeExtended && (
                                                    <p className="text-blue-700">Opening time extended</p>
                                                )}
                                                {result.changeDetails.closeTimeExtended && (
                                                    <p className="text-blue-700">Closing time extended</p>
                                                )}
                                                {result.changeDetails.openTimeReduced && (
                                                    <p className="text-yellow-700">Opening time reduced</p>
                                                )}
                                                {result.changeDetails.closeTimeReduced && (
                                                    <p className="text-yellow-700">Closing time reduced</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
