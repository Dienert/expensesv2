import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../../lib/types';
// removed formatCurrency import
import { isSameMonth, parseISO, format, getDate, startOfMonth } from 'date-fns';
import { useMediaQuery } from '../../lib/hooks';
import { useLanguage } from '../../contexts/LanguageContext';

interface CumulativePacingProps {
    currentTransactions: Transaction[];
    allTransactions: Transaction[];
    title?: string;
}

const COLORS = [
    '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#ec4899', '#f97316', '#6366f1', '#14b8a6'
];

export const CumulativePacing: React.FC<CumulativePacingProps> = ({ allTransactions, title }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { t, formatCurrency, dateLocale, language } = useLanguage();

    // 1. Extract unique months for selection
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        allTransactions.forEach(t => {
            months.add(format(startOfMonth(t.date), 'yyyy-MM'));
        });
        return Array.from(months).sort((a, b) => b.localeCompare(a));
    }, [allTransactions]);

    // 2. State for selected months and toggle
    const [month1, setMonth1] = useState<string>(() => availableMonths[0] || format(new Date(), 'yyyy-MM'));
    const [month2, setMonth2] = useState<string>(() => availableMonths[1] || availableMonths[0] || format(new Date(), 'yyyy-MM'));
    const [showAll, setShowAll] = useState(false);
    const [hoveredLine, setHoveredLine] = useState<string | null>(null);

    const data = useMemo(() => {
        const now = new Date();
        const currentMonthKey = format(now, 'yyyy-MM');

        // Months to process based on mode
        const activeMonths = showAll ? availableMonths : [month1, month2];

        // Pre-filter transactions for relevant months
        const monthMap = new Map<string, Transaction[]>();
        activeMonths.forEach(m => {
            const date = parseISO(`${m}-01`);
            monthMap.set(m, allTransactions.filter(t => isSameMonth(t.date, date) && !t.isIncome));
        });

        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const sums = new Map<string, number>();
        activeMonths.forEach(m => sums.set(m, 0));

        return days.map(day => {
            const entry: any = { day };

            activeMonths.forEach(m => {
                const spent = monthMap.get(m)!
                    .filter(t => getDate(t.date) === day)
                    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

                const currentSum = (sums.get(m) || 0) + spent;
                sums.set(m, currentSum);

                // Truncate logic if the month is the current system month
                const isFuture = m === currentMonthKey && day > getDate(now);
                entry[m] = isFuture ? null : currentSum;
            });

            return entry;
        });
    }, [allTransactions, month1, month2, showAll, availableMonths]);

    const formatMonthLabel = (key: string) => {
        try {
            return format(parseISO(`${key}-01`), 'MMM yyyy', { locale: dateLocale });
        } catch {
            return key;
        }
    };

    // Custom Tooltip to sync hovered line state
    const CustomTooltip = ({ active, payload, label, hoveredLine }: any) => {
        if (!active || !payload || !hoveredLine) return null;

        const data = payload.find((p: any) => p.dataKey === hoveredLine);
        if (!data) return null;

        return (
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">{t('pacing.day')} {label}</p>
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: data.color || data.stroke }}
                    />
                    <span className="text-slate-200 font-medium">{formatMonthLabel(data.dataKey)}:</span>
                    <span className="text-slate-100 font-bold">{formatCurrency(data.value)}</span>
                </div>
            </div>
        );
    };

    // Calculate max value for data-to-pixel mapping approximation
    const maxValue = useMemo(() => {
        return Math.max(...data.map(d => {
            const values = Object.keys(d)
                .filter(k => k !== 'day')
                .map(k => d[k] || 0);
            return Math.max(...values, 0);
        }), 1000);
    }, [data]);

    return (
        <div className="h-[400px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-slate-100 text-lg font-semibold">{title || t('cumulativePacing')}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                        {showAll ? t('pacing.comparingAll') : t('pacing.comparingSelected')}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${showAll
                            ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                            }`}
                    >
                        {showAll ? t('pacing.showTwo') : t('pacing.showAll')}
                    </button>

                    {!showAll && (
                        <div className="flex items-center gap-2">
                            <select
                                value={month1}
                                onChange={(e) => setMonth1(e.target.value)}
                                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            >
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{formatMonthLabel(m)}</option>
                                ))}
                            </select>
                            <span className="text-slate-500 text-xs font-bold">{t('pacing.vs')}</span>
                            <select
                                value={month2}
                                onChange={(e) => setMonth2(e.target.value)}
                                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            >
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>{formatMonthLabel(m)}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={1}>
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: isMobile ? 10 : 30, left: isMobile ? -20 : 20, bottom: 5 }}
                        onMouseMove={(e: any) => {
                            if (e.activePayload && e.activePayload.length > 0 && e.chartY !== undefined) {
                                // Approximate mapping: chartY to value
                                // Parent container is 400px, title/padding ~80px, chart ~300px
                                const chartHeight = 300;
                                const relativeY = (1 - (e.chartY - 5) / chartHeight);
                                const targetValue = relativeY * maxValue;

                                let closest = null;
                                let minDiff = Infinity;

                                e.activePayload.forEach((p: any) => {
                                    const diff = Math.abs(p.value - targetValue);
                                    if (diff < minDiff) {
                                        minDiff = diff;
                                        closest = p.dataKey;
                                    }
                                });
                                if (closest) setHoveredLine(closest as string);
                            }
                        }}
                        onMouseLeave={() => setHoveredLine(null)}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }} axisLine={{ stroke: '#334155' }} />
                        <YAxis
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 12 }}
                            axisLine={{ stroke: '#334155' }}
                            tickFormatter={(val) => isMobile ? `${(val / 1000).toFixed(0)}k` : `${language === 'pt-BR' ? 'R$' : '$'}${(val / 1000).toFixed(1)}k`}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            content={<CustomTooltip hoveredLine={hoveredLine} />}
                            cursor={false}
                            shared={true}
                        />
                        <Legend
                            wrapperStyle={{ color: '#e2e8f0', paddingTop: isMobile ? '10px' : '20px', fontSize: isMobile ? '10px' : '12px' }}
                            formatter={(value) => formatMonthLabel(value)}
                            onMouseEnter={(o: any) => setHoveredLine(o.value ?? null)}
                            onMouseLeave={() => setHoveredLine(null)}
                        />

                        {showAll ? (
                            availableMonths.map((month, index) => {
                                const isFocused = hoveredLine === month;
                                const isOthersFocused = hoveredLine !== null && !isFocused;

                                const baseWidth = month === availableMonths[0] ? 3 : 1;
                                const baseOpacity = month === availableMonths[0] ? 1 : 0.4;

                                return (
                                    <Line
                                        key={month}
                                        type="monotone"
                                        dataKey={month}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={isFocused ? baseWidth + 1 : baseWidth}
                                        dot={false}
                                        activeDot={hoveredLine === month}
                                        strokeOpacity={isFocused ? 1 : isOthersFocused ? 0.05 : baseOpacity}
                                    />
                                );
                            })
                        ) : (
                            <>
                                <Line
                                    key={month2}
                                    type="monotone"
                                    dataKey={month2}
                                    stroke="#94a3b8"
                                    strokeDasharray="5 5"
                                    strokeWidth={hoveredLine === month2 ? 3 : 2}
                                    dot={false}
                                    activeDot={hoveredLine === month2}
                                    strokeOpacity={hoveredLine === month2 ? 1 : hoveredLine === null ? 1 : 0.1}
                                />
                                <Line
                                    key={month1}
                                    type="monotone"
                                    dataKey={month1}
                                    stroke="#f43f5e"
                                    strokeWidth={hoveredLine === month1 ? 4 : 3}
                                    dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
                                    activeDot={hoveredLine === month1 ? { r: 6 } : false}
                                    strokeOpacity={hoveredLine === month1 ? 1 : hoveredLine === null ? 1 : 0.1}
                                />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
