"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path = require("path");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
let client;
function activate(context) {
    const lsp = context.asAbsolutePath(path.join('client', 'bin', 'ca65-lsp' + process.platform == 'win32' ? '.exe' : ''));
    const serverModule = 'lsp-devtools agent -- ' + lsp;
    const serverOptions = { command: serverModule, transport: node_1.TransportKind.stdio, options: {
            shell: true
        } };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'ca65' }],
        synchronize: {
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/nes.toml')
        }
    };
    client = new node_1.LanguageClient('ca65', 'ca65', serverOptions, clientOptions);
    client.start();
}
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
//# sourceMappingURL=extension.js.map