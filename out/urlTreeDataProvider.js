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
exports.UrlTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
class UrlTreeDataProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.urls = [];
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        if (this.urls.length === 0) {
            return Promise.resolve([new UrlItem('No URLs added', 'Click the + button to add URLs', vscode.TreeItemCollapsibleState.None, {
                    command: 'urlStatusChecker.addUrl',
                    title: 'Add URL'
                })]);
        }
        return Promise.resolve(this.urls.map(url => new UrlItem(url, url, vscode.TreeItemCollapsibleState.None)));
    }
    addUrl(url) {
        this.urls.push(url);
        this.refresh();
    }
    clearUrls() {
        this.urls = [];
        this.refresh();
    }
    getUrls() {
        return [...this.urls];
    }
}
exports.UrlTreeDataProvider = UrlTreeDataProvider;
class UrlItem extends vscode.TreeItem {
    constructor(label, tooltip, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.tooltip = tooltip;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconPath = new vscode.ThemeIcon('link');
        this.contextValue = 'urlItem';
    }
}
//# sourceMappingURL=urlTreeDataProvider.js.map