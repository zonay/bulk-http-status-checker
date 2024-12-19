"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToCsv = exports.copyToJson = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function copyToJson(results) {
    const jsonContent = JSON.stringify(results, null, 2);
    await vscode.env.clipboard.writeText(jsonContent);
    vscode.window.showInformationMessage('JSON copied to clipboard');
}
exports.copyToJson = copyToJson;
async function exportToCsv(results) {
    try {
        const headers = ['Source URL', 'Status Chain', 'URL Chain', 'Final Status', 'Destination URL'];
        const rows = results.map(result => [
            result.url,
            result.statusChain.join(' → '),
            result.urlChain.join(' → '),
            result.finalStatus,
            result.destinationUrl || ''
        ].map(field => `"${String(field).replace(/"/g, '""')}"`));
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
        const defaultUri = vscode.Uri.file(path.join((vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd()), `url-status-report-${timestamp}.csv`));
        const uri = await vscode.window.showSaveDialog({
            defaultUri,
            filters: { 'CSV Files': ['csv'] },
            title: 'Save URL Status Report'
        });
        if (uri) {
            fs.writeFileSync(uri.fsPath, csvContent);
            vscode.window.showInformationMessage(`Report saved to: ${uri.fsPath}`);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Failed to export CSV: ${message}`);
        throw error;
    }
}
exports.exportToCsv = exportToCsv;
//# sourceMappingURL=exportUtils.js.map