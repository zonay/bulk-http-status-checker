"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHtmlReport = void 0;
function generateHtmlReport(results) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: {
                                sans: ['Inter', 'sans-serif'],
                            },
                        }
                    }
                }
            </script>
            <style>
                * { font-family: 'Inter', sans-serif; }
                .glass-effect {
                    background: rgba(17, 24, 39, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .url-text {
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                }
                .url-link {
                    color: inherit;
                    text-decoration: none;
                }
                .url-link:hover {
                    color: #60A5FA;
                }
                .table-row {
                    background: transparent;
                }
                .table-row:hover {
                    background: rgba(31, 41, 55, 0.5);
                }
            </style>
        </head>
        <body class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8 min-h-screen">
            <div class="max-w-[95%] mx-auto">
                <div class="flex items-center justify-between mb-8">
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
                        Bulk HTTP Status Check Report
                    </h1>
                    <div class="flex items-center gap-4">
                        <button id="jsonBtn" class="exportBtn px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors" onclick="exportReport('json')">
                            Copy JSON
                        </button>
                        <button id="csvBtn" class="exportBtn px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-colors" onclick="exportReport('csv')">
                            Export CSV
                        </button>
                        <div class="text-sm text-gray-400">
                            ${results.length} URLs checked • ${new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
                
                <div class="glass-effect rounded-xl border border-gray-700/50 shadow-2xl">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-gray-700/50">
                                    <th class="p-4 text-left font-medium w-16 text-gray-400">#</th>
                                    <th class="p-4 text-left font-medium text-gray-400">Source URL</th>
                                    <th class="p-4 text-left font-medium text-gray-400 min-w-[400px]">Redirect Chain</th>
                                    <th class="p-4 text-left font-medium text-gray-400">Final Result</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-700/50">
                                ${results.map((result, index) => `
                                    <tr class="table-row">
                                        <td class="p-4 text-xs">
                                            <div class="flex items-center justify-center h-6 w-6 rounded-lg bg-gray-700/50 text-gray-300 font-medium">
                                                ${index + 1}
                                            </div>
                                        </td>
                                        <td class="p-4 whitespace-normal break-all text-xs">
                                            <a href="${escapeHtml(result.url)}" class="url-link url-text" target="_blank" rel="noopener noreferrer">
                                                ${escapeHtml(result.url)}
                                            </a>
                                        </td>
                                        <td class="p-4 whitespace-normal text-xs">${formatChainedStatus(result.urlChain, result.statusChain)}</td>
                                        <td class="p-4 whitespace-normal text-xs">
                                            <div class="flex flex-col gap-2">
                                                ${formatStatus(result.finalStatus)}
                                                ${result.destinationUrl !== result.url ? `
                                                    <span class="text-gray-400 break-all">
                                                        → <a href="${escapeHtml(result.destinationUrl || '')}" class="url-link url-text" target="_blank" rel="noopener noreferrer">
                                                            ${escapeHtml(result.destinationUrl || '(none)')}
                                                        </a>
                                                    </span>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const jsonBtn = document.getElementById('jsonBtn');
                const csvBtn = document.getElementById('csvBtn');
                let exportInProgress = false;

                async function exportReport(type) {
                    if (exportInProgress) return;
                    
                    exportInProgress = true;
                    jsonBtn.disabled = true;
                    csvBtn.disabled = true;
                    
                    const activeBtn = type === 'json' ? jsonBtn : csvBtn;
                    const originalText = activeBtn.textContent;
                    activeBtn.textContent = type === 'json' ? 'Copying...' : 'Exporting...';
                    
                    try {
                        await vscode.postMessage({
                            command: 'export',
                            type: type
                        });
                    } finally {
                        setTimeout(() => {
                            activeBtn.textContent = originalText;
                            jsonBtn.disabled = false;
                            csvBtn.disabled = false;
                            exportInProgress = false;
                        }, 1000);
                    }
                }
            </script>
        </body>
        </html>
    `;
}
exports.generateHtmlReport = generateHtmlReport;
function formatStatus(status) {
    const isError = status.toLowerCase().includes('error');
    const icon = isError ? '❌' : '✓';
    const baseClass = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium";
    const colorClass = isError
        ? "bg-red-400/10 text-red-400"
        : "bg-green-400/10 text-green-400";
    return `<span class="${baseClass} ${colorClass}">${icon} ${escapeHtml(status)}</span>`;
}
function formatChainedStatus(urls, statuses) {
    if (urls.length === 0)
        return '(none)';
    return `<ul class="space-y-3">
        ${urls.map((url, index) => `
            <li class="group flex flex-col gap-1.5 rounded-lg transition-all duration-200">
                <div class="flex items-center gap-2">
                    <div class="flex items-center justify-center h-5 w-5 rounded-lg bg-gray-700/50 text-gray-300 font-medium text-[10px] group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                        ${index + 1}
                    </div>
                    <a href="${escapeHtml(url)}" class="url-link url-text text-gray-400 group-hover:text-gray-200 transition-colors" target="_blank" rel="noopener noreferrer">
                        ${escapeHtml(url)}
                    </a>
                </div>
                ${statuses[index] ? `
                    <div class="ml-7 pl-4 border-l-2 border-gray-700/30 group-hover:border-blue-500/30 transition-colors">
                        ${formatStatus(statuses[index])}
                    </div>
                ` : ''}
            </li>
        `).join('')}
    </ul>`;
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function formatUrlChain(chain) {
    if (chain.length === 0)
        return '(none)';
    return `<ul class="space-y-2 text-xs">
        ${chain.map((url, index) => `
            <li class="pl-4 border-l-2 border-gray-700 hover:border-blue-500 transition-colors flex items-center gap-2">
                <span class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-gray-700 text-gray-300 font-medium text-[10px]">
                    ${index + 1}
                </span>
                ${escapeHtml(url)}
            </li>
        `).join('')}
    </ul>`;
}
//# sourceMappingURL=htmlGenerator.js.map