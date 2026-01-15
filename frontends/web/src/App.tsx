import { useEffect, useState, useMemo, useCallback } from 'react';
import { LayoutDashboard, Receipt, PieChart, Settings, Wallet, Menu, X, CloudUpload } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { SpendingTrend } from './components/Charts/SpendingTrend';
import { CategoryBreakdown } from './components/Charts/CategoryBreakdown';
import { TransactionList } from './components/TransactionList';
import { DateRangePicker, type DateRange } from './components/DateRangePicker';
import { CategoryDetail } from './components/CategoryDetail';
import { SankeyFlow } from './components/Charts/SankeyFlow';
import { SpendingHeatmap } from './components/Charts/SpendingHeatmap';
import { SpendingRadar } from './components/Charts/SpendingRadar';
import { CumulativePacing } from './components/Charts/CumulativePacing';
import { SpendingParallel } from './components/Charts/SpendingParallel';
import { DataImport } from './components/DataImport';
import { Settings as SettingsView } from './components/Settings';
import { getMonthlyStats, parseTransactions } from './lib/data';
import type { Transaction } from './lib/types';
import { isWithinInterval, subMonths, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from './contexts/LanguageContext';

interface SidebarContentProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const SidebarContent = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
  onClose
}: SidebarContentProps) => {
  const { t } = useLanguage();
  return (
    <>
      <div
        className={`p-6 border-b border-slate-800 flex items-center gap-3 transition-colors ${!isMobile ? 'cursor-pointer hover:bg-slate-800/50' : ''}`}
        onClick={!isMobile ? onToggleCollapse : undefined}
      >
        <div className="bg-brand-500/20 p-2 rounded-lg min-w-10">
          <Wallet className="text-brand-400 w-6 h-6" />
        </div>
        <motion.h1
          animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
          className="text-xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
        >
          FinViz
        </motion.h1>
        {isMobile && (
          <button
            onClick={onClose}
            className="ml-auto p-2 text-slate-400 hover:text-slate-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
          { id: 'transactions', icon: Receipt, label: t('transactions') },
          { id: 'analytics', icon: PieChart, label: t('analytics') },
          { id: 'import', icon: CloudUpload, label: t('import') },
          { id: 'settings', icon: Settings, label: t('settings') },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (isMobile && onClose) onClose();
            }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
              ? 'bg-brand-500/10 text-brand-400'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-5 h-5 min-w-5" />
            <motion.span
              animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
              className="whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          </button>
        ))}
      </nav>
    </>
  );
};

function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const loadData = useCallback(async () => {
    try {
      if (window.electron?.getTransactions) {
        const raw = await window.electron.getTransactions();
        setAllTransactions(parseTransactions(raw));
      } else {
        // Fallback for web/dev if needed, though we primarily care about Electron build here
        setAllTransactions([]);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      // Data loaded
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    return { start: subMonths(now, 6), end: now };
  });

  // Update date range once data is loaded if it's the first time
  useEffect(() => {
    if (allTransactions.length > 0) {
      const dates = allTransactions.map(t => t.date.getTime());
      setDateRange({
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates))
      });
    }
  }, [allTransactions.length === 0]); // Only trigger when moving from 0 to some

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => isWithinInterval(t.date, { start: dateRange.start, end: dateRange.end }));
  }, [allTransactions, dateRange]);

  const monthlyData = useMemo(() => getMonthlyStats(filteredTransactions), [filteredTransactions]);

  // Calculate totals
  const totalIncome = useMemo(() => filteredTransactions.filter(t => t.isIncome).reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
  const totalExpense = useMemo(() => filteredTransactions.filter(t => !t.isIncome).reduce((acc, t) => acc + Math.abs(t.amount), 0), [filteredTransactions]);
  const balance = totalIncome - totalExpense;

  const categoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return filteredTransactions.filter(t => t.category === selectedCategory);
  }, [filteredTransactions, selectedCategory]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-6 left-6 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-100 transition-colors shadow-xl"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 flex flex-col z-50 md:hidden"
            >
              <SidebarContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={false}
                onToggleCollapse={() => { }}
                isMobile
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="bg-slate-900/50 border-r border-slate-800 flex flex-col hidden md:flex overflow-hidden"
      >
        <SidebarContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`p-4 md:p-8 mx-auto space-y-8 ${activeTab === 'analytics' ? 'max-w-none' : 'max-w-7xl'}`}>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-16 md:pt-0">
            <div>
              <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider">{t(activeTab)}</h2>
              <p className="text-slate-400 text-sm">FinViz - {t(activeTab)}</p>
            </div>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {selectedCategory ? (
                  <CategoryDetail
                    key="category-detail"
                    category={selectedCategory}
                    transactions={categoryTransactions}
                    onClose={() => setSelectedCategory(null)}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatsCard title={t('balance')} value={balance} type="balance" />
                      <StatsCard title={t('income')} value={totalIncome} type="income" />
                      <StatsCard title={t('expenses')} value={totalExpense} type="expense" />
                    </div>

                    {filteredTransactions.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2">
                            <SpendingTrend data={monthlyData} />
                          </div>
                          <div className="lg:col-span-1">
                            <CategoryBreakdown
                              transactions={filteredTransactions}
                              onCategoryClick={setSelectedCategory}
                            />
                          </div>
                        </div>

                        <div>
                          <TransactionList transactions={filteredTransactions} />
                        </div>
                      </>
                    ) : (
                      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                        <div className="inline-flex p-4 bg-slate-800 rounded-full text-slate-400">
                          <Receipt className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-semibold text-slate-100">{t('noTransactions')}</h4>
                        <p className="text-slate-400 max-w-md mx-auto">
                          {t('noDataDescription')}
                        </p>
                        <button
                          onClick={() => setActiveTab('import')}
                          className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
                        >
                          {t('goToImport')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <SankeyFlow transactions={filteredTransactions} totalIncome={totalIncome} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                  <SpendingRadar currentTransactions={filteredTransactions} allTransactions={allTransactions} />
                  <CumulativePacing currentTransactions={filteredTransactions} allTransactions={allTransactions} />
                </div>

                <div className="min-w-0">
                  <SpendingParallel transactions={filteredTransactions} />
                </div>
                <div className="min-w-0">
                  <SpendingHeatmap
                    transactions={filteredTransactions}
                    onDateClick={(date) => {
                      const isAlreadySelected = isSameDay(date, dateRange.start) && isSameDay(date, dateRange.end);
                      if (isAlreadySelected) {
                        // Reset to default (last 3 months)
                        setDateRange({ start: subMonths(new Date(), 3), end: new Date() });
                      } else {
                        setDateRange({ start: date, end: date });
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                key="transactions-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <TransactionList transactions={filteredTransactions} />
              </motion.div>
            )}

            {activeTab === 'import' && (
              <motion.div
                key="import"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <DataImport onDataUpdate={loadData} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

import { LanguageProvider } from './contexts/LanguageContext';

export default function AppWrapper() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}
