"use strict";
// src/utils/formatters.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStatusEntry = exports.formatUrlChain = void 0;
function formatUrlChain(urlChain) {
    return urlChain.map(url => `  → ${url}`).join('\n');
}
exports.formatUrlChain = formatUrlChain;
function formatStatusEntry(url, statusChain, initialStatus, finalStatus, destinationUrl) {
    return (`Source URL: ${url}\n` +
        `Status Chain: ${statusChain.join(' → ')}\n` +
        `Initial Status: ${initialStatus}\n` +
        `Final Status: ${finalStatus}\n` +
        `Destination URL: ${destinationUrl}\n` +
        `${'-'.repeat(80)}\n`);
}
exports.formatStatusEntry = formatStatusEntry;
//# sourceMappingURL=formatters.js.map