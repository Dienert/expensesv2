import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Transaction } from '../../lib/types';
import { formatCurrency } from '../../lib/data';
import { useMediaQuery } from '../../lib/hooks';

interface CategoryBreakdownProps {
    transactions: Transaction[];
    onCategoryClick?: (category: string) => void;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions, onCategoryClick }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
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

    return (
        <div className={`${isMobile ? 'h-[500px]' : 'h-[400px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col overflow-hidden`}>
            <h3 className="text-slate-100 text-lg font-semibold mb-6">Expenses by Category</h3>
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
                            formatter={(value: any) => formatCurrency(value)}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Legend
                            layout={isMobile ? "horizontal" : "vertical"}
                            verticalAlign={isMobile ? "bottom" : "middle"}
                            align={isMobile ? "center" : "right"}
                            wrapperStyle={{ color: '#94a3b8', fontSize: isMobile ? '10px' : '12px', paddingTop: isMobile ? '20px' : '0' }}
                            payload={data.map((item, index) => ({
                                id: item.name,
                                type: 'circle',
                                value: item.name,
                                color: COLORS[index % COLORS.length]
                            }))}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
