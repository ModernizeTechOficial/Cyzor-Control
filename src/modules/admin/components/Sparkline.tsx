import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, color = '#6366F1', width = 120, height = 36 }: SparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Create area path
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Sparkline Area */}
      <polygon
        points={areaPoints}
        fill={`url(#sparkline-grad-${color})`}
      />
      {/* Sparkline Line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Last Value Pulsing Indicator */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="2.5"
          className="fill-zinc-950 stroke-white stroke-[1px] animate-pulse"
        />
      )}
    </svg>
  );
}
