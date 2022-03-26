import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import { files as presets } from '../presets.json';

type Preset =
	| {
			files: string[];
			presetFile: string;
			endings?: undefined;
		}
	| {
			files: string[];
			endings: string[];
			presetFile: string;
		};

export default async function file() {
	const folders = vscode.workspace.workspaceFolders;
	if (folders) {
		let watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(folders[0], '**'));
		watcher.onDidCreate(async uri => {
			let presetsFileDir: string | string[] = __dirname.split('\\');
			if (presetsFileDir.includes('utils')) {
				presetsFileDir.pop();
			}
			presetsFileDir.pop();
			presetsFileDir = presetsFileDir.join('\\');

			console.log(`created ${uri.fsPath}`);

			const fileParts = uri.fsPath.split('\\');
			const fileName = fileParts[fileParts.length - 1];
			const fileEnding = fileName.split('.').pop() || '';

			console.log(fileEnding);

			const preset: Preset = presets.filter(p => p.files.includes(fileName))[0];
			const endingPreset: Preset = presets.filter(p => p.endings && p.endings.includes(fileEnding))[0];

			if (preset && endingPreset) {
				const options = [
					`Use normal preset (${preset.presetFile.split('/').pop()})`,
					`Use file ending preset (${endingPreset.presetFile.split('/').pop()})`,
					`Ignore`
				];
				vscode.window
					.showQuickPick(options, {
						title: 'A preset for file ending and a file preset detected matching',
						canPickMany: false,
						ignoreFocusOut: true
					})
					.then(async s => {
						switch (s) {
							case options[0]:
								applyPreset(uri, preset, presetsFileDir as string);
								break;
							case options[1]:
								applyPreset(uri, endingPreset, presetsFileDir as string);
								break;
							default:
								break;
						}
					});
			} else if (preset) {
				showPreset(uri, fileName, preset, presetsFileDir);
			} else if (endingPreset) {
				showPreset(uri, fileName, endingPreset, presetsFileDir);
			}
		});
	}
}

function showPreset(uri: vscode.Uri, fileName: string, preset: Preset, presetsFileDir: string) {
	vscode.window
		.showQuickPick([ `Use preset for ${fileName}`, 'Ignore' ], {
			canPickMany: false,
			ignoreFocusOut: true
		})
		.then(async v => {
			switch (v) {
				case `Use preset for ${fileName}`:
					await applyPreset(uri, preset, presetsFileDir);
					break;
				default:
					break;
			}
		});
}

async function applyPreset(uri: vscode.Uri, preset: Preset, presetsFileDir: string) {
	const workspaceEdit = new vscode.WorkspaceEdit();

	const file = await readFileSync(presetsFileDir + preset.presetFile.replace('.', '').replace('/', '\\'));

	workspaceEdit.set(uri, [
		new vscode.TextEdit(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0)), file.toString())
	]);

	vscode.workspace.applyEdit(workspaceEdit);
	vscode.workspace.saveAll(false);
}
