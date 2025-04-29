'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Legend,
} from 'recharts';
import { CurveType } from 'recharts/types/shape/Curve';
import { getCdrBandKeyFromScore } from '@/lib/recommendations';

interface ChartDataPoint {
  date: string; // ISO string or formatted date
  eCdrSb: number; // Expected CDR-SB score
  rawP: number; // Raw probability from model
}

interface CdrTrajectoryChartProps {
  data: ChartDataPoint[];
  baselineCdrSb: number | null;
  loading?: boolean;
  currentScore: number | null;
}

// --- Updated Bands using SHADES OF WHITE (rgba) with HIGHER OPACITY ---
const cdrSeverityBands = [
  // Progressively more opaque white
  { y1: 0,   y2: 0.49, label: 'None (0)',           key: '0',   color: 'rgba(255, 255, 255, 0.30)' }, // Start at 30%
  { y1: 0.5, y2: 4.0,  label: 'Questionable (0.5)', key: '0.5', color: 'rgba(255, 255, 255, 0.35)' },
  { y1: 4.5, y2: 9.0,  label: 'Mild (1)',           key: '1',   color: 'rgba(255, 255, 255, 0.40)' },
  { y1: 9.5, y2: 15.5, label: 'Moderate (2)',       key: '2',   color: 'rgba(255, 255, 255, 0.45)' },
  { y1: 16.0,y2: 18.0, label: 'Severe (3)',         key: '3',   color: 'rgba(255, 255, 255, 0.50)' }, // End at 50%
];

// Define midpoint CDR-SB for each Global CDR bucket
export const cdrBucketMidpoints: Record<string, number> = {
  '0': 0,
  '0.5': 2.25, // (0.5 + 4.0) / 2
  '1': 6.75, // (4.5 + 9.0) / 2
  '2': 12.5, // (9.5 + 15.5) / 2
  '3': 17.0, // (16.0 + 18.0) / 2
};

// Format date for X-axis ticks
const formatDateTick = (tickItem: string) => {
  try {
    return new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return tickItem; // Fallback if parsing fails
  }
};

// Using 'any' specifically for the Recharts payload structure
interface CustomTooltipProps {
  active?: boolean;
  // Using 'any' here as Recharts internal payload structure can be complex/variable
  payload?: any[];
  label?: string | number;
}

