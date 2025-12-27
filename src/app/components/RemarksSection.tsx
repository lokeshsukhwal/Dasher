'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { FinalRemark } from '@/types';
import { generateCopyableRemark } from '@/lib/remarkGenerator';
import { 
  FileText, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RemarksSectionProps {
  remarks: FinalRemark[];
  copyableRemark: string;
}

export function RemarksSection({ remarks, copyableRemark }: RemarksSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyableRemark);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getRemarkIcon = (type: FinalRemark['type']) => {
    switch (type) {
      case 'reduced':
        return <AlertTriangle className="w-5 h-5 text-danger-500" />;
      case 'extended':
        return <CheckCircle className="w-5 h-5 text-warning-500" />;
      case 'noChange':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      default:
        return <FileText className="w-5 h-5 text-dark-500" />;
    }
  };

  const getRemarkBorderColor = (type: FinalRemark['type']) => {
    switch (type) {
      case 'reduced':
        return 'border-l-danger-500 bg-danger-50/50';
      case 'extended':
        return 'border-l-warning-500 bg-warning-50/50';
      case 'noChange':
        return 'border-l-success-500 bg-success-50/50';
      default:
        return 'border-l-dark-300 bg-dark-50/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Individual Remarks */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <CardTitle>Generated Remarks</CardTitle>
                <CardDescription>Review the auto-generated remarks for your report</CardDescription>
              </div>
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? 'success' : 'primary'}
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {remarks.map((remark, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-xl border-l-4 transition-all duration-300 hover:shadow-md',
                  getRemarkBorderColor(remark.type)
                )}
              >
                <div className="flex items-start gap-3">
                  {getRemarkIcon(remark.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-dark-900">{remark.title}</h4>
                      {remark.actionRequired && (
                        <Badge variant="danger" size="sm">
                          Action Required
                        </Badge>
                      )}
                      {!remark.actionRequired && (
                        <Badge variant="success" size="sm">
                          No Action Needed
                        </Badge>
                      )}
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 border border-dark-100">
                      <p className="text-sm text-dark-700 font-mono whitespace-pre-wrap">
                        {remark.remark}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Copyable Output */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-dark-100 rounded-lg">
              <Copy className="w-5 h-5 text-dark-600" />
            </div>
            <div>
              <CardTitle>Full Report Output</CardTitle>
              <CardDescription>Ready to paste into your verification system</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-dark-900 text-dark-100 p-6 rounded-xl overflow-x-auto text-sm font-mono whitespace-pre-wrap">
              {copyableRemark}
            </pre>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 text-dark-400 hover:text-white hover:bg-dark-700"
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}