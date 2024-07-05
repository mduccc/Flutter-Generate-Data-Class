// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
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
	const disposable = vscode.commands.registerCommand('fluttergeneratedataclass.genDartDataClass', async (uri: vscode.Uri) => {
		let pathFromRoot: string = uri.fsPath;
		let pathContainPubspec = await checkSegmentsContainPubspec(pathFromRoot);
		console.log('pathFromRoot', pathFromRoot);
		console.log('pathContentPubspec', pathContainPubspec);

		let finalPath: string = removeLeadingSlashes(pathFromRoot.replace(`${pathContainPubspec}`, ''));

		console.log('finalPath', finalPath);

		const flutterCommand: string = `cd ${pathContainPubspec} && flutter packages pub run build_runner build --delete-conflicting-outputs --build-filter="${finalPath}/*.dart"`;

		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Generating Freezed Data Class...`,
				cancellable: true
			},
			async (_, token) => {
				token.onCancellationRequested(() => {
					console.log('User canceled the long running operation');
					vscode.window.showInformationMessage('Generate Freezed Data Class canceled');
				});

				return executeCommand(flutterCommand);
			}
		);


	});

	context.subscriptions.push(disposable);
}

async function checkSegmentsContainPubspec(fullPath: string) {
	const segments: string[] = fullPath.split(path.sep);
	let currentPath: string = '';
	var pathsWithPubspec: string = '';

	for (const segment of segments) {
		currentPath = path.join(currentPath, segment);
		const pubspecPath = path.join(currentPath, 'pubspec.yaml');

		var isExistPubspec = await checkFileExists(vscode.Uri.file(pubspecPath));

		if (isExistPubspec) {
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
			vscode.window.showInformationMessage(`Generate Freezed Data Class error: ${stderr}`);
		}
		vscode.window.showInformationMessage('Generate Freezed Data Class success');
	} catch (error) {
		// Step 6: Error handling
		console.error('Error executing command:', error);
		vscode.window.showInformationMessage(`Generate Freezed Data Class error: ${error}`);

	}
}

function removeLeadingSlashes(path: string): string {
	return path.replace(/^\/+/, '');
}

async function checkFileExists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true; // File exists
  } catch (error) {
    if (error instanceof vscode.FileSystemError && error.code === 'FileNotFound') {
      return false; // File does not exist
    }
    throw error; // Rethrow other errors
  }
}

// This method is called when your extension is deactivated
export function deactivate() { }
