// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-ollama" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-ollama.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from VSCode Ollama!');
	});

	context.subscriptions.push(disposable);

	const provider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
			console.log(['provideInlineCompletionItems triggered',position,context,token]);
			const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
			console.log(document.getText());
			if (position.line < 0) {
				return;
			}

			const result: vscode.InlineCompletionList = {
				items: [],
				//commands: [],
			};

			result.items.push({
				insertText: new vscode.SnippetString("Test"),
				range: new Range(position.line, position.character, position.line, position.character),
				//completeBracketPairs,
			});

			let offset = 1;
			while (offset > 0) {
				if (position.line - offset < 0) {
					break;
				}
				console.log(document.getText());
				const lineBefore = document.lineAt(position.line - offset).text;
				const matches = lineBefore.match(regexp);
				if (!matches) {
					break;
				}
				offset++;

				const start = matches[1];
				const startInt = parseInt(start, 10);
				const end = matches[2];
				const endInt =
					end === '*'
						? document.lineAt(position.line).text.length
						: parseInt(end, 10);
				const flags = matches[3];
				const completeBracketPairs = flags.includes('b');
				const isSnippet = flags.includes('s');
				const text = matches[4].replace(/\\n/g, '\n');

				result.items.push({
					insertText: isSnippet ? new vscode.SnippetString(text) : text,
					range: new Range(position.line, startInt, position.line, endInt),
					//completeBracketPairs,
				});
			}

			//if (result.items.length > 0) {
			//	result.commands!.push({
			//		command: 'demo-ext.command1',
			//		title: 'My Inline Completion Demo Command',
			//		arguments: [1, 2],
			//	});
			//}
			return result;
		},

		//handleDidShowCompletionItem(completionItem: vscode.InlineCompletionItem): void {
		//	console.log('handleDidShowCompletionItem');
		//},

		/**
		 * Is called when an inline completion item was accepted partially.
		 * @param acceptedLength The length of the substring of the inline completion that was accepted already.
		 */
		//handleDidPartiallyAcceptCompletionItem(
		//	completionItem: vscode.InlineCompletionItem,
		//	acceptedLength: number
		//): void {
		//	console.log('handleDidPartiallyAcceptCompletionItem');
		//},
	};
	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
