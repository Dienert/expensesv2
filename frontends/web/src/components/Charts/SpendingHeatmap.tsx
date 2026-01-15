import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ResponsiveCalendar } from '@nivo/calendar';
import type { Transaction } from '../../lib/types';
import { format, startOfMonth, endOfMonth, differenceInWeeks, parseISO } from 'date-fns';
// removed formatCurrency import
import { useMediaQuery } from '../../lib/hooks';
import { useLanguage } from '../../contexts/LanguageContext';

interface SpendingHeatmapProps {
    transactions: Transaction[];
    onDateClick?: (date: Date) => void;
    title?: string;
}

export const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({ transactions, onDateClick, title }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { t, formatCurrency } = useLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const data = useMemo(() => {
        const expenses = transactions.filter(t => !t.isIncome);
        const daily: Record<string, number> = {};

        expenses.forEach(t => {
            const day = format(t.date, 'yyyy-MM-dd');
            daily[day] = (daily[day] || 0) + Math.abs(t.amount);
        });

        return Object.entries(daily).map(([day, value]) => ({ day, value }));
    }, [transactions]);

    // Handle early return for empty data
    if (data.length === 0) return null;

    // Determine date range for calendar to focus only on available data
    const earliestDateStr = data.reduce((a, b) => a < b.day ? a : b.day, data[0].day);
    const latestDateStr = data.reduce((a, b) => a > b.day ? a : b.day, data[data.length - 1].day);

    // Narrow to first day of earliest month and last day of latest month
    const earliestMonthStart = startOfMonth(parseISO(earliestDateStr));
    const latestMonthEnd = endOfMonth(parseISO(latestDateStr));

    const fromDate = format(earliestMonthStart, 'yyyy-MM-dd');
    const toDate = format(latestMonthEnd, 'yyyy-MM-dd');

    const maxWeeksInRange = useMemo(() => {
        // Find the maximum number of weeks in any single year row within the range
        const startYear = earliestMonthStart.getFullYear();
        const endYear = latestMonthEnd.getFullYear();
        let maxWeeks = 0;

        for (let year = startYear; year <= endYear; year++) {
            const yearStart = year === startYear ? earliestMonthStart : new Date(year, 0, 1);
            const yearEnd = year === endYear ? latestMonthEnd : new Date(year, 11, 31);
            const weeks = Math.ceil(differenceInWeeks(yearEnd, yearStart)) + 2; // +2 for safety/padding
            if (weeks > maxWeeks) maxWeeks = weeks;
        }
        return maxWeeks || 53;
    }, [earliestMonthStart, latestMonthEnd]);

    const daySize = useMemo(() => {
        if (containerWidth === 0) return 18;
        const leftMargin = isMobile ? 25 : 35;
        const availableWidth = containerWidth - leftMargin;
        // Adjust for the narrowed week count instead of a full 53 weeks
        return availableWidth / (maxWeeksInRange + 0.5);
    }, [containerWidth, maxWeeksInRange, isMobile]);

    return (
        <div className={`${isMobile ? 'min-h-[300px]' : 'min-h-[400px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300`}>
            <h3 className="text-slate-100 text-lg font-semibold mb-4">{title || t('spendingHeatmap')}</h3>
            <div ref={containerRef} className={`${isMobile ? 'h-[300px]' : 'h-[450px]'} w-full`}>
                <ResponsiveCalendar
                    data={data}
                    from={fromDate}
                    to={toDate}
                    emptyColor="#1e293b"
                    colors={['#0e4429', '#006d32', '#26a641', '#39d353']} // GitHub-like greens
                    margin={{ top: 20, right: 0, bottom: 0, left: isMobile ? 25 : 35 }}
                    yearSpacing={60}
                    // @ts-ignore - daySize type mismatch in Nivo 0.99
                    daySize={daySize}
                    monthBorderColor="#475569"
                    monthBorderWidth={2}
                    dayBorderWidth={2}
                    dayBorderColor="#0f172a"
                    theme={{
                        text: { fill: '#94a3b8' },
                        tooltip: {
                            container: {
                                background: '#0f172a',
                                color: '#f1f5f9',
                                fontSize: '12px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                border: '1px solid #334155'
                            },
                        },
                    }}
                    tooltip={(node: any) => (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
                            <strong>{node.day}:</strong> {formatCurrency(node.value)}
                        </div>
                    )}
                    onClick={(node: any) => {
                        if (onDateClick && node.data) {
                            onDateClick(parseISO(node.day));
                        }
                    }}
                />
            </div>
        </div>
    );
};
