// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fluttergeneratedataclass" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('fluttergeneratedataclass.genDartDataClass', (uri: vscode.Uri) => {
		let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
		let workspaceName: string | undefined = workspaceFolder?.name;
		let workspacePathSplitted: string[] | undefined = workspaceFolder?.uri.fsPath.split(workspaceName ?? '');
		let workspacePath: string | undefined = `${workspacePathSplitted?.[0]}${workspaceName}`;
		if (workspaceName == null || workspacePath == null) {
			return;
		}
		let pathFromRoot: string = uri.fsPath;
		let pathSplitted: string[] = pathFromRoot.split(workspaceName);
		let pathAfterWorkspace: string = pathSplitted[pathSplitted.length - 1];
		let pathFromWorkspace: string = `${pathAfterWorkspace}`.slice(1);

		const flutterCommand = `cd ${workspacePath} && flutter packages pub run build_runner build --delete-conflicting-outputs --build-filter="${pathFromWorkspace}/*.dart"`;
        
		vscode.window.showInformationMessage(`Generating data class... \n${pathFromWorkspace}/*.dart`);

		exec(flutterCommand, (error, stdout, stderr) => {
			if (error) {
				vscode.window.showErrorMessage(`Generate data class error: ${stderr}`);
				console.error(`exec error: ${error}`);
				return;
			}
			vscode.window.showInformationMessage('Generate data class completed');
		});
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
