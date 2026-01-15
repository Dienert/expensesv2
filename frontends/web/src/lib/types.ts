export interface RawTransaction {
    date: string;
    descricao: string;
    valor: string; // The JSON has strings for numbers
    referencia: string;
}

export interface Transaction {
    id: string;
    date: Date;
    description: string;
    amount: number;
    referenceDate: string;
    category: string;
    isIncome: boolean;
}

export interface MonthlyStats {
    month: string; // YYYY-MM
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactions: Transaction[];
}

declare global {
    interface Window {
        electron: {
            saveOfx: (name: string, buffer: ArrayBuffer) => Promise<{ success: boolean, path?: string, error?: string }>;
            runUpdate: () => Promise<{ success: boolean, stdout?: string, stderr?: string, error?: string }>;
            getTransactions: () => Promise<any[]>;
            clearData: () => Promise<{ success: boolean, error?: string }>;
            getLocale: () => Promise<string>;
        };
    }
}
