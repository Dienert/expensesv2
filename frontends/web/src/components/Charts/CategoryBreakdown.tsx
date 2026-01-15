import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Transaction } from '../../lib/types';
// removed formatCurrency import
import { useMediaQuery } from '../../lib/hooks';
import { useLanguage } from '../../contexts/LanguageContext';

interface CategoryBreakdownProps {
    transactions: Transaction[];
    onCategoryClick?: (category: string) => void;
    title?: string;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions, onCategoryClick, title }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { t, formatCurrency } = useLanguage();
    // Aggregate expenses by category
    const data = React.useMemo(() => {
        const expenses = transactions.filter(t => !t.isIncome);
        const groups: Record<string, number> = {};
        expenses.forEach(t => {
            groups[t.category] = (groups[t.category] || 0) + Math.abs(t.amount);
        });
        return Object.entries(groups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions]);

    if (!data || data.length === 0) {
        return (
            <div className={`${isMobile ? 'h-[500px]' : 'h-[400px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-slate-500`}>
                <p>{t('noTransactions')}</p>
            </div>
        );
    }

    return (
        <div className={`${isMobile ? 'h-[500px]' : 'h-[400px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col overflow-hidden`}>
            <h3 className="text-slate-100 text-lg font-semibold mb-6">{title || t('categoryBreakdown')}</h3>
            <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            onClick={(data) => onCategoryClick && onCategoryClick(data.name)}
                            className="cursor-pointer outline-none"
                        >
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="rgba(0,0,0,0)"
                                    className="hover:opacity-80 transition-opacity outline-none"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                            formatter={(value: any, name: any) => [
                                formatCurrency(isNaN(value) ? 0 : value),
                                t(`categories.${(name || 'other').toLowerCase()}`)
                            ]}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend
                            layout={isMobile ? "horizontal" : "vertical"}
                            verticalAlign={isMobile ? "bottom" : "middle"}
                            align={isMobile ? "center" : "right"}
                            wrapperStyle={{ color: '#94a3b8', fontSize: isMobile ? '10px' : '12px', paddingTop: isMobile ? '20px' : '0' }}
                            formatter={(value) => t(`categories.${(value || 'other').toLowerCase()}`)}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
