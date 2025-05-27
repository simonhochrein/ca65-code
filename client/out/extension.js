"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path = require("path");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    const exeName = 'ca65-lsp' + (process.platform == 'win32' ? '.exe' : '');
    const lsp = context.asAbsolutePath(path.join('client', 'bin', exeName));
    function startServer() {
        const command = vscode_1.workspace.getConfiguration('ca65').get('lsp.path') ?? lsp;
        const serverOptions = { command, transport: node_1.TransportKind.stdio, options: {
                shell: true,
                env: {
                    RUST_BACKTRACE: 1
                }
            } };
        const clientOptions = {
            documentSelector: [{ scheme: 'file', language: 'ca65' }],
            synchronize: {
                fileEvents: vscode_1.workspace.createFileSystemWatcher('**/nes.toml')
            },
        };
        client = new node_1.LanguageClient('ca65', 'ca65', serverOptions, clientOptions);
        client.onProgress(node_1.WorkDoneProgress.type, "ca65", (params) => {
            console.log(params);
        });
        client.start();
    }
    vscode_1.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration("ca65.lsp.path")) {
            if (client) {
                await client.stop();
            }
            startServer();
        }
    });
    context.subscriptions.push(vscode_1.commands.registerCommand('ca65.restartLanguageServer', async () => {
        if (client) {
            await client.stop();
        }
        startServer();
        vscode_1.window.showInformationMessage('Language server restarted.');
    }));
    startServer();
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
//# sourceMappingURL=extension.js.map