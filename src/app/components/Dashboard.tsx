'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './Header';
import { HoursInput } from './HoursInput';
import { ComparisonTable } from './ComparisonTable';
import { RemarksSection } from './RemarksSection';
import { StatsCard } from './StatsCard';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { parseOldBusinessHours, parseNewBusinessHours } from '@/lib/parser';
import { compareBusinessHours, groupResults, calculateSummary } from '@/lib/comparator';
import { generateFinalRemarks, generateCopyableRemark } from '@/lib/remarkGenerator';
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
  const [summary, setSummary] = useState<ComparisonSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = useCallback(() => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Simulate processing delay for better UX
      setTimeout(() => {
        const parsedOld = parseOldBusinessHours(oldHours);
        const parsedNew = parseNewBusinessHours(newHours);
        
        const comparisonResults = compareBusinessHours(parsedOld, parsedNew);
        const grouped = groupResults(comparisonResults);
        const calculatedSummary = calculateSummary(comparisonResults);
        const finalRemarks = generateFinalRemarks(comparisonResults, grouped);
        const copyable = generateCopyableRemark(finalRemarks);
        
        setResults(comparisonResults);
        setSummary(calculatedSummary);
        setRemarks(finalRemarks);
        setCopyableRemark(copyable);
        setIsProcessing(false);
      }, 500);
    } catch (err) {
      setError('Failed to parse business hours. Please check the format.');
      setIsProcessing(false);
    }
  }, [oldHours, newHours]);

  const handleReset = useCallback(() => {
    setOldHours('');
    setNewHours('');
    setResults(null);
    setRemarks([]);
    setCopyableRemark('');
    setSummary(null);
    setError(null);
  }, []);

  const canCompare = oldHours.trim() && newHours.trim();

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
        {/* Input Section */}
        <section className="mb-8 animate-fade-in">
          <HoursInput
            oldHours={oldHours}
            newHours={newHours}
            onOldHoursChange={setOldHours}
            onNewHoursChange={setNewHours}
          />
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={handleCompare}
              disabled={!canCompare}
              loading={isProcessing}
              size="lg"
              icon={<Play className="w-5 h-5" />}
              className="min-w-[200px]"
            >
              Compare Hours
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
            <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-center gap-3 text-danger-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Results Section */}
        {results && summary && (
          <section className="space-y-8 animate-slide-up">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatsCard
                title="Total Days"
                value={summary.totalDays}
                icon={Calendar}
                variant="info"
              />
              <StatsCard
                title="No Change"
                value={summary.noChangeDays}
                icon={Minus}
                variant="success"
              />
              <StatsCard
                title="Reduced"
                value={summary.reducedDays}
                icon={TrendingDown}
                variant="danger"
              />
              <StatsCard
                title="Extended"
                value={summary.extendedDays}
                icon={TrendingUp}
                variant="warning"
              />
              <StatsCard
                title="Now Closed"
                value={summary.closedNowDays}
                icon={XCircle}
                variant="danger"
              />
              <StatsCard
                title="Now Open"
                value={summary.openNowDays}
                icon={CheckCircle2}
                variant="success"
              />
            </div>

            {/* Action Required Alert */}
            {summary.shouldUpdate && (
              <Card className="bg-danger-50 border-danger-200 border-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-danger-100 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-danger-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-danger-800">Action Required</h3>
                    <p className="text-danger-700">
                      Hours have been reduced or store is now closed. Please update the system accordingly.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!summary.shouldUpdate && summary.extendedDays > 0 && (
              <Card className="bg-warning-50 border-warning-200 border-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-warning-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-warning-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-warning-800">Extended Hours Detected</h3>
                    <p className="text-warning-700">
                      GMB shows extended hours. No changes required as per policy.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!summary.hasChanges && summary.extendedDays === 0 && (
              <Card className="bg-success-50 border-success-200 border-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success-100 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-success-800">Hours Verified</h3>
                    <p className="text-success-700">
                      No changes detected. Business hours are up to date.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Comparison Table */}
            <ComparisonTable results={results} />

            {/* Remarks Section */}
            <RemarksSection remarks={remarks} copyableRemark={copyableRemark} />
          </section>
        )}

        {/* Empty State */}
        {!results && !isProcessing && (
          <section className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-100 mb-6">
              <Calendar className="w-10 h-10 text-dark-400" />
            </div>
            <h3 className="text-xl font-semibold text-dark-700 mb-2">
              Ready to Compare
            </h3>
            <p className="text-dark-500 max-w-md mx-auto">
              Paste the old and new business hours above, then click "Compare Hours" to analyze the changes.
            </p>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-dark-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-dark-500 text-sm">
            <p>Business Hours Comparator - Built for DoorDash Operations Team</p>
            <p className="mt-1">Streamlining business hour verification process</p>
          </div>
        </div>
      </footer>
    </div>
  );
}