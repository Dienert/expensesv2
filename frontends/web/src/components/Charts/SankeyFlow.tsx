import React, { useMemo } from 'react';
// @ts-ignore
import { ResponsiveSankey } from '@nivo/sankey';
import type { Transaction } from '../../lib/types';
// removed formatCurrency import
import { useMediaQuery } from '../../lib/hooks';
import { useLanguage } from '../../contexts/LanguageContext';

interface SankeyFlowProps {
    transactions: Transaction[];
    totalIncome: number;
    title?: string;
}

export const SankeyFlow: React.FC<SankeyFlowProps> = ({ transactions, totalIncome, title }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { t, formatCurrency } = useLanguage();

    const data = useMemo(() => {
        const incomeNodeId = 'IncomeNode';
        const nodes: { id: string, label: string, nodeColor?: string }[] = [{
            id: incomeNodeId,
            label: t('income'),
            nodeColor: '#10b981'
        }];
        const links: { source: string, target: string, value: number }[] = [];

        // Filter expenses
        const expenses = transactions.filter(t => !t.isIncome);

        // Aggregate by Category
        const categoryMap: Record<string, { total: number, merchants: Record<string, number> }> = {};

        expenses.forEach(t => {
            if (!categoryMap[t.category]) {
                categoryMap[t.category] = { total: 0, merchants: {} };
            }
            categoryMap[t.category].total += Math.abs(t.amount);
            const merch = t.description;
            categoryMap[t.category].merchants[merch] = (categoryMap[t.category].merchants[merch] || 0) + Math.abs(t.amount);
        });

        // Build Links: Income -> Category
        Object.entries(categoryMap)
            .sort((a, b) => b[1].total - a[1].total)
            .forEach(([cat, { total, merchants }]) => {
                const translatedCat = t(`categories.${cat.toLowerCase()}`);
                const catLabel = isMobile ? translatedCat.slice(0, 8) + (translatedCat.length > 8 ? '..' : '') : translatedCat;
                nodes.push({ id: cat, label: catLabel, nodeColor: '#3b82f6' });
                links.push({ source: incomeNodeId, target: cat, value: total });

                const topMerchants = Object.entries(merchants)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, isMobile ? 2 : 3); // Show fewer merchants on mobile

                let topMerchantsTotal = 0;

                topMerchants.forEach(([merch, val]) => {
                    topMerchantsTotal += val;
                    const merchId = `${merch} `;
                    const merchLabel = isMobile ? merch.slice(0, 10) + (merch.length > 10 ? '..' : '') : merch;
                    if (!nodes.find(n => n.id === merchId)) {
                        nodes.push({ id: merchId, label: merchLabel, nodeColor: '#f43f5e' });
                    }
                    links.push({ source: cat, target: merchId, value: val });
                });

                const othersVal = total - topMerchantsTotal;
                if (othersVal > 0) {
                    const otherId = `${t('sankey.others')} (${cat})`;
                    const otherLabel = t('sankey.others');
                    if (!nodes.find(n => n.id === otherId)) {
                        nodes.push({ id: otherId, label: otherLabel, nodeColor: '#64748b' });
                    }
                    links.push({ source: cat, target: otherId, value: othersVal });
                }
            });

        // Savings
        const totalExpenses = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
        const savings = totalIncome - totalExpenses;
        if (savings > 0) {
            nodes.push({ id: 'SavingsNode', label: t('sankey.savings'), nodeColor: '#10b981' });
            links.push({ source: incomeNodeId, target: 'SavingsNode', value: savings });
        }

        return { nodes, links };
    }, [transactions, totalIncome, isMobile, t]);

    const CustomTooltip = (node: any) => (
        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
            <strong>{node.label || node.id}:</strong> {formatCurrency(node.value)}
        </div>
    );

    if (!data.links || data.links.length === 0) {
        return (
            <div className={`${isMobile ? 'h-[500px]' : 'h-[600px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-center text-slate-500`}>
                <p>{t('noTransactions')}</p>
            </div>
        );
    }

    return (
        <div className={`${isMobile ? 'h-[500px]' : 'h-[600px]'} w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl`}>
            <h3 className="text-slate-100 text-lg font-semibold mb-4">{title || t('sankey.title')}</h3>
            <div className={isMobile ? 'h-[400px]' : 'h-[500px]'}>
                {/* @ts-ignore */}
                <ResponsiveSankey
                    data={data}
                    label="label"
                    margin={isMobile
                        ? { top: 20, right: 50, bottom: 20, left: 40 }
                        : { top: 20, right: 200, bottom: 20, left: 100 }
                    }
                    align="justify"
                    colors={(node: any) => node.nodeColor || '#6366f1'}
                    nodeOpacity={1}
                    nodeHoverOthersOpacity={0.35}
                    nodeThickness={isMobile ? 24 : 18}
                    nodeSpacing={isMobile ? 12 : 12}
                    nodeBorderWidth={0}
                    nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
                    linkOpacity={0.5}
                    linkHoverOthersOpacity={0.1}
                    linkContract={0}
                    enableLinkGradient={!isMobile}
                    labelPosition="outside"
                    labelOrientation="horizontal"
                    labelPadding={isMobile ? 6 : 16}
                    labelTextColor={isMobile ? "#ffffff" : "#e2e8f0"}
                    theme={{
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
                        text: {
                            fontSize: 11,
                            fontWeight: 500,
                        }
                    }}
                    // @ts-ignore - tooltip type mismatch in Nivo 0.99
                    tooltip={CustomTooltip}
                />
            </div>
        </div>
    );
};
