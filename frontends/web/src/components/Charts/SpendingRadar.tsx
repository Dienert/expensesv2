import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '../../lib/types';
import { formatCurrency } from '../../lib/data';
import { useMediaQuery } from '../../lib/hooks';

interface SpendingRadarProps {
    currentTransactions: Transaction[];
    allTransactions: Transaction[];
}

export const SpendingRadar: React.FC<SpendingRadarProps> = ({ currentTransactions, allTransactions }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const data = useMemo(() => {
        // ... previous logic remains same
        const historyExpenses = allTransactions.filter(t => !t.isIncome);
        const totalMonths = new Set(historyExpenses.map(t => t.date.toISOString().slice(0, 7))).size || 1;

        const avgByCategory: Record<string, number> = {};
        historyExpenses.forEach(t => {
            avgByCategory[t.category] = (avgByCategory[t.category] || 0) + Math.abs(t.amount);
        });

        const currentExpenses = currentTransactions.filter(t => !t.isIncome);
        const currentByCategory: Record<string, number> = {};
        currentExpenses.forEach(t => {
            currentByCategory[t.category] = (currentByCategory[t.category] || 0) + Math.abs(t.amount);
        });

        const categories = Array.from(new Set([...Object.keys(avgByCategory), ...Object.keys(currentByCategory)]));

        return categories.map(cat => ({
            subject: cat,
            Current: currentByCategory[cat] || 0,
            Average: (avgByCategory[cat] || 0) / totalMonths,
            fullMark: Math.max((currentByCategory[cat] || 0), (avgByCategory[cat] || 0) / totalMonths) * 1.2
        })).sort((a, b) => b.Current - a.Current);
    }, [currentTransactions, allTransactions]);

    return (
        <div className={`${isMobile ? 'h-[350px]' : 'h-[400px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col overflow-hidden`}>
            <h3 className="text-slate-100 text-lg font-semibold mb-4">Spending Shape</h3>
            <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                    <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "60%" : "80%"} data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                        <Radar
                            name="Current"
                            dataKey="Current"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            fill="#f43f5e"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Average"
                            dataKey="Average"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="#3b82f6"
                            fillOpacity={0.3}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                            formatter={(value: any) => formatCurrency(value)}
                            itemStyle={{ color: '#e2e8f0' }}
                            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                        />
                        <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: isMobile ? '10px' : '12px' }} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
