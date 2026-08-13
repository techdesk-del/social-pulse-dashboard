'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { COLORS } from '../../lib/constants';

ChartJS.register(ArcElement, Tooltip);

interface Props {
  data: number[];
  colors: string[];
  labels?: string[];
}

export default function PieChart({ data, colors, labels }: Props) {
  const hasData = data.some((v) => v > 0);

  return (
    <Doughnut
      data={{
        labels: labels ?? [],
        datasets: [
          {
            data: hasData ? data : [1],
            backgroundColor: hasData ? colors : [COLORS.borderSoft],
            borderColor: COLORS.surface,
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: hasData
            ? {
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border,
                borderWidth: 1,
                titleColor: COLORS.text,
                bodyColor: COLORS.textDim,
                padding: 10,
              }
            : { enabled: false },
        },
      }}
    />
  );
}
