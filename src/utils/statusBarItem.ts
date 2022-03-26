import * as vscode from 'vscode';

export const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
export function loading() {
	statusBarItem.text = `$(file-code) $(sync~spin)`;
	statusBarItem.tooltip = 'File Presets';
	statusBarItem.show();
}

export function done() {
	statusBarItem.text = `$(file-code) $(pass-filled)`;
	statusBarItem.tooltip = 'File Presets';
	statusBarItem.show();
}

export function neutral() {
	statusBarItem.text = `$(file-code) $(circle-large-outline)`;
	statusBarItem.tooltip = 'File Presets';
	statusBarItem.show();
}

export function start() {
	statusBarItem.text = `$(file-code)`;
	statusBarItem.tooltip = 'File Presets';
	statusBarItem.show();
}
