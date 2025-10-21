'use client';

import { useEffect, useRef } from 'react';

interface WaveformProps {
  audioUrl: string;
  height?: number;
  className?: string;
}

export function Waveform({ audioUrl, height = 128, className }: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: WaveSurfer.js 초기화 및 웨이브폼 렌더링
    // import WaveSurfer from 'wavesurfer.js';
    console.log('Waveform for:', audioUrl);
  }, [audioUrl]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height: `${height}px` }}
    >
      {/* Placeholder 웨이브폼 */}
      <div className="w-full h-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-md flex items-center justify-center">
        <div className="flex gap-1 items-end">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full"
              style={{
                height: `${Math.random() * 80 + 20}%`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
