// src/utils/formatters.ts

export function formatUrlChain(urlChain: string[]): string {
    return urlChain.map(url => `  → ${url}`).join('\n');
}

export function formatStatusEntry(url: string, statusChain: string[], initialStatus: string, finalStatus: string, destinationUrl: string): string {
    const formatStatus = (status: string) => status.startsWith('Error') ? `❌ ${status}` : `✓ ${status}`;
    
    return (
        `Source URL: ${url}\n` +
        `Status Chain: ${statusChain.map(s => formatStatus(s)).join(' → ')}\n` +
        `Initial Status: ${formatStatus(initialStatus)}\n` +
        `Final Status: ${formatStatus(finalStatus)}\n` +
        `Destination URL: ${destinationUrl || '(none)'}\n` +
        `${'-'.repeat(80)}\n`
    );
}