import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../../lib/types';
import { formatCurrency } from '../../lib/data';
import { isSameMonth, subMonths, getDate } from 'date-fns';

interface CumulativePacingProps {
    currentTransactions: Transaction[];
    allTransactions: Transaction[];
}

export const CumulativePacing: React.FC<CumulativePacingProps> = ({ allTransactions }) => {
    const data = useMemo(() => {
        // Determine "Current Month" based on the transactions passed (usually filtered by date range)
        // If range is large, this might be ambiguous, so let's default to "Today's Month" vs "Last Month"
        // for a pure specific insight component, regardless of global filter.

        // OR: Use the passed currentTransactions as "Series A" and find "Previous Month" automatically relative to today.
        // Let's stick to "This Month" vs "Last Month" explicitly for pacing.

        const now = new Date();
        const lastMonthDate = subMonths(now, 1);

        const thisMonthTxs = allTransactions.filter(t => isSameMonth(t.date, now) && !t.isIncome);
        const lastMonthTxs = allTransactions.filter(t => isSameMonth(t.date, lastMonthDate) && !t.isIncome);

        const days = Array.from({ length: 31 }, (_, i) => i + 1);

        let currentSum = 0;
        let lastSum = 0;

        return days.map(day => {
            // Add transactions for this day
            const todaySpent = thisMonthTxs
                .filter(t => getDate(t.date) === day)
                .reduce((acc, t) => acc + Math.abs(t.amount), 0);

            const lastMonthSpent = lastMonthTxs
                .filter(t => getDate(t.date) === day)
                .reduce((acc, t) => acc + Math.abs(t.amount), 0);

            currentSum += todaySpent;
            lastSum += lastMonthSpent;

            // Don't plot future days for current month
            const isFuture = day > getDate(now);

            return {
                day,
                'This Month': isFuture ? null : currentSum,
                'Last Month': lastSum,
            };
        });
    }, [allTransactions]);

    return (
        <div className="h-[400px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col overflow-hidden">
            <h3 className="text-slate-100 text-lg font-semibold mb-4">Monthly Pacing (Cumulative)</h3>
            <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                            axisLine={{ stroke: '#334155' }}
                            tickFormatter={(val) => `R$${val / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                            formatter={(value: any) => formatCurrency(value)}
                            itemStyle={{ color: '#e2e8f0' }}
                            labelFormatter={(label) => `Day ${label}`}
                        />
                        <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                        <Line
                            type="monotone"
                            dataKey="Last Month"
                            stroke="#94a3b8"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="This Month"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
