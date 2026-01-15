import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Transaction } from '../../lib/types';
// removed formatCurrency import
import { useLanguage } from '../../contexts/LanguageContext';

interface MerchantsChartProps {
    transactions: Transaction[];
}

export const MerchantsChart: React.FC<MerchantsChartProps> = ({ transactions }) => {
    const { t, formatCurrency } = useLanguage();
    const data = React.useMemo(() => {
        const expenses = transactions.filter(t => !t.isIncome);
        const groups: Record<string, number> = {};
        expenses.forEach(t => {
            groups[t.description] = (groups[t.description] || 0) + Math.abs(t.amount);
        });
        return Object.entries(groups)
            .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, fullWith: name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [transactions]);

    return (
        <div className="h-[300px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-100 text-lg font-semibold mb-4">{t('stats.topMerchants')}</h3>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#1e293b', opacity: 0.5 }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                        formatter={(value: any) => formatCurrency(value)}
                        labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill="#38bdf8" />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
