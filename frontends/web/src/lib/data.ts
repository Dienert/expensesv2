import rawData from '../data/expenses.json';
import type { RawTransaction, Transaction, MonthlyStats } from './types';
import { parseISO, format, startOfMonth } from 'date-fns';

/**
 * AI-Enhanced Category Inference
 * This logic was optimized by Gemini to handle a wide range of Brazilian merchants,
 * digital services, and common transaction patterns with high accuracy.
 */
const INFER_CATEGORY = (desc: string): string => {
    const d = desc.toLowerCase();

    // 1. TRANSPORT & TRAVEL (Uber, Airlines, Car Rentals, Gas, Insurance)
    if (/\b(uber|99app|movida|localiza|rentcars|gol|azul|latam|smiles|fidel|seguros|shell|ipiranga|posto|combustivel|estacionamento|parking|rodoviaria|vlt|metro)\b/i.test(d)) return 'Transport';
    if (d.includes('airbnb') || d.includes('booking') || d.includes('hoteis') || d.includes('hotel')) return 'Transport';

    // 2. FOOD & DINING (Restaurants, Delivery, Supermarkets, Bakeries, Bars)
    if (/\b(ifood|rappi|mcdonald|mc\s?don|burger|bk|habib|pizza|veneza|restaurante|pizzaria|bar|pub|padaria|panificadora|confeitaria|lanchonete|cafe|cafeteria|starbucks|pamonha|coco\s?bambu|divino\s?fogao|ciaburger|ice\s?cream|eskimo)\b/i.test(d)) return 'Food';
    if (/\b(supermercado|mercado|atacadao|assai|carrefour|pao\s?de\s?acucar|extra|alimentos|hortifruti|varejao|sacolao|padre\s?cic|mercearia|armazem|carne|acougue|peixaria|adega|conveniencia|brisas|lago)\b/i.test(d)) return 'Food';

    // 3. SHOPPING & RETAIL (Electronics, Clothing, Home, E-commerce)
    if (/\b(amazon|shopee|mercadolivre|melicidade|shein|aliexpress|magalu|magazine|casas\s?bahia|pontofrio|americanas|zattini|netshoes|arezzo|ri\s?happy|pbkids|pimpolho|loja|vestuario|calcados|moda|hering|renner|riachuelo|cea|zara|dafiti|shopp|multicoisa|kalunga|olx|nupay)\b/i.test(d)) return 'Shopping';

    // 4. HEALTH & BEAUTY (Pharmacies, Hospitals, Clinics, Cosmetics, Wellness)
    if (/\b(drogaria|farmacia|drogasil|pague\s?menos|saopaulo|st\s?paulo|rosario|lider|camila|francy|ocidental|unimed|hospital|clinica|odonto|exame|laboratorio|beauty|salao|barbearia|estetica|perfumaria|cosmetico|o\s?boticario|natura|cpaps)\b/i.test(d)) return 'Health';

    // 5. ENTERTAINMENT & DIGITAL SERVICES (Streaming, Subscriptions, Gaming, Hobbies)
    if (/\b(netflix|spotify|youtube|google\s?one|google\s?cloud|cloud|prime\s?video|disney|hbo|paramount|apple|itunes|kindle|audible|steam|epic\s?games|playstation|xbox|nintendo|linkedin|scribd|folha|globo|estadao|abril|editora|proweb|convertemos|cursor|openai|chatgpt|anthropic|midjourney)\b/i.test(d)) return 'Entertainment';

    // Special cases and fallbacks
    if (d.includes('ajuste') || d.includes('pagamento') || d.includes('transferencia') || d.includes('iof')) return 'Other';
    if (d.includes('caffeine') || d.includes('jim.com') || d.includes('mariadasgracas') || d.includes('leticiakelly') || d.includes('joaobaptista') || d.includes('josuelantonio')) return 'Food';

    return 'Other';
};

export const transactions: Transaction[] = (rawData as RawTransaction[]).map((t, index) => {
    const amount = parseFloat(t.valor);
    return {
        id: `${t.date}-${index}`,
        date: parseISO(t.date),
        description: t.descricao,
        amount: amount,
        referenceDate: t.referencia,
        category: INFER_CATEGORY(t.descricao),
        isIncome: amount > 0,
    };
});

export const getMonthlyStats = (txs: Transaction[] = transactions): MonthlyStats[] => {
    const groups: Record<string, MonthlyStats> = {};

    txs.forEach(t => {
        const monthKey = format(startOfMonth(t.date), 'yyyy-MM');
        if (!groups[monthKey]) {
            groups[monthKey] = {
                month: monthKey,
                totalIncome: 0,
                totalExpense: 0,
                balance: 0,
                transactions: []
            };
        }

        const g = groups[monthKey];
        g.transactions.push(t);
        if (t.isIncome) {
            g.totalIncome += t.amount;
        } else {
            g.totalExpense += Math.abs(t.amount);
        }
        g.balance += t.amount;
    });

    return Object.values(groups).sort((a, b) => a.month.localeCompare(b.month));
};

export const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
