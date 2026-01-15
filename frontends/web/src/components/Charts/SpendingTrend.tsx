import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlyStats } from '../../lib/types';
import { formatCurrency } from '../../lib/data';
import { useMediaQuery } from '../../lib/hooks';

interface SpendingTrendProps {
    data: MonthlyStats[];
}

export const SpendingTrend: React.FC<SpendingTrendProps> = ({ data }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    return (
        <div className={`${isMobile ? 'h-[300px]' : 'h-[400px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col overflow-hidden`}>
            <h3 className="text-slate-100 text-lg font-semibold mb-6">Income vs Expenses</h3>
            <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: isMobile ? 10 : 30,
                            left: isMobile ? -20 : 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
                            axisLine={{ stroke: '#334155' }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
                            axisLine={{ stroke: '#334155' }}
                            tickFormatter={(value) => isMobile ? `${value / 1000}k` : `R$ ${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.5 }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                            formatter={(value: any) => formatCurrency(value)}
                            labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend />
                        <Bar name="Income" dataKey="totalIncome" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        <Bar name="Expense" dataKey="totalExpense" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
