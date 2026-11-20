import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Award, CheckCircle2, Target, ArrowUpRight } from 'lucide-react';
import { TestResult } from '../types/teas';

interface PerformanceTrendsChartProps {
  testHistory: TestResult[];
  targetScore?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      score: number;
      date: string;
      subject: string;
      passed: boolean;
      questions: number;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const isPass = data.score >= 75;

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs space-y-1.5 min-w-[170px] backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>{data.name}</span>
          <span>{data.subject}</span>
        </div>

        <div className="flex items-baseline justify-between gap-3 pt-1">
          <span className="text-xl font-extrabold font-mono text-teal-300">
            {data.score}%
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isPass
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isPass ? 'Passed' : 'Below Cutoff'}
          </span>
        </div>

        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
          <span>{data.date}</span>
          <span>{data.questions} Qs</span>
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceTrendsChart: React.FC<PerformanceTrendsChartProps> = ({
  testHistory,
  targetScore = 88,
}) => {
  // Take last 10 practice exams (from oldest to newest for chronological left-to-right display)
  const recentTests = [...testHistory].slice(0, 10).reverse();

  const chartData = recentTests.map((t, idx) => ({
    name: `Exam ${idx + 1}`,
    shortName: `#${idx + 1}`,
    score: t.score,
    passingBenchmark: 75,
    targetScore,
    date: t.date,
    subject: t.subject === 'all' ? 'Mock Exam' : t.subject.toUpperCase(),
    passed: t.passed,
    questions: t.totalQuestions,
  }));

  // Calculations for trend summary
  const firstScore = chartData.length > 0 ? chartData[0].score : 0;
  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0;
  const scoreDiff = latestScore - firstScore;
  const passedCount = chartData.filter((d) => d.score >= 75).length;
  const passRate = chartData.length > 0 ? Math.round((passedCount / chartData.length) * 100) : 0;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            <TrendingUp className="w-4 h-4" />
            <span>Score Analytics & Trajectory</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Performance Trends Over Last 10 Practice Exams
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitoring score growth relative to the 75% ATI TEAS 7 proficiency benchmark and your {targetScore}% target goal.
          </p>
        </div>

        {/* Quick Trend Badges */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 text-left">
            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold uppercase tracking-wider block">
              Overall Improvement
            </span>
            <div className="flex items-center gap-1 font-mono text-base font-extrabold text-teal-700 dark:text-teal-300">
              <ArrowUpRight className="w-4 h-4" />
              <span>{scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
              Pass Rate ({passedCount}/{chartData.length})
            </span>
            <div className="font-mono text-base font-extrabold text-slate-900 dark:text-slate-100">
              {passRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
            />

            <XAxis
              dataKey="shortName"
              tickLine={false}
              axisLine={{ stroke: 'currentColor', className: 'text-slate-200 dark:text-slate-800' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={8}
            />

            <YAxis
              domain={[50, 100]}
              ticks={[50, 60, 70, 75, 80, 90, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
              tickFormatter={(v) => `${v}%`}
              dx={-4}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* TEAS 7 National Cutoff Reference Line (75%) */}
            <ReferenceLine
              y={75}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: '75% Pass Benchmark',
                position: 'insideBottomRight',
                fill: '#d97706',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* Target Score Reference Line */}
            <ReferenceLine
              y={targetScore}
              stroke="#0d9488"
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: `Goal: ${targetScore}%`,
                position: 'insideTopRight',
                fill: '#0d9488',
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#scoreLineGradient)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: '#0d9488',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: '#0d9488',
                stroke: '#ffffff',
                strokeWidth: 2,
                className: 'drop-shadow-md',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" />
            <span>Practice Exam Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
            <span>75% Passing Cutoff</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-teal-600 inline-block" />
            <span>{targetScore}% Target (Admissions)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Scores consistently above cutoff since Exam 4</span>
        </div>
      </div>
    </div>
  );
};
