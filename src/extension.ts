

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { File } from 'buffer';
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-shortcuts" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let bold_cmd = vscode.commands.registerCommand('markdown-shortcuts.bold', textBold);
	let italic_cmd = vscode.commands.registerCommand('markdown-shortcuts.italic', textItalic);
	
	// Subscribe commands
	context.subscriptions.push(bold_cmd);
	context.subscriptions.push(italic_cmd);
}

// Text Italic
function textItalic(){
	const editor = vscode.window.activeTextEditor;

        if (editor) {
            // Get cursor selection
            var selection = editor.selection;

            // Get the text into the selection
            var selectedText = editor.document.getText(selection);
			
			// Add italic style if text is normal, otherwise, set text back to normal
			if(selectedText.charAt(2) !== '*' && selectedText.charAt(selectedText.length-3) !== '*' && selectedText.substring(0,2) === "**" && selectedText.substring(selectedText.length-2,selectedText.length) === "**" || !selectedText.startsWith("*") && !selectedText.endsWith("*"))
				selectedText = "*" + selectedText + "*";
			else if(selectedText.substring(0,3) === "***" && selectedText.substring(selectedText.length-3,selectedText.length) === "***")
				selectedText = selectedText.substring(1,selectedText.length-1)
			else	
				selectedText = selectedText.substring(1,selectedText.length-1);

            // Replace the selection with a new string
            editor.edit(editBuilder => {
                editBuilder.replace(selection, selectedText);
            });
        }
}

// Text Bold
function textBold(){
	const config = vscode.workspace.getConfiguration(); // Accesso alla configurazione globale
	const editor = vscode.window.activeTextEditor;
	config.update('adelio.giovanni', 2, true)

        if (editor) {
            // Get cursor selection
            var selection = editor.selection;

            // Get the text into the selection
            var selectedText = editor.document.getText(selection);
			
			// Add bold style if text is normal, otherwise, set text back to normal
			if(selectedText.startsWith("**") && selectedText.endsWith("**")){
				selectedText = selectedText.substring(2, selectedText.length-2);
			}else{
				selectedText = "**" + selectedText + "**";
			}

            // Replace the selection with a new string
            editor.edit(editBuilder => {
                editBuilder.replace(selection, selectedText);
            });
        }
}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage("'markdown-shortcuts' has been deactivated!");
}