export function parseOfx(content: string) {
    const transactions: any[] = [];

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
