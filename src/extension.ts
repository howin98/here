// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class Configuration {
	"here.switchConfigurations.commands": Array<string> | undefined;
	"here.switchConfigurations.settings": [key:string] | undefined;
};

type Configurations = Array<Configuration>;

class ConfigurationManagement {
	private static instance: ConfigurationManagement;

	private index: number;
	private configs: Configurations | undefined;
	private constructor() {
		this.index = 0;
	}

	private updateConfigs() {
		this.configs = vscode.workspace.getConfiguration("here").get<Configurations>('switchConfigurations');
	}

	public static getInstance() {
		if (!ConfigurationManagement.instance) {
			ConfigurationManagement.instance = new ConfigurationManagement();
		}
		return ConfigurationManagement.instance;
	}

	private async updateSettings(config: Configuration) {
		let settings = config['here.switchConfigurations.settings'];
		if (settings) {
			for (let key in settings) {
				let value = settings[key];
				await vscode.workspace.getConfiguration().update(key, value);
			}
		}
	}

	private async updateCommands(config: Configuration) {
		let commands = config['here.switchConfigurations.commands'];
		if (commands) {
			for (let command of commands) {
				await vscode.commands.executeCommand(command);
			}
		}
	}

	public async switch(index: number = this.index + 1) {
		this.updateConfigs();
		if (this.configs) {
			this.index = index % this.configs.length;
			let config = this.configs[this.index];
			await this.updateSettings(config);
			await this.updateCommands(config);
		}
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "here" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('here.switch', () => {
		ConfigurationManagement.getInstance().switch();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
