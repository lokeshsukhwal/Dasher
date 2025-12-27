import { NextRequest, NextResponse } from 'next/server';
import { parseOldBusinessHours, parseNewBusinessHours } from '@/lib/parser';
import { compareBusinessHours, groupResults, calculateSummary } from '@/lib/comparator';
import { generateFinalRemarks, generateCopyableRemark } from '@/lib/remarkGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldHours, newHours } = body;

    if (!oldHours || !newHours) {
      return NextResponse.json(
        { error: 'Both oldHours and newHours are required' },
        { status: 400 }
      );
    }

    const parsedOld = parseOldBusinessHours(oldHours);
    const parsedNew = parseNewBusinessHours(newHours);
    
    const results = compareBusinessHours(parsedOld, parsedNew);
    const grouped = groupResults(results);
    const summary = calculateSummary(results);
    const remarks = generateFinalRemarks(results, grouped);
    const copyableRemark = generateCopyableRemark(remarks);

    return NextResponse.json({
      success: true,
      data: {
        results,
        grouped,
        summary,
        remarks,
        copyableRemark,
      },
    });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to process comparison' },
      { status: 500 }
    );
  }
}