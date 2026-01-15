const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const isDev = !app.isPackaged;

function createWindow() {
    // ... same as before
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#0f172a', // Match app background
        title: 'FinViz Desktop',
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

// Utility to get platform-persistent data path
const getDataPath = (filename) => {
    const userDataPath = app.getPath('userData');
    const targetPath = path.join(userDataPath, 'data', filename);
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return targetPath;
};

// OFX Parsing Logic
function parseOfx(content) {
    const transactions = [];

    // Extract reference date (DTASOF)
    const dtasofMatch = content.match(/<DTASOF>(\d{8})/i);
    const reference = dtasofMatch ? `${dtasofMatch[1].slice(0, 4)}-${dtasofMatch[1].slice(4, 6)}-${dtasofMatch[1].slice(6, 8)}` : null;

    // Extract transaction blocks (STMTTRN)
    const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;

    while ((match = trnRegex.exec(content)) !== null) {
        const block = match[1];

        const dtposted = (block.match(/<DTPOSTED>(\d{8})/i) || [])[1];
        const memoMatch = block.match(/<MEMO>([^<]+)/i);
        const memo = memoMatch ? memoMatch[1].trim() : 'Unknown';

        const trnamtMatch = block.match(/<TRNAMT>([^<]+)/i);
        const trnamt = trnamtMatch ? trnamtMatch[1].trim().replace(',', '.') : null;

        const currateMatch = block.match(/<CURRATE>([^<]+)/i);
        const currate = currateMatch ? currateMatch[1].trim().replace(',', '.') : null;

        if (dtposted && trnamt) {
            const date = `${dtposted.slice(0, 4)}-${dtposted.slice(4, 6)}-${dtposted.slice(6, 8)}`;

            try {
                const rawAmount = parseFloat(trnamt);
                const rate = currate ? parseFloat(currate) : 1;

                if (!isNaN(rawAmount) && !isNaN(rate)) {
                    const valor = parseFloat((rawAmount * rate).toFixed(2));

                    transactions.push({
                        date,
                        descricao: memo,
                        valor: valor.toString(),
                        referencia: reference
                    });
                }
            } catch (e) {
                console.warn(`Failed to parse transaction: ${trnamt}`, e);
            }
        }
    }
    return transactions;
}

async function processData() {
    const cartaoDir = getDataPath('cartao');
    const expensesPath = getDataPath('expenses.json');

    if (!fs.existsSync(cartaoDir)) {
        return { success: true, count: 0 };
    }

    const files = fs.readdirSync(cartaoDir).filter(f => f.toLowerCase().endsWith('.ofx'));
    let allTransactions = [];

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(cartaoDir, file), 'utf8');
            const txs = parseOfx(content);
            allTransactions = allTransactions.concat(txs);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }

    // Deduplicate by date + description + value
    const seen = new Set();
    const uniqueTransactions = allTransactions.filter(t => {
        const key = `${t.date}-${t.descricao}-${t.valor}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    uniqueTransactions.sort((a, b) => b.date.localeCompare(a.date));

    const jsonData = JSON.stringify(uniqueTransactions, null, 4);
    fs.writeFileSync(expensesPath, jsonData);

    return { success: true, count: uniqueTransactions.length };
}

// IPC Handlers
ipcMain.handle('save-ofx', async (event, { name, buffer }) => {
    try {
        const targetPath = getDataPath(path.join('cartao', name));
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        return { success: true, path: targetPath };
    } catch (error) {
        console.error('Error saving OFX:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('run-update-script', async () => {
    try {
        const res = await processData();
        return {
            success: true,
            stdout: `Processed ${res.count} transactions successfully to ${getDataPath('expenses.json')}`
        };
    } catch (error) {
        console.error('Error processing data:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-transactions', async () => {
    try {
        const expensesPath = getDataPath('expenses.json');
        if (fs.existsSync(expensesPath)) {
            const data = fs.readFileSync(expensesPath, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
});

ipcMain.handle('clear-data', async () => {
    try {
        const expensesPath = getDataPath('expenses.json');
        if (fs.existsSync(expensesPath)) {
            fs.writeFileSync(expensesPath, '[]');
        }

        const cartaoDir = getDataPath('cartao');
        if (fs.existsSync(cartaoDir)) {
            const files = fs.readdirSync(cartaoDir);
            for (const file of files) {
                fs.unlinkSync(path.join(cartaoDir, file));
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error clearing data:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-locale', () => app.getLocale());

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
