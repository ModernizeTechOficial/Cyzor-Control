import React from 'react';

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({ data, color = '#E5E7EB', width = 60, height = 30 }: SparklineProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  // Add a little padding to the range so bars aren't 0 height
  const range = max - min === 0 ? 1 : max - min;
  
  const barWidth = Math.max(2, (width / data.length) - 2);

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((val, index) => {
        const x = index * (width / data.length);
        // Minimum height of 10% so even min value is visible
        const barHeight = Math.max(height * 0.1, ((val - min) / range) * height);
        const y = height - barHeight;
        const isLast = index === data.length - 1;
        
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={isLast ? '#000000' : color}
            rx={1}
          />
        );
      })}
    </svg>
  );
}
