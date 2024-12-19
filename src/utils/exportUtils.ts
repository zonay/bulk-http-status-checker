import { StatusCheckResult } from '../statusChecker';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function copyToJson(results: StatusCheckResult[]): Promise<void> {
    const jsonContent = JSON.stringify(results, null, 2);
    await vscode.env.clipboard.writeText(jsonContent);
    vscode.window.showInformationMessage('JSON copied to clipboard');
}

export async function exportToCsv(results: StatusCheckResult[]): Promise<void> {
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
        const defaultUri = vscode.Uri.file(path.join(
            (vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd()),
            `url-status-report-${timestamp}.csv`
        ));

        const uri = await vscode.window.showSaveDialog({
            defaultUri,
            filters: { 'CSV Files': ['csv'] },
            title: 'Save URL Status Report'
        });

        if (uri) {
            fs.writeFileSync(uri.fsPath, csvContent);
            vscode.window.showInformationMessage(`Report saved to: ${uri.fsPath}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        vscode.window.showErrorMessage(`Failed to export CSV: ${message}`);
        throw error;
    }
}
