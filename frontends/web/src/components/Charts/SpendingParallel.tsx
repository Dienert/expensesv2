// @ts-ignore
import React, { useMemo } from 'react';
// @ts-ignore
import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates';
import type { Transaction } from '../../lib/types';
import { format } from 'date-fns';

interface SpendingParallelProps {
    transactions: Transaction[];
}

export const SpendingParallel: React.FC<SpendingParallelProps> = ({ transactions }) => {
    const { data, variables, monthLabels } = useMemo(() => {
        // 0. Initial Guard
        const expenses = transactions.filter(t => !t.isIncome);
        if (expenses.length === 0) return { data: [], variables: [], monthLabels: [] };

        // 1. Group by Month
        const months: Record<string, any> = {};
        const allCategories = new Set<string>();

        expenses.forEach(t => {
            const monthKey = format(t.date, 'yyyy-MM');
            if (!months[monthKey]) {
                months[monthKey] = { month: monthKey };
            }

            const cat = t.category;
            allCategories.add(cat);
            months[monthKey][cat] = (months[monthKey][cat] || 0) + Math.abs(t.amount);
        });

        // 2. Select Top Categories
        const topCategories = Array.from(allCategories)
            .sort((a, b) => {
                const totalA = expenses.filter(t => t.category === a).reduce((s, t) => s + Math.abs(t.amount), 0);
                const totalB = expenses.filter(t => t.category === b).reduce((s, t) => s + Math.abs(t.amount), 0);
                return totalB - totalA;
            })
            .slice(0, 8);

        if (topCategories.length === 0) return { data: [], variables: [], monthLabels: [] };

        // 3. Normalize Data using INDEX-BASED keys to avoid string issues
        const sortedMonths = Object.keys(months).sort((a, b) => b.localeCompare(a)); // Recent first
        const monthToIndex = new Map(sortedMonths.map((m, i) => [m, i]));
        const indexToMonthLabel = sortedMonths.map(m => {
            const [year, month] = m.split('-');
            return `${year}/${month}`;
        });

        const chartData = sortedMonths.map(m => {
            const monthObj = months[m];
            const newObj: any = {
                id: m,
                month: monthToIndex.get(m) // Numeric value for the axis
            };

            topCategories.forEach((cat, index) => {
                const safeKey = `axis_${index}`;
                const val = monthObj[cat];
                newObj[safeKey] = (typeof val === 'number' && !isNaN(val)) ? val : 0;
            });
            return newObj;
        });

        const chartVariables: any[] = topCategories.map((cat, index) => {
            const safeKey = `axis_${index}`;
            let maxVal = 0;
            chartData.forEach((d: any) => {
                const v = d[safeKey];
                if (v > maxVal) maxVal = v;
            });
            if (maxVal === 0) maxVal = 100;

            return {
                id: safeKey,
                key: safeKey,
                value: safeKey,
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                type: 'linear' as const,
                min: 0,
                max: maxVal,
                ticksPosition: 'before' as const,
            };
        });

        // Add Month axis as linear but based on indices
        chartVariables.unshift({
            id: 'month',
            key: 'month',
            value: 'month',
            label: 'Month',
            type: 'linear' as const,
            min: 0,
            max: Math.max(1, sortedMonths.length - 1),
            ticksPosition: 'before' as const,
            tickValues: Array.from({ length: sortedMonths.length }, (_, i) => i),
            tickFormat: (idx: number) => indexToMonthLabel[idx] || '',
        });

        return { data: chartData, variables: chartVariables, monthLabels: indexToMonthLabel };
    }, [transactions]);

    const CustomTooltip = ({ datum }: any) => {
        const monthLabel = monthLabels[datum.data.month] || datum.id;
        const formatCurrency = (val: number) =>
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl min-w-[180px]">
                <div className="border-b border-slate-800 pb-2 mb-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Month</span>
                    <div className="text-blue-400 font-bold text-sm">{monthLabel}</div>
                </div>
                <div className="space-y-1.5">
                    {variables.map((v: any) => {
                        if (v.id === 'month') return null;
                        const val = datum.data[v.id];
                        return (
                            <div key={v.id} className="flex justify-between items-center gap-4">
                                <span className="text-slate-300 text-xs">{v.label}</span>
                                <span className="text-slate-100 text-xs font-mono font-medium">
                                    {formatCurrency(val)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render guard
    if (data.length === 0) {
        return (
            <div className="h-[550px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-center text-slate-500">
                <p>Not enough spending data to visualize trends.</p>
            </div>
        );
    }

    return (
        <div className="h-[550px] w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl overflow-hidden flex flex-col">
            <div className="mb-6">
                <h3 className="text-slate-100 text-xl font-bold mb-2">Monthly Spending Fingerprint</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                    Track how your spending distribution evolves.
                    <span className="text-blue-400 font-semibold ml-1">Each line is a month (e.g., 2026/12).</span>
                </p>
                <div className="flex gap-6 mt-4 items-center">
                    <div className="flex gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                            <span>Lower spending</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
                            <span>Higher spending</span>
                        </div>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-800"></div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                        Insight: Parallel lines = Consistency • Crossing lines = Changing Priorities
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                {/* @ts-ignore */}
                <ResponsiveParallelCoordinates
                    data={data}
                    variables={variables}
                    margin={{ top: 20, right: 60, bottom: 20, left: 80 }}
                    layers={['axes', 'lines']}
                    theme={{
                        axis: {
                            domain: {
                                line: { stroke: '#334155', strokeWidth: 1 }
                            },
                            ticks: {
                                line: { stroke: '#334155', strokeWidth: 1 },
                                text: { fill: '#94a3b8', fontSize: 11 }
                            },
                            // Disable default Nivo legends as we use our custom layer
                            legend: {
                                text: { display: 'none' }
                            }
                        },
                        grid: {
                            line: { stroke: '#1e293b', strokeWidth: 1 }
                        },
                        tooltip: {
                            container: {
                                background: '#0f172a',
                                color: '#f1f5f9',
                                fontSize: 12,
                                borderRadius: 8,
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                                border: '1px solid #334155'
                            }
                        }
                    }}
                    lineOpacity={0.4}
                    strokeWidth={4}
                    colors={{ scheme: 'spectral' }}
                    curve="monotoneX"
                    animate={true}
                    motionConfig="gentle"
                    tooltip={CustomTooltip}
                />

                {/* Robust Flexbox Axis Labels */}
                <div
                    className="absolute bottom-0 left-0 right-0 flex pointer-events-none"
                    style={{ paddingLeft: '80px', paddingRight: '60px' }}
                >
                    <div className="flex-1 flex justify-between items-end pb-1">
                        {variables.map((variable: any) => (
                            <div
                                key={variable.id}
                                className="w-0 flex flex-col items-center overflow-visible"
                            >
                                <span
                                    className="text-[11px] font-bold text-slate-200 whitespace-nowrap"
                                    style={{ transform: 'translateY(12px)' }}
                                >
                                    {variable.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                <p className="text-xs text-slate-500">
                    Showing top {variables.length - 1} categories across {data.length} months.
                </p>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                    Data Visualization Engine • Expenses v2
                </p>
            </div>
        </div>
    );
};
