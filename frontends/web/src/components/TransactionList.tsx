import React, { useState } from 'react';
import type { Transaction } from '../lib/types';
// removed formatCurrency import
import { format } from 'date-fns';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
}

import { useLanguage } from '../contexts/LanguageContext';

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<keyof Transaction>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const { t, formatCurrency, dateLocale } = useLanguage();

    const handleSort = (key: keyof Transaction) => {
        // ...
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const sorted = [...transactions]
        .filter(t =>
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-slate-100 text-lg font-semibold">{t('transactions')}</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={t('table.search')}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 sticky top-0 z-10">
                        <tr>
                            <th
                                className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('table.date')}
                                    {sortKey === 'date' && (
                                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => handleSort('description')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('table.description')}
                                    {sortKey === 'description' && (
                                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => handleSort('category')}
                            >
                                <div className="flex items-center gap-1">
                                    {t('table.category')}
                                    {sortKey === 'category' && (
                                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                    )}
                                </div>
                            </th>
                            <th
                                className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right cursor-pointer hover:text-slate-300 transition-colors"
                                onClick={() => handleSort('amount')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    {t('table.amount')}
                                    {sortKey === 'amount' && (
                                        sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                    )}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {sorted.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 text-sm text-slate-400 whitespace-nowrap">{format(tx.date, 'MMM dd, yyyy', { locale: dateLocale })}</td>
                                <td className="p-4 text-sm text-slate-200 font-medium">{tx.description}</td>
                                <td className="p-4 text-sm">
                                    <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded-md text-xs border border-slate-700">
                                        {t(`categories.${tx.category.toLowerCase()}`)}
                                    </span>
                                </td>
                                <td className={`p-4 text-sm font-semibold text-right ${tx.isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                                    {formatCurrency(tx.amount).replace('-', '- ')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
