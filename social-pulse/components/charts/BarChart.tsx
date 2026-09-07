'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { COLORS } from '../../lib/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface Props {
  labels: string[];
  data: number[];
  colors: string[];
}

export default function BarChart({ labels, data, colors }: Props) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
            borderWidth: 1,
            titleColor: COLORS.text,
            bodyColor: COLORS.textDim,
            padding: 10,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const val = context.parsed.y ?? 0;
                if (label.toLowerCase().includes('google') || label.toLowerCase().includes('review')) {
                  return ` ${val} new customer review${val === 1 ? '' : 's'}`;
                }
                if (label.toLowerCase().includes('click') || label.toLowerCase().includes('action')) {
                  return ` ${val} direct action${val === 1 ? '' : 's'}`;
                }
                return ` ${val} new follower${val === 1 ? '' : 's'}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: COLORS.textDim,
              font: { size: 11, weight: 'bold' },
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false,
            },
            border: { color: COLORS.border },
          },
          y: {
            grid: { color: COLORS.borderSoft },
            ticks: { color: COLORS.textFaint, font: { size: 11 } },
            border: { color: COLORS.border },
            beginAtZero: true,
          },
        },
      }}
    />
  );
}
