import * as vscode from 'vscode';
import { getGitDiff } from './git';
import { GroqCommitGenerator } from './groq';

export function activate(context: vscode.ExtensionContext) {
    const generator = new GroqCommitGenerator();

    let disposable = vscode.commands.registerCommand('commit-maid.helloWorld', async () => {
        const diff = await getGitDiff();
        if (!diff) {
            vscode.window.showErrorMessage('No changes detected or not in a Git repository.');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Groq AI가 커밋 메시지 생성 중...",
            cancellable: false
        }, async (progress) => {
            try {
                const message = await generator.generateCommitMessage(diff);
                
                vscode.window.showInformationMessage(`생성된 커밋 메시지:\n${message}`);
                
                const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
                const api = gitExtension?.getAPI(1);

                const repo = api?.repositories[0];
                if (!repo) 
                    throw new Error('No Git repository found.');

                const input = await vscode.window.showInputBox({
                    prompt: "Edit your commit message",
                    value: message,
                });

                if (input) {
                    await repo.commit(input);
                }
                // // SCM 뷰에 메시지 입력
                // await vscode.commands.executeCommand('workbench.view.scm');
                // const editor = vscode.window.activeTextEditor;
                // if (editor?.document.uri.scheme === 'vscode-scm') {
                //     await editor.edit(edit => {
                //         const range = new vscode.Range(
                //             editor.document.positionAt(0),
                //             editor.document.positionAt(editor.document.getText().length)
                //         );
                //         edit.replace(range, message);
                //     });
                // } else {
                //     vscode.window.showInformationMessage(`생성된 커밋 메시지:\n${message}`);
                // }
            } catch (error) {
                vscode.window.showErrorMessage(
                    `커밋 메시지 생성 실패: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        });
    });

    context.subscriptions.push(disposable);
}