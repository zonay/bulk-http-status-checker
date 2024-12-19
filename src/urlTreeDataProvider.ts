import * as vscode from 'vscode';

export class UrlTreeDataProvider implements vscode.TreeDataProvider<UrlItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<UrlItem | undefined | null | void> = new vscode.EventEmitter<UrlItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<UrlItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private urls: string[] = [];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: UrlItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<UrlItem[]> {
        if (this.urls.length === 0) {
            return Promise.resolve([new UrlItem(
                'No URLs added',
                'Click the + button to add URLs',
                vscode.TreeItemCollapsibleState.None,
                {
                    command: 'urlStatusChecker.addUrl',
                    title: 'Add URL'
                }
            )]);
        }

        return Promise.resolve(
            this.urls.map(url => new UrlItem(
                url,
                url,
                vscode.TreeItemCollapsibleState.None
            ))
        );
    }

    addUrl(url: string) {
        this.urls.push(url);
        this.refresh();
    }

    clearUrls() {
        this.urls = [];
        this.refresh();
    }

    getUrls(): string[] {
        return [...this.urls];
    }
}

class UrlItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }

    iconPath = new vscode.ThemeIcon('link');
    contextValue = 'urlItem';
}
