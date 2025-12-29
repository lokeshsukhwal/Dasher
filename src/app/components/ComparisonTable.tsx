'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { ComparisonResult, ChangeResult } from '@/types';
import { Table, ArrowDown, ArrowUp, Minus, XCircle, CheckCircle, Clock } from 'lucide-react';

interface ComparisonTableProps {
  results: ComparisonResult[];
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  const getStatusBadge = (result: ChangeResult) => {
    switch (result) {
      case 'Full Time Extended':
      case 'Start Time Extended':
      case 'End Time Extended':
      case 'Full Day Extended':
        return (
          <Badge variant="warning" className="gap-1 whitespace-nowrap">
            <ArrowUp className="w-3 h-3" />
            {result.replace(' Extended', '')} Extended
          </Badge>
        );
      case 'Full Time Reduced':
      case 'Start Time Reduced':
      case 'End Time Reduced':
      case 'Full Day Reduced':
        return (
          <Badge variant="danger" className="gap-1 whitespace-nowrap">
            <ArrowDown className="w-3 h-3" />
            {result.replace(' Reduced', '')} Reduced
          </Badge>
        );
      case 'No Change':
        return (
          <Badge variant="success" className="gap-1 whitespace-nowrap">
            <Minus className="w-3 h-3" />
            No Change
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="gap-1 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {result}
          </Badge>
        );
    }
  };

  const getRowBackground = (result: ChangeResult) => {
    if (result.includes('Extended')) {
      return 'bg-amber-50/50 hover:bg-amber-50';
    }
    if (result.includes('Reduced')) {
      return 'bg-red-50/50 hover:bg-red-50';
    }
    if (result === 'No Change') {
      return 'bg-emerald-50/30 hover:bg-emerald-50/50';
    }
    return 'hover:bg-gray-50';
  };

  const getTimeStyle = (time: string, isNew: boolean) => {
    const baseStyle = isNew 
      ? 'text-sm font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg'
      : 'text-sm font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg';
    
    if (time === 'Closed' || time === 'Blank') {
      return isNew 
        ? 'text-sm font-medium text-red-600 bg-red-100 px-2.5 py-1 rounded-lg'
        : 'text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg';
    }
    
    if (time === '24 Hours') {
      return isNew 
        ? 'text-sm font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-lg'
        : 'text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg';
    }
    
    return baseStyle;
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Table className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Detailed Hour-by-Hour Comparison</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Compare new GMB hours against current system hours</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Day</th>
                <th className="text-center py-4 px-3 text-sm font-bold text-blue-700 uppercase tracking-wider" colSpan={2}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    New Hours (GMB)
                  </div>
                </th>
                <th className="text-center py-4 px-3 text-sm font-bold text-amber-700 uppercase tracking-wider" colSpan={2}>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                    Old Hours (MINT)
                  </div>
                </th>
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Result</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Day Remark</th>
              </tr>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="py-2 px-4"></th>
                <th className="py-2 px-3 text-xs font-semibold text-blue-600">Start Time</th>
                <th className="py-2 px-3 text-xs font-semibold text-blue-600">End Time</th>
                <th className="py-2 px-3 text-xs font-semibold text-amber-600">Start Time</th>
                <th className="py-2 px-3 text-xs font-semibold text-amber-600">End Time</th>
                <th className="py-2 px-4"></th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr
                  key={result.day}
                  className={`border-b border-gray-100 transition-colors ${getRowBackground(result.result)}`}
                >
                  <td className="py-4 px-4">
                    <span className="font-bold text-gray-900">{result.day}</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className={getTimeStyle(result.newStartTime, true)}>
                      {result.newStartTime}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className={getTimeStyle(result.newEndTime, true)}>
                      {result.newEndTime}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className={getTimeStyle(result.oldStartTime, false)}>
                      {result.oldStartTime}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className={getTimeStyle(result.oldEndTime, false)}>
                      {result.oldEndTime}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(result.result)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 block max-w-sm" title={result.dayRemark}>
                      {result.dayRemark}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-50 border border-red-200 rounded"></span>
            <span>Reduced (Action Required)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-amber-50 border border-amber-200 rounded"></span>
            <span>Extended (No Action)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-emerald-50 border border-emerald-200 rounded"></span>
            <span>No Change</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}