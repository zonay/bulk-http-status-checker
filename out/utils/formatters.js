"use strict";
// src/utils/formatters.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStatusEntry = exports.formatUrlChain = void 0;
function formatUrlChain(urlChain) {
    return urlChain.map(url => `  → ${url}`).join('\n');
}
exports.formatUrlChain = formatUrlChain;
function formatStatusEntry(url, statusChain, initialStatus, finalStatus, destinationUrl) {
    const formatStatus = (status) => status.startsWith('Error') ? `❌ ${status}` : `✓ ${status}`;
    return (`Source URL: ${url}\n` +
        `Status Chain: ${statusChain.map(s => formatStatus(s)).join(' → ')}\n` +
        `Initial Status: ${formatStatus(initialStatus)}\n` +
        `Final Status: ${formatStatus(finalStatus)}\n` +
        `Destination URL: ${destinationUrl || '(none)'}\n` +
        `${'-'.repeat(80)}\n`);
}
exports.formatStatusEntry = formatStatusEntry;
//# sourceMappingURL=formatters.js.map