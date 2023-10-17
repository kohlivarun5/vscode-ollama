// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { submit } from "./prompt";

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
			console.log(document.getText());
			if (context.triggerKind == vscode.InlineCompletionTriggerKind.Automatic) {
				return;
			}
			if (position.line <= 0) {
				return;
			}

			const result: vscode.InlineCompletionList = {
				items: [],
				//commands: [],
			};

			const prompt = document.getText()
			if (prompt.length < 5) {
				return;
			}

			let text = await submit("codellama:7b-code",prompt);
			console.log(text);

			result.items.push({
				insertText: text,//new vscode.SnippetString(text),
				range: new Range(position.line, position.character, position.line, position.character),
				//completeBracketPairs,
			});
			
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
	disposable = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
