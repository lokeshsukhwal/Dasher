'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { FinalRemark } from '@/types';
import { 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinalRemarkCardProps {
  remarks: FinalRemark[];
  copyableRemark: string;
  quickRemark: string;
}

export function FinalRemarkCard({ remarks, copyableRemark, quickRemark }: FinalRemarkCardProps) {
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [activeTab, setActiveTab] = useState<'detailed' | 'quick'>('detailed');

  const handleCopyFull = async () => {
    try {
      await navigator.clipboard.writeText(copyableRemark);
      setCopiedFull(true);
      setTimeout(() => setCopiedFull(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyQuick = async () => {
    try {
      await navigator.clipboard.writeText(quickRemark);
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getRemarkStyle = (type: FinalRemark['type']) => {
    switch (type) {
      case 'reduced':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          badge: 'danger' as const,
        };
      case 'extended':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-50',
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          badge: 'warning' as const,
        };
      case 'blank':
        return {
          border: 'border-l-purple-500',
          bg: 'bg-purple-50',
          icon: <FileText className="w-5 h-5 text-purple-500" />,
          badge: 'info' as const,
        };
      default:
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-emerald-50',
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          badge: 'success' as const,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('detailed')}
          className={cn(
            'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'detailed'
              ? 'bg-white text-gray-900 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Detailed Remarks
        </button>
        <button
          onClick={() => setActiveTab('quick')}
          className={cn(
            'px-6 py-2.5 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'quick'
              ? 'bg-white text-gray-900 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Quick Copy
        </button>
      </div>

      {activeTab === 'detailed' && (
        <>
          {/* Individual Remarks */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Generated Remarks</CardTitle>
                    <CardDescription>Auto-generated remarks based on hour comparison</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={handleCopyFull}
                  variant={copiedFull ? 'success' : 'primary'}
                  icon={copiedFull ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copiedFull ? 'Copied!' : 'Copy All Remarks'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {remarks.map((remark, index) => {
                  const style = getRemarkStyle(remark.type);
                  return (
                    <div
                      key={index}
                      className={cn(
                        'p-5 rounded-xl border-l-4 transition-all duration-300',
                        style.border,
                        style.bg
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {style.icon}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h4 className="font-bold text-gray-900 text-lg">{remark.title}</h4>
                            {remark.actionRequired ? (
                              <Badge variant="danger" size="sm">Action Required</Badge>
                            ) : (
                              <Badge variant="success" size="sm">No Action Needed</Badge>
                            )}
                          </div>
                          <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
                            <p className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">
                              <span className="font-bold text-gray-900">Remark: </span>
                              {remark.remark}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Full Copyable Output */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-800 rounded-xl">
                  <Copy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Full Report Output</CardTitle>
                  <CardDescription>Complete formatted remark ready to paste</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap leading-relaxed">
                  {copyableRemark}
                </pre>
                <Button
                  onClick={handleCopyFull}
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 text-gray-400 hover:text-white hover:bg-gray-700"
                  icon={copiedFull ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copiedFull ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'quick' && (
        <Card variant="gradient">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Quick Remark (One-Click Copy)</CardTitle>
                  <CardDescription>Just the remark text, ready to paste directly</CardDescription>
                </div>
              </div>
              <Button
                onClick={handleCopyQuick}
                variant={copiedQuick ? 'success' : 'primary'}
                size="lg"
                icon={copiedQuick ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              >
                {copiedQuick ? 'Copied!' : 'Copy Remark'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-inner">
              <p className="text-base text-gray-800 font-mono whitespace-pre-wrap leading-relaxed">
                {quickRemark}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}