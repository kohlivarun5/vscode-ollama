// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { submit } from "./prompt";

const delay = (ms:any) => new Promise(resolve => setTimeout(resolve, ms));

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

			const result: vscode.InlineCompletionList = {
					items: [],
					//commands: [],
				};

			let line = document.lineAt(position.line).text;

			const atInitial = "@code"

			let atInitialIndex = line.search(atInitial)

			// If ends with `@code`, autocomplete the prompt
			if (line.length === (atInitialIndex + atInitial.length)) {
				let text = "llama "
				result.items.push({
					insertText: new vscode.SnippetString(text),
					range: new Range(position.line, position.character, position.line, position.character+text.length),
					//completeBracketPairs,
				})
				return result;
			}

			// Only do ollama for non-automatic trigger
			if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) 
			{ return; }


			const atPrompt = "@codellama"

			let atPromptIndex = line.search(atPrompt);

			const baseLlama = "codellama:13b";

			return vscode.window.withProgress({
				location: vscode.ProgressLocation.Window,
				cancellable: false,
				title: 'Calling codellama ...'
			}, async (progress) => {
							
				let {prompt,model} = 
					atPromptIndex != -1
					? {prompt: line.substring(atPromptIndex + atPrompt.length), model:`${baseLlama}-instruct`} 
					: {
						prompt: document.getText(new Range(0,0,position.line,position.character)), 
						model:  `${baseLlama}-${document.languageId === "python" ? "python" : "code"}`
					}

				progress.report({ message : ` (${model})`, increment: 10 });
				let text = await 
					submit(model,prompt).catch((error) => {
						console.log(error);
						return "";
					});
				// text = "this is a test"
				if (atPromptIndex != -1) {
					text = "\n" + text;
				}
				progress.report({ message : `codellama completed`, increment: 100 });

				result.items.push({
					insertText: new vscode.SnippetString(text),
					range: new Range(position.line, position.character, position.line, position.character+text.length),
					//completeBracketPairs,
				});
				
				return result;
			});
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
