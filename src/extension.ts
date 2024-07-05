// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);


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
		let pathFromRoot: string = uri.fsPath;
		let pathContentPubspec = checkSegmentsForPubspecYaml(pathFromRoot);
		console.log('pathFromRoot', pathFromRoot);
		console.log('pathContentPubspec', pathContentPubspec);

		let finalPath: string = removeLeadingSlashes(pathFromRoot.replace(`${pathContentPubspec}`, ''));

		console.log('finalPath', finalPath);

		const flutterCommand: string = `cd ${pathContentPubspec} && flutter packages pub run build_runner build --delete-conflicting-outputs --build-filter="${finalPath}/*.dart"`;

		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Generating Freezed data class...`,
				cancellable: true
			},
			async (_, token) => {
				token.onCancellationRequested(() => {
					console.log('User canceled the long running operation');
					vscode.window.showInformationMessage('Generate data class canceled');
				});

				return executeCommand(flutterCommand);
			}
		);


	});

	context.subscriptions.push(disposable);
}

function checkSegmentsForPubspecYaml(fullPath: string) {
	const segments: string[] = fullPath.split(path.sep);
	let currentPath: string = '';
	var pathsWithPubspec: string = '';

	for (const segment of segments) {
		currentPath = path.join(currentPath, segment);
		const pubspecPath = path.join(currentPath, 'pubspec.yaml');

		if (fs.existsSync(pubspecPath)) {
			pathsWithPubspec = currentPath;
		}
	}

	return pathsWithPubspec;
}

async function executeCommand(command: string) {
	try {
		// Step 4: Execute the command
		const { stdout, stderr } = await exec(command);

		// Step 5: Handle the output
		console.log('Standard Output:\n', stdout);
		if (stderr) {
			console.error('Standard Error:', stderr);
			vscode.window.showInformationMessage(`Generate Freezed data class error: ${stderr}`);
		}
		vscode.window.showInformationMessage('Generate Freezed data class success');
	} catch (error) {
		// Step 6: Error handling
		console.error('Error executing command:', error);
		vscode.window.showInformationMessage(`Generate Freezed data class error: ${error}`);

	}
}

function removeLeadingSlashes(path: string): string {
	return path.replace(/^\/+/, '');
  }

// This method is called when your extension is deactivated
export function deactivate() { }
