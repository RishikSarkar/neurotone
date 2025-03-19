'use client';

import dynamic from 'next/dynamic';

const WaveformVisualization = dynamic(
  () => import('@/components/WaveformVisualization'),
  { ssr: false }
);

export default function WaveformContainer() {
  return (
    <div className="w-full max-w-sm h-64 overflow-hidden mx-auto">
      <WaveformVisualization />
    </div>
  );
} 