// Apply the interface
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    // Type checking inside the function remains useful
    if (active && payload && payload.length && payload[0].payload && (typeof label === 'string' || typeof label === 'number')) { // Allow number label too
      const data: ChartDataPoint = payload[0].payload; // Still assert the type you expect here

      const date = new Date(label); // Simplified date creation

      // Using dark text on light tooltip background
      return (
        <div className="bg-gray-50/95 p-3 border border-gray-300 rounded-lg shadow-lg text-sm font-[Inter,sans-serif]">
          <p className="font-semibold text-gray-800 mb-1">{`Date: ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}</p>
          <p className="text-gray-700">{`Est. CDR-SB: `}<span className="font-medium">{data.eCdrSb.toFixed(2)}</span></p>
          <p className="text-gray-600">{`Model Probability: `}<span className="font-medium">{(data.rawP * 100).toFixed(1)}%</span></p>
        </div>
      );
    }
    return null;
};

// --- Main Chart Component ---
export const CdrTrajectoryChart: React.FC<CdrTrajectoryChartProps> = ({
  data = [],
  baselineCdrSb,
  loading = false,
  currentScore,
}) => {
  const hasBaseline = baselineCdrSb !== null;
  const hasData = data.length > 0;
  const currentBandKey = getCdrBandKeyFromScore(currentScore);

  // --- Loading and No Baseline states ---
  if (loading) {
    return (
        <div className="p-6 min-h-[300px] flex items-center justify-center text-medium-blue/80">
            <svg className="animate-spin h-8 w-8 text-blue-teal mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading chart data...
        </div>
    );
  }

  // Show message only if no baseline exists yet
  if (!hasBaseline) {
    return (
        <div className="p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-teal/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-medium-blue/70">
                Complete the initial screening survey first to establish your baseline.
             </p>
        </div>
    );
  }

  // --- Style Definitions --- ALL TEXT WHITE/LIGHT ---
  const axisTickStyle = { fontSize: 11, fill: '#F7FAFC', fontFamily: 'Inter, sans-serif', fontWeight: 400 }; // Very Light Gray/White
  const legendStyle = { fontSize: 12, color: '#F7FAFC', fontFamily: 'Inter, sans-serif' }; // Very Light Gray/White
  const baselineLabelStyle = {
      fill: '#FFFFFF', // White
      fontSize: 10,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      dy: -4,
      dx: 10
  };
  // Band labels WHITE now
  const bandLabelStyle = {
      fill: '#FFFFFF', // White labels
      fontSize: 9,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500, // Keep medium weight
      dy: 10,
      dx: -5
  };
  const placeholderTextStyle = { fill: '#E2E8F0', fontSize: 14, fontFamily: 'Inter, sans-serif'}; // Light gray placeholder

  return (
    <div className="p-4 h-[400px] bg-transparent">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          style={{ background: 'transparent' }}
        >
          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 7" stroke="rgba(255, 255, 255, 0.15)" vertical={false} />

          {/* Severity Bands using White Shades */}
          {cdrSeverityBands.map((band) => {
             const isCurrentBand = band.key === currentBandKey;
             return (
                <ReferenceArea
                    key={band.label}
                    y1={band.y1}
                    y2={band.y2}
                    fill={band.color} // Use the rgba white color
                    // Opacity is now mainly controlled by the fill color's alpha
                    // Can still add a slight boost for active if needed
                    fillOpacity={isCurrentBand ? 0.95 : 0.9}
                    ifOverflow="visible"
                    label={{ ...bandLabelStyle, value: band.label, position: 'insideTopRight' }}
                    // White border highlight for active band
                    stroke={isCurrentBand ? '#FFFFFF' : 'none'}
                    strokeWidth={isCurrentBand ? 2 : 0}
                />
             );
          })}

          {/* Axes */}
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={axisTickStyle} // White text
            dy={10}
            stroke="rgba(255, 255, 255, 0.3)"
            axisLine={{ strokeWidth: 1 }}
            tickLine={{ stroke: "rgba(255, 255, 255, 0.3)" }}
          />
          <YAxis
            domain={[0, 18]}
            tick={axisTickStyle} // White text
            dx={-5}
            width={35}
            axisLine={false}
            tickLine={false}
          />

          {/* Tooltip */}
          {hasData && <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 1.5, strokeDasharray: '4 4' }} />}

          {/* Legend */}
          {hasData && (
             <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={legendStyle} // White text
             />
          )}

          {/* Baseline */}
          <ReferenceLine
            y={baselineCdrSb}
            label={{ ...baselineLabelStyle, value: `Baseline: ${baselineCdrSb?.toFixed(1)}`, position: 'insideBottomLeft' }} // White text
            stroke="#FFFFFF"
            strokeDasharray="4 4"
            strokeWidth={2}
          />

          {/* Data Line */}
          {hasData && (
            <Line
              type={'monotone' as CurveType}
              dataKey="eCdrSb"
              name="Est. CDR-SB"
              stroke="#9bbab5" // Primary Teal line still works well
              strokeWidth={3}
              dot={{ fill: '#111827', stroke: '#9bbab5', strokeWidth: 2, r: 4 }} // Very dark gray dots with teal stroke
              activeDot={{ fill: '#9bbab5', stroke: '#FFFFFF', strokeWidth: 2, r: 6 }}
              connectNulls
            />
          )}

          {/* Placeholder text */}
          {!hasData && (
             <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" {...placeholderTextStyle}>
                Baseline established. Record your voice to see progress.
             </text>
          )}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 