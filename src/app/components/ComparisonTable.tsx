'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { ComparisonResult } from '@/types';
import { Table, ArrowDown, ArrowUp, Minus, XCircle, CheckCircle } from 'lucide-react';

interface ComparisonTableProps {
  results: ComparisonResult[];
}

export function ComparisonTable({ results }: ComparisonTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Extended':
        return (
          <Badge variant="warning" className="gap-1">
            <ArrowUp className="w-3 h-3" />
            Extended
          </Badge>
        );
      case 'Reduced':
        return (
          <Badge variant="danger" className="gap-1">
            <ArrowDown className="w-3 h-3" />
            Reduced
          </Badge>
        );
      case 'No Change':
        return (
          <Badge variant="success" className="gap-1">
            <Minus className="w-3 h-3" />
            No Change
          </Badge>
        );
      case 'Closed Now':
        return (
          <Badge variant="danger" className="gap-1">
            <XCircle className="w-3 h-3" />
            Closed Now
          </Badge>
        );
      case 'Open Now':
        return (
          <Badge variant="info" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Open Now
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRowBackground = (status: string) => {
    switch (status) {
      case 'Extended':
        return 'bg-amber-50/50 hover:bg-amber-50';
      case 'Reduced':
      case 'Closed Now':
        return 'bg-red-50/50 hover:bg-red-50';
      case 'No Change':
        return 'bg-emerald-50/30 hover:bg-emerald-50/50';
      default:
        return 'hover:bg-gray-50';
    }
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Table className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Detailed Hour-by-Hour Comparison</CardTitle>
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
                <th className="text-center py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Day Remark</th>
              </tr>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="py-2 px-4"></th>
                <th className="py-2 px-3 text-xs font-semibold text-blue-600">Open</th>
                <th className="py-2 px-3 text-xs font-semibold text-blue-600">Close</th>
                <th className="py-2 px-3 text-xs font-semibold text-amber-600">Open</th>
                <th className="py-2 px-3 text-xs font-semibold text-amber-600">Close</th>
                <th className="py-2 px-4"></th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr
                  key={result.day}
                  className={`border-b border-gray-100 transition-colors ${getRowBackground(result.status)}`}
                >
                  <td className="py-4 px-4">
                    <span className="font-bold text-gray-900">{result.day}</span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                      {result.newOpenTime}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">
                      {result.newCloseTime}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-sm font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                      {result.oldOpenTime}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="text-sm font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                      {result.oldCloseTime}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {getStatusBadge(result.status)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 block max-w-xs" title={result.dayRemark}>
                      {result.dayRemark}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}