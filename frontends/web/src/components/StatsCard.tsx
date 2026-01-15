import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsCardProps {
    title: string;
    value: number;
    type: 'income' | 'expense' | 'balance';
    change?: number; // percentage change vs last month
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, type }) => {
    const { formatCurrency } = useLanguage();
    const colorClass = type === 'income' ? 'text-emerald-400' : type === 'expense' ? 'text-rose-400' : 'text-blue-400';
    const bgClass = type === 'income' ? 'bg-emerald-400/10' : type === 'expense' ? 'bg-rose-400/10' : 'bg-blue-400/10';
    const icon = type === 'income' ? <ArrowUpRight /> : type === 'expense' ? <ArrowDownRight /> : <DollarSign />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-colors"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <h3 className={`text-2xl font-bold mt-2 ${colorClass}`}>{formatCurrency(Math.abs(value))}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
                    {icon}
                </div>
            </div>
        </motion.div>
    );
};
