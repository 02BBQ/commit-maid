import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getGitDiff(): Promise<string | null> {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }

        const workspacePath = workspaceFolders[0].uri.fsPath;

        const { stdout, stderr } = await execAsync('git diff --cached', {
            cwd: workspacePath
        });

        if (stderr) {
            console.error('Git error:', stderr);
            return null;
        }

        return stdout || null;
    } catch (error) {
        console.error('Error getting git diff:', error);
        return null;
    }
}