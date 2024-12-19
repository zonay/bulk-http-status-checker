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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const statusChecker_1 = require("./statusChecker");
const formatters_1 = require("./utils/formatters");
function activate(context) {
    let disposable = vscode.commands.registerCommand('urlStatusChecker.checkStatus', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const text = document.getText();
        const urls = text.split('\n').filter(line => line.trim());
        const outputChannel = vscode.window.createOutputChannel('URL Status Checker');
        outputChannel.show();
        outputChannel.appendLine('URL Status Check Report');
        outputChannel.appendLine('='.repeat(80) + '\n');
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Checking URLs",
            cancellable: true
        }, async (progress, token) => {
            const increment = 100 / urls.length;
            for (const url of urls) {
                if (token.isCancellationRequested) {
                    break;
                }
                try {
                    const result = await (0, statusChecker_1.getStatusChain)(url.trim());
                    const formattedOutput = (0, formatters_1.formatStatusEntry)(result.url, result.statusChain, result.initialStatus, result.finalStatus, result.destinationUrl);
                    outputChannel.appendLine(formattedOutput);
                }
                catch (error) {
                    outputChannel.appendLine(`Error checking ${url}: ${error}`);
                }
                progress.report({ increment });
            }
        });
    });
    // Register the command
    context.subscriptions.push(disposable);
    // Also register a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBarItem.text = "$(globe) Check URLs";
    statusBarItem.command = 'urlStatusChecker.checkStatus';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map