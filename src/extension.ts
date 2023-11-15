// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Range } from 'vscode';
import { submit, submitStream } from "./prompt";

const delay = (ms:any) => new Promise(resolve => setTimeout(resolve, ms));

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-ollama" is now active!');

	let channel = vscode.window.createOutputChannel("codellama");

	const baseLlama = "codellama:13b";

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-ollama.ask', async () => {
		const userPrompt = await vscode.window.showInputBox({
			placeHolder: "Ask codellama",
			prompt: "Enter prompt for codellama"
		  });

		  if(!userPrompt){
			vscode.window.showErrorMessage('No prompt provided');
			return;
		  }

		let editor = vscode.window.activeTextEditor;
		let model = `${baseLlama}-instruct`;
		let prompt = userPrompt;
		if (editor) {
			let context = "";
			const selection = editor.selection;
			if (selection && !selection.isEmpty) {
				const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
				context = editor.document.getText(selectionRange);
			} else {
				context = editor.document.getText();
			}
			prompt = `Given the following code:\n${context}\n${userPrompt}`;
		}
		channel.show(true);
		channel.append (`\n\n    🦙 ===>> ${userPrompt}\n\n`);
		submitStream(model,prompt,channel.append);
	});

	context.subscriptions.push(disposable);

	// A command to ask with prepopulated prompt

	disposable = vscode.commands.registerCommand('vscode-ollama.explain', async () => {
		let editor = vscode.window.activeTextEditor;
		let model = `${baseLlama}-instruct`;

		if (!editor) {
			vscode.window.showErrorMessage('No editor selected for explanation');
			return;
		}

		let context = "";
		const selection = editor.selection;
		if (selection && !selection.isEmpty) {
			const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
			context = editor.document.getText(selectionRange);
		} else {
			context = editor.document.getText();
		}
		const prompt = `Given the following code:\n${context}\nProvide a clear and concise explanation of it`;
		channel.show(true);
		channel.append ("\n\n    🦙 ===>> Explain\n\n");
		submitStream(model,prompt,channel.append);
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

			// Only do ollama for non-automatic trigger
			if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) 
			{ return; }

			return vscode.window.withProgress({
				location: vscode.ProgressLocation.Window,
				cancellable: false,
				title: 'Calling codellama ...'
			}, async (progress) => {
				let remaining = document.getText(
					new Range(position.line,
								position.character+1,
								document.lineCount,
								document.lineAt(document.lineCount-1).range.end.character)
					).trim();

				let prompt = !remaining ? document.getText() : `${
					document.getText(
						new Range(0,0,position.line,position.character)
						)
					}<FILL>${
						document.getText(
							new Range(position.line,
										position.character+1,
										document.lineCount,
										document.lineAt(document.lineCount-1).range.end.character)
							)
					}`;

				let model = `${baseLlama}-${document.languageId === "python" ? "python" : "code"}`;

				progress.report({ message : ` (${model})`, increment: 10 });
				let text = await 
					submit(model,prompt).catch((error) => {
						console.log(error);
						return "";
					});
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
