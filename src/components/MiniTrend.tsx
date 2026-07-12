import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniTrendProps {
  data: number[];
  color?: string;
}

export const MiniTrend: React.FC<MiniTrendProps> = ({ data, color = '#00B67A' }) => {
  const chartData = data.map((val, idx) => ({ name: idx.toString(), value: val }));

  return (
    <div className="h-7 w-20 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
