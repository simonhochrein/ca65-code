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
    const exeName = 'ca65-lsp' + (process.platform == 'win32' ? '.exe' : '')
    const lsp = context.asAbsolutePath(
        path.join('client', 'bin', exeName)
    )

    const serverOptions: ServerOptions = { command: lsp, transport: TransportKind.stdio, options: {
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