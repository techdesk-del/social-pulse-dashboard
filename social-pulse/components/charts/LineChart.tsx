'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { COLORS } from '../../lib/constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface Props {
  labels: string[];
  data: number[];
  color: string;
  label: string;
}

export default function LineChart({ labels, data, color, label }: Props) {
  return (
    <Line
      data={{
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            backgroundColor: color.startsWith('#')
              ? color + '22'
              : color.replace(')', ', 0.13)').replace('rgb(', 'rgba('),
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: color,
            tension: 0.35,
            fill: true,
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
          },
        },
        scales: {
          x: {
            grid: { color: COLORS.borderSoft },
            ticks: { color: COLORS.textFaint, font: { size: 11 } },
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
