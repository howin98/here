// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class Configuration {
	"here.switchConfigurations.async": boolean;
	"here.switchConfigurations.commands": Array<string> | undefined;
	"here.switchConfigurations.settings": [key: string] | undefined;
};

type Configurations = Array<Configuration>;

class ConfigurationManagement {
	private static instance: ConfigurationManagement;

	private index: number;
	private configs: Configurations | undefined;
	private constructor() {
		const index = vscode.workspace.getConfiguration('here').get<number>('index');
		this.index = index ? index : 0;
	}

	public static getInstance() {
		if (!ConfigurationManagement.instance) {
			ConfigurationManagement.instance = new ConfigurationManagement();
		}
		return ConfigurationManagement.instance;
	}

	private updateConfigs() {
		this.configs = vscode.workspace.getConfiguration('here').get<Configurations>('switchConfigurations');
	}

	private async setIndex() {
		await vscode.workspace.getConfiguration('here').update('index', this.index);
	}

	private async updateSettings(config: Configuration) {
		const settings = config['here.switchConfigurations.settings'];
		const async = config['here.switchConfigurations.async'];
		if (settings) {
			if (async) {
				let arr: Array<Thenable<void>> = [];
				for (const key in settings) {
					const value = settings[key];
					arr.push(vscode.workspace.getConfiguration().update(key, value));
				}
				await Promise.all(arr);
			}
			else {
				for (const key in settings) {
					const value = settings[key];
					await vscode.workspace.getConfiguration().update(key, value);
				}
			}
		}
	}

	private async updateCommands(config: Configuration) {
		const commands = config['here.switchConfigurations.commands'];
		const async = config['here.switchConfigurations.async'];
		if (commands) {
			if (async) {
				let arr: Array<Thenable<void>> = [];
				for (const command of commands) {
					arr.push(vscode.commands.executeCommand(command));
				}
				await Promise.all(arr);
			}
			else {
				for (const command of commands) {
					await vscode.commands.executeCommand(command);
				}
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
			await this.setIndex();
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	// Initialize instance
	ConfigurationManagement.getInstance();

	// Register command
	let disposable = vscode.commands.registerCommand('here.switch', () => {
		ConfigurationManagement.getInstance().switch();
	});
	context.subscriptions.push(disposable);
}

export function deactivate() { }
