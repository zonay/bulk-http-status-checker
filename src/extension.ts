import * as vscode from 'vscode';
import { getStatusChain, StatusCheckResult } from './statusChecker';
import { generateHtmlReport } from './utils/htmlGenerator';
import { UrlTreeDataProvider } from './urlTreeDataProvider';
import { copyToJson, exportToCsv } from './utils/exportUtils';

export function activate(context: vscode.ExtensionContext) {
    const urlProvider = new UrlTreeDataProvider();
    const treeView = vscode.window.createTreeView('urlStatusCheckerView', {
        treeDataProvider: urlProvider,
        showCollapseAll: true
    });

    // Update Add URL command to handle clipboard input
    context.subscriptions.push(
        vscode.commands.registerCommand('urlStatusChecker.addUrl', async () => {
            try {
                const clipboardText = await vscode.env.clipboard.readText();
                const hasUrls = clipboardText.includes('http://') || clipboardText.includes('https://');
                
                const input = await vscode.window.showQuickPick(['Paste URLs from clipboard', 'Enter single URL'], {
                    placeHolder: hasUrls ? 'URLs detected in clipboard' : 'Choose input method'
                });

                if (!input) return;

                if (input === 'Paste URLs from clipboard') {
                    const urls = clipboardText
                        .split(/[\n\r]+/)
                        .map(url => url.trim())
                        .filter(url => url.startsWith('http://') || url.startsWith('https://'));

                    if (urls.length > 0) {
                        urls.forEach(url => urlProvider.addUrl(url));
                        vscode.window.showInformationMessage(`Added ${urls.length} URL${urls.length > 1 ? 's' : ''}`);
                    } else {
                        vscode.window.showWarningMessage('No valid URLs found in clipboard');
                    }
                } else {
                    const url = await vscode.window.showInputBox({
                        prompt: 'Enter a URL to check',
                        placeHolder: 'https://example.com',
                        validateInput: text => 
                            text.startsWith('http://') || text.startsWith('https://') 
                                ? null 
                                : 'URL must start with http:// or https://'
                    });
                    
                    if (url) {
                        urlProvider.addUrl(url);
                        vscode.window.showInformationMessage('URL added');
                    }
                }
            } catch (error) {
                vscode.window.showErrorMessage('Failed to read clipboard');
            }
        })
    );

    // Register Clear URLs command
    context.subscriptions.push(
        vscode.commands.registerCommand('urlStatusChecker.clearUrls', () => {
            urlProvider.clearUrls();
        })
    );

    // Update the check status command to use URLs from the tree view
    let disposable = vscode.commands.registerCommand('urlStatusChecker.checkStatus', async () => {
        const urls = urlProvider.getUrls();
        if (urls.length === 0) {
            vscode.window.showWarningMessage('No URLs to check. Add some URLs first.');
            return;
        }

        const results: StatusCheckResult[] = [];
        const panel = vscode.window.createWebviewPanel(
            'urlStatusReport',
            'Bulk HTTP Status Report',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        // Show interactive loading state with current URL display
        panel.webview.html = `
            <html>
                <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1f2937; color: #e5e7eb; font-family: system-ui;">
                    <div style="text-align: center; width: 80%; max-width: 600px;">
                        <h2 style="font-size: 1.5rem; margin-bottom: 2rem;">Analyzing URLs...</h2>
                        <div style="background: rgba(17, 24, 39, 0.7); padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem;">
                            <div style="font-family: monospace; font-size: 0.875rem; color: #60A5FA; word-break: break-all;" id="currentUrl">
                                Initializing...
                            </div>
                        </div>
                        <div style="background: rgba(55, 65, 81, 0.3); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 1rem;">
                            <div id="progress" style="width: 0%; height: 100%; background: #3B82F6; transition: width 0.3s ease-in-out;"></div>
                        </div>
                        <p style="font-size: 0.875rem; color: #9CA3AF;">
                            Processing <span id="current">0</span> of <span id="total">${urls.length}</span> URLs
                        </p>
                    </div>
                    <script>
                        const vscode = acquireVsCodeApi();
                        window.addEventListener('message', event => {
                            const message = event.data;
                            if (message.type === 'progress') {
                                document.getElementById('progress').style.width = message.percentage + '%';
                                document.getElementById('current').textContent = message.current;
                                document.getElementById('currentUrl').textContent = message.currentUrl || 'Initializing...';
                            }
                        });
                    </script>
                </body>
            </html>
        `;

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Checking URLs",
            cancellable: true
        }, async (progress, token) => {
            const increment = 100 / urls.length;

            for (let i = 0; i < urls.length; i++) {
                if (token.isCancellationRequested) break;

                const currentUrl = urls[i].trim();
                
                // Update loading progress with current URL
                panel.webview.postMessage({ 
                    type: 'progress', 
                    percentage: Math.round((i + 1) * increment),
                    current: i + 1,
                    currentUrl: currentUrl
                });

                try {
                    const result = await getStatusChain(currentUrl);
                    results.push(result);
                } catch (error) {
                    results.push({
                        url: currentUrl,
                        statusChain: ['Error occurred'],
                        urlChain: [currentUrl],
                        initialStatus: 'Error',
                        finalStatus: error instanceof Error ? error.message : 'Unknown error',
                        destinationUrl: currentUrl
                    });
                }

                progress.report({ increment });
            }

            // Show final results
            panel.webview.html = generateHtmlReport(results);
        });

        // Add message handler for export
        let exportInProgress = false;
        panel.webview.onDidReceiveMessage(
            async message => {
                if (message.command === 'export' && !exportInProgress) {
                    exportInProgress = true;
                    try {
                        if (message.type === 'json') {
                            await copyToJson(results);
                        } else if (message.type === 'csv') {
                            await exportToCsv(results);
                        }
                        await new Promise(resolve => setTimeout(resolve, 500)); // Cool down period
                    } catch (error) {
                        vscode.window.showErrorMessage(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    } finally {
                        exportInProgress = false;
                    }
                }
            },
            undefined,
            context.subscriptions
        );

        // Final update of the webview content
        panel.webview.html = generateHtmlReport(results);
    });

    context.subscriptions.push(disposable);

    // Status bar item configuration
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBarItem.text = "$(globe) Check URLs";
    statusBarItem.command = 'urlStatusChecker.checkStatus';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}

export function deactivate() {}