'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { FinalRemarks } from '@/types';
import { getReduceRemarkTitle, getExtendRemarkTitle } from '@/lib/remarkGenerator';
import { 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  ClipboardList,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemarksSectionProps {
  finalRemarks: FinalRemarks;
  copyableRemark: string;
}

export function RemarksSection({ finalRemarks, copyableRemark }: RemarksSectionProps) {
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedReduce, setCopiedReduce] = useState(false);
  const [copiedExtend, setCopiedExtend] = useState(false);
  const [activeTab, setActiveTab] = useState<'detailed' | 'quick'>('detailed');

  const handleCopy = async (text: string, type: 'full' | 'reduce' | 'extend') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'full') {
        setCopiedFull(true);
        setTimeout(() => setCopiedFull(false), 2000);
      } else if (type === 'reduce') {
        setCopiedReduce(true);
        setTimeout(() => setCopiedReduce(false), 2000);
      } else {
        setCopiedExtend(true);
        setTimeout(() => setCopiedExtend(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatReduceRemark = () => {
    if (!finalRemarks.hasReduceChanges) return '';
    return `Hours Change:\n${finalRemarks.reduceRemark}`;
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
          <span className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Detailed View
          </span>
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
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick Copy
          </span>
        </button>
      </div>

      {activeTab === 'detailed' && (
        <>
          {/* No Changes */}
          {finalRemarks.hasNoChanges && (
            <Card className="bg-emerald-50 border-2 border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-emerald-800 text-lg">Hours Found No Change</h4>
                    <Badge variant="success" size="sm">No Action Needed</Badge>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 border border-emerald-200">
                    <p className="text-emerald-700 font-mono">
                      <span className="font-bold">Remark: </span>No change in hours.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Reduce Remarks - Action Required */}
          {finalRemarks.hasReduceChanges && (
            <Card className="bg-red-50 border-2 border-red-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-red-800 text-lg">
                        {getReduceRemarkTitle(finalRemarks.reduceRemark)}
                      </h4>
                      <Badge variant="danger" size="sm">Action Required</Badge>
                    </div>
                    <Button
                      onClick={() => handleCopy(formatReduceRemark(), 'reduce')}
                      variant={copiedReduce ? 'success' : 'danger'}
                      size="sm"
                      icon={copiedReduce ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copiedReduce ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 border border-red-200">
                    <p className="text-red-800 font-mono whitespace-pre-wrap leading-relaxed">
                      <span className="font-bold">Remark: </span>Hours Change:
                    </p>
                    <p className="text-red-700 font-mono whitespace-pre-wrap leading-relaxed mt-2 pl-4">
                      {finalRemarks.reduceRemark}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Extend Remarks - No Action */}
          {finalRemarks.hasExtendChanges && (
            <Card className="bg-amber-50 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-amber-800 text-lg">{getExtendRemarkTitle()}</h4>
                      <Badge variant="warning" size="sm">No Action Needed</Badge>
                    </div>
                    <Button
                      onClick={() => handleCopy(finalRemarks.extendRemark, 'extend')}
                      variant={copiedExtend ? 'success' : 'secondary'}
                      size="sm"
                      icon={copiedExtend ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {copiedExtend ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 border border-amber-200">
                    <p className="text-amber-800 font-mono whitespace-pre-wrap leading-relaxed">
                      <span className="font-bold">Remark: </span>{finalRemarks.extendRemark}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Full Copyable Output */}
          {!finalRemarks.hasNoChanges && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-800 rounded-xl">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Complete Remark Output</CardTitle>
                      <CardDescription>All remarks combined, ready to paste</CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCopy(copyableRemark, 'full')}
                    variant={copiedFull ? 'success' : 'primary'}
                    icon={copiedFull ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  >
                    {copiedFull ? 'Copied!' : 'Copy All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap leading-relaxed">
                  {copyableRemark}
                </pre>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {activeTab === 'quick' && (
        <div className="grid gap-4">
          {/* Quick Copy Cards */}
          {finalRemarks.hasNoChanges && (
            <Card variant="gradient" className="border-2 border-emerald-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <CardTitle className="text-emerald-800">No Change Remark</CardTitle>
                  </div>
                  <Button
                    onClick={() => handleCopy('No change in hours.', 'full')}
                    variant={copiedFull ? 'success' : 'primary'}
                    size="lg"
                    icon={copiedFull ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  >
                    {copiedFull ? 'Copied!' : 'Copy Remark'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-inner">
                  <p className="text-lg text-gray-800 font-mono">No change in hours.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {finalRemarks.hasReduceChanges && (
            <Card variant="gradient" className="border-2 border-red-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <CardTitle className="text-red-800">Reduce Hours Remark</CardTitle>
                      <Badge variant="danger" size="sm" className="mt-1">Action Required</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCopy(formatReduceRemark(), 'reduce')}
                    variant={copiedReduce ? 'success' : 'danger'}
                    size="lg"
                    icon={copiedReduce ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  >
                    {copiedReduce ? 'Copied!' : 'Copy Remark'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-xl p-4 border border-red-200 shadow-inner">
                  <p className="text-gray-800 font-mono whitespace-pre-wrap">Hours Change:</p>
                  <p className="text-gray-700 font-mono whitespace-pre-wrap mt-2">{finalRemarks.reduceRemark}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {finalRemarks.hasExtendChanges && (
            <Card variant="gradient" className="border-2 border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <div>
                      <CardTitle className="text-amber-800">Extended Hours Remark</CardTitle>
                      <Badge variant="warning" size="sm" className="mt-1">No Action Needed</Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCopy(finalRemarks.extendRemark, 'extend')}
                    variant={copiedExtend ? 'success' : 'secondary'}
                    size="lg"
                    icon={copiedExtend ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  >
                    {copiedExtend ? 'Copied!' : 'Copy Remark'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-inner">
                  <p className="text-gray-800 font-mono whitespace-pre-wrap">{finalRemarks.extendRemark}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}