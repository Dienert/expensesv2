import React, { useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';
import type { Transaction } from '../../lib/types';
import { formatCurrency } from '../../lib/data';

interface SankeyFlowProps {
    transactions: Transaction[];
    totalIncome: number;
}

export const SankeyFlow: React.FC<SankeyFlowProps> = ({ transactions, totalIncome }) => {
    const data = useMemo(() => {
        // 1. Calculate Nodes & Links
        // Structure: Income -> Category -> Top Merchants (limit 3 per category to keep it clean)

        const nodes: { id: string, nodeColor?: string }[] = [{ id: 'Total Income', nodeColor: '#10b981' }];
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
            .sort((a, b) => b[1].total - a[1].total) // Explicitly sort categoryMap entries by total descending
            .forEach(([cat, { total, merchants }]) => {
                nodes.push({ id: cat, nodeColor: '#3b82f6' });
                links.push({ source: 'Total Income', target: cat, value: total });

                // Build Links: Category -> Top 3 Merchants
                const topMerchants = Object.entries(merchants)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3);

                let topMerchantsTotal = 0;

                topMerchants.forEach(([merch, val]) => {
                    topMerchantsTotal += val;
                    // Ensure unique merchant IDs if same name exists across categories (unlikely but safe)
                    const merchId = `${merch} `;
                    // Check if node exists to avoid duplicates
                    if (!nodes.find(n => n.id === merchId)) {
                        nodes.push({ id: merchId, nodeColor: '#f43f5e' });
                    }
                    links.push({ source: cat, target: merchId, value: val });
                });

                // Add "Others" to balance flow
                const othersVal = total - topMerchantsTotal;
                if (othersVal > 0) {
                    // Use a concise label that indicates category
                    const otherId = `Others (${cat})`;
                    if (!nodes.find(n => n.id === otherId)) {
                        nodes.push({ id: otherId, nodeColor: '#64748b' });
                    }
                    links.push({ source: cat, target: otherId, value: othersVal });
                }
            });

        // If Total Income > Total Expenses, show Savings?
        const totalExpenses = expenses.reduce((acc, t) => acc + Math.abs(t.amount), 0);
        const savings = totalIncome - totalExpenses;
        if (savings > 0) {
            nodes.push({ id: 'Savings', nodeColor: '#10b981' });
            links.push({ source: 'Total Income', target: 'Savings', value: savings });
        }

        return { nodes, links };
    }, [transactions, totalIncome]);

    // Define tooltip component separately to satisfy types or use any cast if needed for Nivo strict types
    const CustomTooltip = (node: any) => (
        <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
            <strong>{node.id}:</strong> {formatCurrency(node.value)}
        </div>
    );

    return (
        <div className="h-[600px] w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-100 text-lg font-semibold mb-4">Money Flow (Income → Category → Merchant)</h3>
            <div className="h-[500px]">
                <ResponsiveSankey
                    data={data}
                    margin={{ top: 20, right: 200, bottom: 20, left: 100 }}
                    align="justify"
                    colors={(node: any) => node.nodeColor || '#6366f1'}
                    nodeOpacity={1}
                    nodeHoverOthersOpacity={0.35}
                    nodeThickness={18}
                    nodeSpacing={12}
                    nodeBorderWidth={0}
                    nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
                    linkOpacity={0.5}
                    linkHoverOthersOpacity={0.1}
                    linkContract={0}
                    enableLinkGradient={true}
                    labelPosition="outside"
                    labelOrientation="horizontal"
                    labelPadding={16}
                    labelTextColor="#e2e8f0"
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
                    // @ts-ignore - Nivo generic types can be tricky
                    tooltip={CustomTooltip}
                />
            </div>
        </div>
    );
};
