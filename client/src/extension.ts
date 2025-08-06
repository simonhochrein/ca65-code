import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
    const lsp = context.asAbsolutePath(
        path.join('client', 'bin', 'ca65-lsp' + process.platform == 'win32' ? '.exe' : '')
    )

    const serverModule = 'lsp-devtools agent -- ' + lsp

    const serverOptions: ServerOptions = { command: serverModule, transport: TransportKind.stdio, options: {
        shell: true
    } }

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'ca65' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/nes.toml')
        }
    };

    client = new LanguageClient('ca65', 'ca65', serverOptions, clientOptions);

    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}