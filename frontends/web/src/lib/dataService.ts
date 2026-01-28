import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Device } from '@capacitor/device';
import { parseOfx } from './parser';

const EXPENSES_FILE = 'expenses.json';

export interface DataService {
    getTransactions(): Promise<any[]>;
    saveTransactions(txs: any[]): Promise<void>;
    processOfx(name: string, content: string): Promise<void>;
    clearData(): Promise<void>;
    isMobile(): Promise<boolean>;
}

class MobileDataService implements DataService {
    async getTransactions(): Promise<any[]> {
        try {
            const { value } = await Preferences.get({ key: 'transactions' });
            if (value) return JSON.parse(value);

            // Try filesystem if not in preferences
            const file = await Filesystem.readFile({
                path: EXPENSES_FILE,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            });
            return JSON.parse(file.data as string);
        } catch {
            return [];
        }
    }

    async saveTransactions(txs: any[]): Promise<void> {
        const data = JSON.stringify(txs);
        await Preferences.set({ key: 'transactions', value: data });
        await Filesystem.writeFile({
            path: EXPENSES_FILE,
            data,
            directory: Directory.Data,
            encoding: Encoding.UTF8,
        });
    }

    async processOfx(_name: string, content: string): Promise<void> {
        const newTxs = parseOfx(content);
        const current = await this.getTransactions();

        // Deduplicate
        const all = [...current, ...newTxs];
        const seen = new Set();
        const unique = all.filter(t => {
            const key = `${t.date}-${t.descricao}-${t.valor}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        unique.sort((a, b) => b.date.localeCompare(a.date));
        await this.saveTransactions(unique);
    }

    async clearData(): Promise<void> {
        await Preferences.remove({ key: 'transactions' });
        try {
            await Filesystem.deleteFile({
                path: EXPENSES_FILE,
                directory: Directory.Data
            });
        } catch { }
    }

    async isMobile(): Promise<boolean> {
        const info = await Device.getInfo();
        return info.platform !== 'web';
    }
}

class ElectronDataService implements DataService {
    async getTransactions(): Promise<any[]> {
        return window.electron.getTransactions();
    }

    async saveTransactions(): Promise<void> {
        // Electron handles its own save via processData in main
    }

    async processOfx(name: string, content: string): Promise<void> {
        // Convert string to buffer for Electron IPC
        const encoder = new TextEncoder();
        const buffer = encoder.encode(content).buffer;
        await window.electron.saveOfx(name, buffer);
        await window.electron.runUpdate();
    }

    async clearData(): Promise<void> {
        await window.electron.clearData();
    }

    async isMobile(): Promise<boolean> {
        return false;
    }
}

export const getDataService = async (): Promise<DataService> => {
    // Check if we are in Electron
    if (window.electron) {
        return new ElectronDataService();
    }
    return new MobileDataService();
};
