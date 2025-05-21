// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getGitDiff } from './git';
import { generateWithGPT } from './gpt';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('commit maid activated');

	const disposable = vscode.commands.registerCommand('commit-maid.helloWorld', async () => {
	  try {
		// 1. Git diff 가져오기
		const diff = await getGitDiff();
		if (!diff) {
		  vscode.window.showErrorMessage('No changes detected or not in a Git repository.');
		  return;
		}
  
		// 2. 로딩 표시
		await vscode.window.withProgress({
		  location: vscode.ProgressLocation.Notification,
		  title: "Generating commit message with GPT...",
		  cancellable: false
		}, async () => {
		  // 3. GPT로 커밋 메시지 생성
		  const prompt = `Generate a concise Git commit message based on the following diff:\n\n${diff}\n\n` +
			`Rules:\n- Use conventional commits format\n- Limit to 50 characters for title\n- Be specific`;
		  
		  const commitMessage = await generateWithGPT(prompt);
		  
		  // 4. 생성된 메시지 표시
		  await vscode.commands.executeCommand('workbench.view.scm');
		  const scmInput = vscode.window.activeTextEditor?.document.uri.scheme === 'vscode-scm' 
			? vscode.window.activeTextEditor 
			: undefined;
		  
		  if (scmInput) {
			scmInput.edit(edit => {
			  const fullRange = new vscode.Range(
				new vscode.Position(0, 0),
				new vscode.Position(scmInput.document.lineCount, 0)
			  );
			  edit.replace(fullRange, commitMessage);
			});
		  } else {
			vscode.window.showInformationMessage(
			  `Generated commit message: ${commitMessage}`,
			  { modal: true }
			);
		  }
		});
  
	  } catch (error) {
		vscode.window.showErrorMessage(
		  `Error generating commit message: ${error instanceof Error ? error.message : String(error)}`
		);
	  }
	});
  
	context.subscriptions.push(disposable);
  }

// This method is called when your extension is deactivated
export function deactivate() {}
