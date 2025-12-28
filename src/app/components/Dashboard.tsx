'use client';

import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { HoursInput } from './HoursInput';
import { ComparisonTable } from './ComparisonTable';
import { FinalRemarkCard } from './FinalRemarkCard';
import { StatsCard } from './StatsCard';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { parseOldBusinessHours, parseNewBusinessHours } from '@/lib/parser';
import { compareBusinessHours, groupResults, calculateSummary } from '@/lib/comparator';
import { generateFinalRemarks, generateCopyableRemark, generateQuickRemark } from '@/lib/remarkGenerator';
import { ComparisonResult, FinalRemark, ComparisonSummary } from '@/types';
import {
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export function Dashboard() {
  const [oldHours, setOldHours] = useState('');
  const [newHours, setNewHours] = useState('');
  const [results, setResults] = useState<ComparisonResult[] | null>(null);
  const [remarks, setRemarks] = useState<FinalRemark[]>([]);
  const [copyableRemark, setCopyableRemark] = useState('');
  const [quickRemark, setQuickRemark] = useState('');
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = useCallback(() => {
    if (!oldHours.trim() || !newHours.trim()) {
      setError('Please enter both old and new business hours');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    setTimeout(() => {
      try {
        const parsedOld = parseOldBusinessHours(oldHours);
        const parsedNew = parseNewBusinessHours(newHours);
        
        const comparisonResults = compareBusinessHours(parsedOld, parsedNew);
        const grouped = groupResults(comparisonResults);
        const calculatedSummary = calculateSummary(comparisonResults);
        const finalRemarks = generateFinalRemarks(comparisonResults, grouped);
        const copyable = generateCopyableRemark(finalRemarks);
        const quick = generateQuickRemark(finalRemarks);
        
        setResults(comparisonResults);
        setSummary(calculatedSummary);
        setRemarks(finalRemarks);
        setCopyableRemark(copyable);
        setQuickRemark(quick);
        setIsProcessing(false);
      } catch (err) {
        console.error('Comparison error:', err);
        setError('Failed to parse business hours. Please check the format and try again.');
        setIsProcessing(false);
      }
    }, 600);
  }, [oldHours, newHours]);

  const handleReset = useCallback(() => {
    setOldHours('');
    setNewHours('');
    setResults(null);
    setRemarks([]);
    setCopyableRemark('');
    setQuickRemark('');
    setSummary(null);
    setError(null);
  }, []);

  const canCompare = oldHours.trim() && newHours.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-10">
        {/* Input Section */}
        <section className="mb-8">
          <HoursInput
            oldHours={oldHours}
            newHours={newHours}
            onOldHoursChange={setOldHours}
            onNewHoursChange={setNewHours}
          />
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handleCompare}
              disabled={!canCompare}
              loading={isProcessing}
              size="lg"
              icon={<Play className="w-5 h-5" />}
              className="min-w-[220px] text-base"
            >
              {isProcessing ? 'Analyzing...' : 'Compare Hours'}
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="lg"
              icon={<RotateCcw className="w-5 h-5" />}
            >
              Reset
            </Button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3 text-red-700 max-w-2xl mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </section>

        {/* Results Section */}
        {results && summary && (
          <section className="space-y-8 animate-fadeIn">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatsCard title="Total Days" value={summary.totalDays} icon={Calendar} variant="info" />
              <StatsCard title="No Change" value={summary.noChangeDays} icon={Minus} variant="success" />
              <StatsCard title="Reduced" value={summary.reducedDays} icon={TrendingDown} variant="danger" />
              <StatsCard title="Extended" value={summary.extendedDays} icon={TrendingUp} variant="warning" />
              <StatsCard title="Now Closed" value={summary.closedNowDays} icon={XCircle} variant="danger" />
              <StatsCard title="Now Open" value={summary.openNowDays} icon={CheckCircle2} variant="success" />
            </div>

            {/* Status Alerts */}
            {summary.shouldUpdate && (
              <Card className="bg-red-50 border-2 border-red-200">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-red-100 rounded-xl">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-800 text-lg">🚨 Action Required - Hours Reduced</h3>
                    <p className="text-red-700">
                      Store hours have been reduced or store is now closed. Please update the system accordingly.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!summary.shouldUpdate && summary.hasExtendedHours && (
              <Card className="bg-amber-50 border-2 border-amber-200">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-100 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 text-lg">⚠️ Extended Hours Detected</h3>
                    <p className="text-amber-700">
                      GMB shows extended hours. No changes required as this would extend store hours.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!summary.hasReducedHours && !summary.hasExtendedHours && (
              <Card className="bg-emerald-50 border-2 border-emerald-200">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800 text-lg">✅ Hours Verified - No Change</h3>
                    <p className="text-emerald-700">
                      No changes detected between GMB and system hours. Business hours are up to date.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Comparison Table */}
            <ComparisonTable results={results} />

            {/* Final Remarks */}
            <FinalRemarkCard 
              remarks={remarks} 
              copyableRemark={copyableRemark}
              quickRemark={quickRemark}
            />
          </section>
        )}

        {/* Empty State */}
        {!results && !isProcessing && (
          <section className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-8">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              Ready to Compare Business Hours
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-lg">
              Paste the current and new business hours above, then click "Compare Hours" to analyze changes and generate remarks.
            </p>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p className="font-semibold">Business Hours Comparator</p>
            <p className="text-sm mt-1">Streamlining business hour verification for operations teams</p>
          </div>
        </div>
      </footer>
    </div>
  );
}