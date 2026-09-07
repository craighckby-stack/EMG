/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/components/NeuralChart.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Activity, FileCode, Zap } from 'lucide-react';

Chart.register(...registerables);

interface NeuralChartProps {
  activePath: string | null;
  latencyHistory: number[];
  latestLatency: number;
}

export const NeuralChart: React.FC<NeuralChartProps> = ({
  activePath,
  latencyHistory,
  latestLatency,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 220);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = Array(latencyHistory.length).fill('');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Neural Latency (ms)',
            data: [...latencyHistory],
            borderColor: '#3b82f6',
            borderWidth: 2.2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.38,
            pointRadius: (context) => {
              const index = context.dataIndex;
              const count = context.dataset.data.length;
              return index === count - 1 ? 4 : 0;
            },
            pointBackgroundColor: '#60a5fa',
            pointBorderColor: '#1d4ed8',
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#171717',
            titleColor: '#a3a3a3',
            bodyColor: '#60a5fa',
            borderColor: '#262626',
            borderWidth: 1,
            padding: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y} ms`,
            },
          },
        },
        scales: {
          x: {
            display: false,
            grid: { display: false },
          },
          y: {
            display: true,
            position: 'right',
            suggestedMin: 0,
            suggestedMax: 1500,
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
            },
            ticks: {
              color: '#737373',
              font: { size: 10, family: 'monospace' },
              callback: (value) => `${value}ms`,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  // Update chart data whenever latencyHistory changes
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.labels = Array(latencyHistory.length).fill('');
      chartInstanceRef.current.data.datasets[0].data = [...latencyHistory];
      chartInstanceRef.current.update('none');
    }
  }, [latencyHistory]);

  const maxVal = Math.max(...latencyHistory, 0);
  const minVal = latencyHistory.filter((v) => v > 0).length
    ? Math.min(...latencyHistory.filter((v) => v > 0))
    : 0;

  return (
    <div
      id="emg-neural-chart"
      className="bg-neutral-900/80 border border-neutral-800/80 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
            Neural Pulse Telemetry
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-neutral-400">
            Min: <strong className="text-emerald-400">{minVal}ms</strong>
          </span>
          <span className="text-neutral-400">
            Peak: <strong className="text-amber-400">{maxVal}ms</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
            Live: {latestLatency}ms
          </span>
        </div>
      </div>

      {activePath && (
        <div className="flex items-center gap-2 text-xs font-mono bg-neutral-950/60 border border-neutral-800/80 rounded-xl px-3 py-1.5 text-neutral-300">
          <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-neutral-500 text-[11px]">ACTIVE TARGET:</span>
          <span className="text-sky-300 font-semibold truncate">{activePath}</span>
        </div>
      )}

      <div className="w-full h-48 md:h-56 relative">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
