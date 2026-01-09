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
