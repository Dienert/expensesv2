import { useState, useMemo } from 'react';
import { LayoutDashboard, Receipt, PieChart, Settings, Wallet } from 'lucide-react';
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
import { transactions as allTransactions, getMonthlyStats } from './lib/data';
import { isWithinInterval, subMonths, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    // Default to last 3 months to show meaningful trend, or all time
    return { start: subMonths(now, 3), end: now };
  });

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => isWithinInterval(t.date, { start: dateRange.start, end: dateRange.end }));
  }, [dateRange]);

  const monthlyData = useMemo(() => getMonthlyStats(filteredTransactions), [filteredTransactions]);

  // Calculate totals
  const totalIncome = filteredTransactions.filter(t => t.isIncome).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => !t.isIncome).reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const categoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return filteredTransactions.filter(t => t.category === selectedCategory);
  }, [filteredTransactions, selectedCategory]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="bg-slate-900/50 border-r border-slate-800 flex flex-col hidden md:flex overflow-hidden"
      >
        <div
          className="p-6 border-b border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          <div className="bg-brand-500/20 p-2 rounded-lg min-w-10">
            <Wallet className="text-brand-400 w-6 h-6" />
          </div>
          <motion.h1
            animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
            className="text-xl font-bold bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
          >
            FinViz
          </motion.h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'transactions', icon: Receipt, label: 'Transactions' },
            { id: 'analytics', icon: PieChart, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id
                ? 'bg-brand-500/10 text-brand-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 min-w-5" />
              <motion.span
                animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
                className="whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            </button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className={`p-8 mx-auto space-y-8 ${activeTab === 'analytics' ? 'max-w-none' : 'max-w-7xl'}`}>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wider">{activeTab}</h2>
              <p className="text-slate-400 text-sm">Welcome back! Here's your {activeTab} overview.</p>
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
                      <StatsCard title="Total Balance" value={balance} type="balance" />
                      <StatsCard title="Total Income" value={totalIncome} type="income" />
                      <StatsCard title="Total Expenses" value={totalExpense} type="expense" />
                    </div>

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
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
