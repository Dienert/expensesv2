import React from 'react';
import type { Transaction } from '../lib/types';
import { MerchantsChart } from './Charts/MerchantsChart';
import { TransactionList } from './TransactionList';
// removed formatCurrency import
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

import { useLanguage } from '../contexts/LanguageContext';

interface CategoryDetailProps {
    category: string;
    transactions: Transaction[];
    onClose: () => void;
}

export const CategoryDetail: React.FC<CategoryDetailProps> = ({ category, transactions, onClose }) => {
    const { t, formatCurrency } = useLanguage();
    const total = transactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const count = transactions.length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="text-brand-400 text-sm font-medium uppercase tracking-wider">{t('detail.title')}</span>
                        <span className="bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded text-xs border border-brand-500/30">{t('detail.drilldown')}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mt-1">{t(`categories.${category.toLowerCase()}`)}</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                    <X className="w-5 h-5" />
                    <span className="text-sm font-medium">{t('detail.clear')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center">
                    <p className="text-slate-400 text-sm font-medium uppercase">{t('detail.totalSpent')}</p>
                    <h3 className="text-4xl font-bold text-rose-400 mt-2">{formatCurrency(total)}</h3>
                    <p className="text-slate-500 mt-2 text-sm">{t('detail.transactionsCount', { n: count })}</p>
                </div>
                <MerchantsChart transactions={transactions} />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-100 text-lg font-semibold mb-4">{t('detail.transactionsIn', { category: t(`categories.${category.toLowerCase()}`) })}</h3>
                {/* Reusing TransactionList but we might want to ensure it takes full height/width correctly */}
                <div className="h-[500px]">
                    <TransactionList transactions={transactions} />
                </div>
            </div>
        </motion.div>
    );
};
