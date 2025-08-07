import * as path from "path";
import { workspace, ExtensionContext, window, commands, debug } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  WorkDoneProgress,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  const exeName = "ca65-lsp" + (process.platform == "win32" ? ".exe" : "");

  function startServer() {
    const command = workspace.getConfiguration("ca65").get<string>("lsp.path");
    if (command) {
      const serverOptions: ServerOptions = {
        command,
        transport: TransportKind.stdio,
        options: {
          shell: true,
          env: {
            RUST_BACKTRACE: 1,
          },
        },
      };
      console.log(`Starting ca65 language server with command: ${command}`);

      const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "ca65" }],
        synchronize: {
          fileEvents: workspace.createFileSystemWatcher("**/ca65.toml"),
        },
      };

      client = new LanguageClient("ca65", "ca65", serverOptions, clientOptions);

      client.onProgress(WorkDoneProgress.type, "ca65", (params) => {
        console.log(params);
      });

      client.start();
    } else {
        window.showErrorMessage("Failed to find ca65-lsp. Please set server path in extension settings", "Open Settings", "Cancel").then((selected) => {
            if (selected == "Open Settings") {
                commands.executeCommand("workbench.action.openSettings", "ca65.lsp.path");
            }
        })
    }
  }

  workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration("ca65.lsp.path")) {
      if (client) {
        await client.stop();
      }
      startServer();
    }
  });

  context.subscriptions.push(
    commands.registerCommand("ca65.restartLanguageServer", async () => {
      if (client) {
        await client.stop();
      }
      startServer();
      window.showInformationMessage("Language server restarted.");
    })
  );

  startServer();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
