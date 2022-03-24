import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { files as presets } from '../presets.json';

export default async function file() {
	const folders = vscode.workspace.workspaceFolders;
	if (folders) {
		let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folders[0], '*'));
		watcher.onDidCreate(async uri => {
			let presetsFileDir: string | string[] = __dirname.split('\\');
			presetsFileDir.pop();
			presetsFileDir.pop();
			presetsFileDir = presetsFileDir.join('\\');

			console.log(`created ${uri.fsPath}`);

			const fileParts = uri.fsPath.split('\\');
			const fileName = fileParts[fileParts.length - 1];

			const preset = presets.filter(p => p.files.includes(fileName))[0];

			if (!preset) {
				return;
			}
			vscode.window
				.showQuickPick([ `Use preset for ${fileName}`, 'Ignore' ], {
					canPickMany: false
				})
				.then(async v => {
					switch (v) {
						case `Use preset for ${fileName}`:
							const workspaceEdit = new vscode.WorkspaceEdit();

							const file = await readFileSync(
								presetsFileDir + preset.presetFile.replace('.', '').replace('/', '\\')
							);

							workspaceEdit.set(uri, [
								new vscode.TextEdit(
									new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)),
									file.toString()
								)
							]);

							vscode.workspace.applyEdit(workspaceEdit);
							vscode.workspace.saveAll(false);
							break;
						default:
							break;
					}
				});
		});
	}
}
