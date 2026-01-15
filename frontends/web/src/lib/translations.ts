export const translations = {
    'en-US': {
        dashboard: 'Dashboard',
        transactions: 'Transactions',
        analytics: 'Analytics',
        import: 'Import',
        settings: 'Settings',
        noTransactions: 'No transactions found',
        noDataDescription: "There's no data for the selected period. You can upload an OFX file in the **Import** tab to get started.",
        goToImport: 'Go to Import',
        balance: 'Total Balance',
        income: 'Total Income',
        expenses: 'Total Expenses',
        monthlyPacing: 'Monthly Pacing',
        categoryBreakdown: 'Category Breakdown',
        spendingTrend: 'Spending Trend',
        spendingHeatmap: 'Spending Heatmap',
        spendingRadar: 'Spending Radar (Average vs Max)',
        cumulativePacing: 'Cumulative Monthly Pacing',
        monthlyFlow: 'Monthly Expense Flow (Sankey)',
        spendingParallel: 'Spending Patterns (Parallel Coordinates)',
        importOfxTitle: 'Import OFX Data',
        dropOrClickOfx: 'Click or drag OFX files here',
        supportsMultipleOfx: 'Supports multiple standard OFX files',
        selectedFiles: 'Selected Files',
        clearAll: 'Clear All',
        processFiles: 'Process {n} File{s}',
        startProcessing: 'Start Processing',
        dangerZone: 'Danger Zone',
        clearAllData: 'Clear All Data',
        clearDataWarning: 'Clear all imported OFX files and reset all processed data. This action is irreversible.',
        confirmDelete: 'Yes, Delete Everything',
        cancel: 'Cancel',
        processing: {
            uploading: 'Uploading ({n}/{total}): {name}',
            runningUpdate: 'Running update logic...',
            clearing: 'Clearing all data...',
            success: '{n} file(s) processed successfully!',
            clearedSuccess: 'All data cleared successfully.',
            cleanupComplete: 'Cleanup complete. Data reset.'
        },
        stats: {
            avgExpense: 'Avg. Monthly Expense',
            topCategory: 'Top Category',
            monthlyChange: 'Monthly Change',
            topMerchants: 'Top Merchants'
        },
        sidebar: {
            toggle: 'Toggle Sidebar'
        },
        table: {
            date: 'Date',
            description: 'Description',
            category: 'Category',
            amount: 'Amount',
            search: 'Search...'
        },
        current: 'Current',
        average: 'Average',
        pacing: {
            comparingAll: 'Comparing all history',
            comparingSelected: 'Comparing selected months',
            showTwo: 'Show Two',
            showAll: 'Show All',
            vs: 'vs',
            day: 'Day'
        },
        parallel: {
            title: 'Monthly Spending Fingerprint',
            subtitle: 'Track how your spending distribution evolves.',
            lineNote: 'Each line is a month',
            lower: 'Lower spending',
            higher: 'Higher spending',
            insight: 'Insight: Parallel lines = Consistency • Crossing lines = Changing Priorities',
            footer: 'Showing top {n} categories across {m} months.',
            month: 'Month'
        },
        sankey: {
            title: 'Money Flow (Income → Category → Merchant)',
            savings: 'Savings',
            others: 'Others'
        },
        dateRange: {
            period: 'Period',
            lastMonth: 'Last Month',
            thisMonth: 'This Month',
            thisYear: 'This Year',
            allTime: 'All Time'
        },
        categories: {
            transport: 'Transport',
            food: 'Food',
            shopping: 'Shopping',
            health: 'Health',
            entertainment: 'Entertainment',
            other: 'Other'
        },
        detail: {
            title: 'Category Detail',
            drilldown: 'Drilldown Mode',
            clear: 'Clear Selection',
            totalSpent: 'Total Spent',
            transactionsCount: '{n} transactions in this period',
            transactionsIn: 'Transactions in {category}'
        },
        settings_view: {
            title: 'Settings',
            language: 'Language',
            chooseLanguage: 'Choose your preferred language',
            en: 'English',
            pt: 'Portuguese'
        }
    },
    'pt-BR': {
        dashboard: 'Painel',
        transactions: 'Transações',
        analytics: 'Análises',
        import: 'Importar',
        settings: 'Configurações',
        noTransactions: 'Nenhuma transação encontrada',
        noDataDescription: "Não há dados para o período selecionado. Você pode enviar um arquivo OFX na aba **Importar** para começar.",
        goToImport: 'Ir para Importar',
        balance: 'Saldo Total',
        income: 'Receitas Totais',
        expenses: 'Despesas Totais',
        monthlyPacing: 'Ritmo Mensal',
        categoryBreakdown: 'Distribuição por Categoria',
        spendingTrend: 'Tendência de Gastos',
        spendingHeatmap: 'Mapa de Calor de Gastos',
        spendingRadar: 'Radar de Gastos (Média vs Máx)',
        cumulativePacing: 'Ritmo Mensal Acumulado',
        monthlyFlow: 'Fluxo Mensal de Despesas (Sankey)',
        spendingParallel: 'Padrões de Gastos (Coordenadas Paralelas)',
        importOfxTitle: 'Importar Dados OFX',
        dropOrClickOfx: 'Clique ou arraste arquivos OFX aqui',
        supportsMultipleOfx: 'Suporta múltiplos arquivos OFX padrão',
        selectedFiles: 'Arquivos Selecionados',
        clearAll: 'Limpar Tudo',
        processFiles: 'Processar {n} Arquivo{s}',
        startProcessing: 'Iniciar Processamento',
        dangerZone: 'Zona de Perigo',
        clearAllData: 'Limpar Todos os Dados',
        clearDataWarning: 'Apaga todos os arquivos OFX importados e redefine todos os dados processados. Esta ação é irreversível.',
        confirmDelete: 'Sim, Apagar Tudo',
        cancel: 'Cancelar',
        processing: {
            uploading: 'Enviando ({n}/{total}): {name}',
            runningUpdate: 'Executando lógica de atualização...',
            clearing: 'Limpando todos os dados...',
            success: '{n} arquivo(s) processado(s) com sucesso!',
            clearedSuccess: 'Todos os dados foram limpos com sucesso.',
            cleanupComplete: 'Limpeza concluída. Dados redefinidos.'
        },
        stats: {
            avgExpense: 'Média de Gastos Mensais',
            topCategory: 'Principal Categoria',
            monthlyChange: 'Variação Mensal',
            topMerchants: 'Principais Estabelecimentos'
        },
        sidebar: {
            toggle: 'Recolher/Expandir Barra Lateral'
        },
        table: {
            date: 'Data',
            description: 'Descrição',
            category: 'Categoria',
            amount: 'Valor',
            search: 'Pesquisar...'
        },
        current: 'Atual',
        average: 'Média',
        pacing: {
            comparingAll: 'Comparando todo o histórico',
            comparingSelected: 'Comparando meses selecionados',
            showTwo: 'Mostrar Dois',
            showAll: 'Mostrar Todos',
            vs: 'vs',
            day: 'Dia'
        },
        parallel: {
            title: 'Impressão Digital de Gastos Mensais',
            subtitle: 'Acompanhe como sua distribuição de gastos evolui.',
            lineNote: 'Cada linha é um mês',
            lower: 'Gastos menores',
            higher: 'Gastos maiores',
            insight: 'Dica: Linhas paralelas = Consistência • Linhas cruzadas = Mudança de Prioridades',
            footer: 'Mostrando as {n} principais categorias em {m} meses.',
            month: 'Mês'
        },
        sankey: {
            title: 'Fluxo Financeiro (Receita → Categoria → Estabelecimento)',
            savings: 'Economia',
            others: 'Outros'
        },
        dateRange: {
            period: 'Período',
            lastMonth: 'Mês Passado',
            thisMonth: 'Este Mês',
            thisYear: 'Este Ano',
            allTime: 'Todo o Período'
        },
        categories: {
            transport: 'Transporte',
            food: 'Alimentação',
            shopping: 'Compras',
            health: 'Saúde',
            entertainment: 'Lazer',
            other: 'Outros'
        },
        detail: {
            title: 'Detalhes da Categoria',
            drilldown: 'Modo Detalhado',
            clear: 'Limpar Seleção',
            totalSpent: 'Total Gasto',
            transactionsCount: '{n} transações neste período',
            transactionsIn: 'Transações em {category}'
        },
        settings_view: {
            title: 'Configurações',
            language: 'Idioma',
            chooseLanguage: 'Escolha seu idioma de preferência',
            en: 'Inglês',
            pt: 'Português'
        }
    }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations['en-US'];
