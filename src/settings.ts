import SmartTitlePlugin from 'src';
import { App, PluginSettingTab, Setting } from 'obsidian';


// The settings properties
export interface SmartTitleSettings {
    tagSeparators: string; // the tag separators to split title to 'tag&remaining', multiple separators split with '|'.
    remainingAsAlias: boolean; // whether the remaining part be used as alias.
}

// The default settings
export const DEFAULT_SETTINGS: SmartTitleSettings = {
    tagSeparators: '｜',
    remainingAsAlias: true
}


// The settings tab for plugin.
export class SmartTitleSettingsTab extends PluginSettingTab {
    private plugin: SmartTitlePlugin;

    constructor(app: App, plugin: SmartTitlePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Advanced Settings' });

        // settings.tagPatterns
        new Setting(containerEl)
            .setName('Tag separators to split title')
            .setDesc('The tag separator will split title to \'tag & remaining\', multiple separators split with \'|\'.')
            .addText(textComponent => {
                // textComponent.inputEl.maxLength = 1;
                textComponent.inputEl.required = true;
                textComponent.inputEl.addEventListener('blur', () => {
                    textComponent.inputEl.reportValidity();
                });
                textComponent
                    .setValue(this.plugin.settings.tagSeparators)
                    .onChange(async (value) => {
                        if (textComponent.inputEl.reportValidity()) {
                            this.plugin.settings.tagSeparators = value;
                            await this.plugin.saveSettings();
                        }
                    });
            });


        // settings.remainingAsAlias
        new Setting(containerEl)
            .setName('Remaing as alias')
            .setDesc('Whether the remaining part be used as an alias.')
            .addToggle(togleComponent => {
                togleComponent
                    .setValue(this.plugin.settings.remainingAsAlias)
                    .onChange(async (value) => {
                        this.plugin.settings.remainingAsAlias = value;
                        await this.plugin.saveSettings();
                    });
            });
    }

}
