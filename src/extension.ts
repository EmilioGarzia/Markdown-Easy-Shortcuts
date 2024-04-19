// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import os from 'node:os'

// defines the languages where the commands can be execute
const languages = ["markdown"];


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-shortcuts" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let bold_cmd = vscode.commands.registerCommand('markdown-shortcuts.bold', textBold);				// Bold
	let italic_cmd = vscode.commands.registerCommand('markdown-shortcuts.italic', textItalic);			// Italic


	let toc_cmd = vscode.commands.registerCommand('markdown-shortcuts.toc', toc_generator)
	vscode.workspace.onDidChangeTextDocument(automatic_list_cmd);										// Automatic List 
	
	// substring replaceable
	vscode.workspace.onDidChangeTextDocument(right_arrows_replacer);									// Right Arrow HTML code 
	vscode.workspace.onDidChangeTextDocument(left_arrows_replacer);										// Left Arrow HTML code

	// Subscribe commands
	context.subscriptions.push(bold_cmd);
	context.subscriptions.push(italic_cmd);
}


// Table of content generator
function toc_generator(){
	let editor = vscode.window.activeTextEditor
	let toc: string = "**Table of contents**\n"
	let depth : any

	if(!have_toc()){
		vscode.window.showInputBox({ prompt: 'Insert Table of contents depth [1-6]:' }).then(input => {
			if (input) {
				depth = parseInt(input)
				if(isNaN(depth))
					depth = 3
				if(depth > 6 || depth < 1){
					depth = 3
					vscode.window.showWarningMessage('Input not valid.\nDefault depth: 3');
				}
			} else{
				depth = 3
				vscode.window.showWarningMessage('Input not valid.\nDefault depth: 3');
			}
			

			if(editor){		
				let document = editor.document
				for(let i=0; i<document.lineCount; i++){
			
					let header = document.lineAt(i).text.split(' ')?.at(0)
					let header_content = document.lineAt(i)?.text?.slice(header?.length).trim()
					if(header?.startsWith("#")){

							
						switch (header.length) {
							case 1:	
								toc += "- [" + header_content + "](#" + header_content.replaceAll(" ","-").toLowerCase() + ")\n"
								break;
							
							case 2:
								if(depth > 1)
									toc += "\t- [" + header_content + "](#" + header_content.replaceAll(" ","-").toLowerCase() + ")\n"
								break;
							
							case 3:
								if(depth > 2)
									toc += "\t\t- [" + header_content + "](#" + header_content.replaceAll(" ","-").toLowerCase() + ")\n"
								break;
							
							case 4:
								if(depth > 3)
									toc += "\t\t\t- [" + header_content + "](#" + header_content.replaceAll(" ","-").toLowerCase() + ")\n"
								break;
	
							case 5:
								if(depth > 4)
									toc += "\t\t\t\t- [" + header_content + "](#" + header_content.replaceAll(" ","-").toLowerCase() + ")\n"
								break;
							
							case 6:
								if(depth > 5)
									toc += "\t\t\t\t\t- [" + header_content + "](#" + header_content.replaceAll(" ","-").toLowerCase() + ")\n"
								break;
						
							default:
								break;
						}
					}	
				}
	
				editor.edit(editBuilder =>{
					editBuilder.insert(new vscode.Position(0,0), toc+"\n\n")
				});
	
				vscode.window.showInformationMessage("Table of contents has been created!")
			}
		});

		
	}else
		vscode.window.showWarningMessage("Your document already has a table of contents!")
}

// check if the document already has a toc
function have_toc():boolean{
	let editor = vscode.window.activeTextEditor;
	
	if(editor){
		let document = editor.document

		for(let i=0; i<document.lineCount; i++){
			if(document.lineAt(i).text.includes("**Table of contents**")){
				return true
			}	
		}
	}
	return false
}

// Right arrow replacer
function right_arrows_replacer(event: vscode.TextDocumentChangeEvent){ replacer("->", "&rarr;") }

// Left arrow replacer
function left_arrows_replacer(event: vscode.TextDocumentChangeEvent){ replacer("<-", "&larr;") }

// This function provide to replace a specified substring in a line editor with another substring
function replacer(source: string, destination: string){
	let editor = vscode.window.activeTextEditor;

	if(editor){
		let document = editor.document;
		let text = document.getText()

		if(text.includes(source)){
			let newText = text.replace(source, destination)
			let fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length))
			editor.edit(editBuilder =>{
				editBuilder.replace(fullRange, newText);
			});
		}
	}	
}

// Automatic list 
function automatic_list_cmd (event: vscode.TextDocumentChangeEvent){
	if(check_doc_extension(languages)){
		// Check if "ENTER" is typed
		if(event.contentChanges.at(0)?.text === os.EOL){
			
			// Get the editor context
			let editor = vscode.window.activeTextEditor;
			
			if(editor){
				let document = editor.document;
				let cursor_position = editor.selection.active		
				let line = cursor_position.line;					    
				let previous_line = document.lineAt(line)			
				let first_char = previous_line.text.trim()[0]
				let second_char = previous_line.text.trim()[1]
				let third_char = previous_line.text.trim()[2]

				// Scenario 1: check if the user leaves the item list empty
				if((first_char === '*' && !second_char || first_char === '-' && !second_char || (first_char === '1' && second_char === '.')) && !third_char ){
					editor.edit(editBuilder => {
						// delete item symbols
						editBuilder.delete(new vscode.Range(new vscode.Position(previous_line.lineNumber,0), new vscode.Position(previous_line.lineNumber,3)));
						
						// move the cursor at the beginning of the previous line
						editor.selection = new vscode.Selection(new vscode.Position(previous_line.lineNumber+1,0),new vscode.Position(previous_line.lineNumber+1,0))
					});
				}
				
				// Scenario 2: Check if the previous line contains an item list
				if(first_char === '*' && second_char === ' ' || first_char === "1"  &&  second_char === '.' && third_char === ' ' || first_char === '-' && second_char === ' '){
					let next_line = document.lineAt(line+1)
					let string_to_insert = first_char === '1' ? "1. " : first_char+' ' 

					editor.edit(editBuilder => {
						editBuilder.insert(new vscode.Position(next_line.lineNumber,0), string_to_insert);
					});
				}
			}
		}
	}
}

// Text Italic
function textItalic(){
	if(check_doc_extension(languages)){
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
}

// Text Bold
function textBold(){
	if(check_doc_extension(languages)){
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
}	

// check if we are into specified compatible documents
function check_doc_extension(language: any[]){ 
	if(language.includes(vscode.window.activeTextEditor?.document.languageId))
		return true;
	return false
}

// This method is called when your extension is deactivated
export function deactivate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage("'markdown-shortcuts' has been deactivated!");
}