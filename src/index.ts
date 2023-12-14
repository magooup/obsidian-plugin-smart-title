
import { SmartTitleSettings, DEFAULT_SETTINGS, SmartTitleSettingsTab } from 'src/settings';
import { Plugin, TFile, parseFrontMatterAliases, parseFrontMatterTags } from 'obsidian';

// the separator of tagSeparators setting.
const TAG_SEPARATORS_SEPARATOR = '|';

export default class SmartTitlePlugin extends Plugin {
    public settings!: SmartTitleSettings;

    async onload(): Promise<void> {
        // load settings
        await this.loadSettings();

        // Watch the editor-change events then do the main logic work.
        this.registerEvent(this.app.workspace.on("editor-change", (editor, info) => {
            if (info.file) {
                this.smartTitle(info.file)
            }
        }));

        // add settings tab.
        this.addSettingTab(new SmartTitleSettingsTab(this.app, this));
    }

    // loading settings from disk or default
    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    // save setting to disk
    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    // main logic. extract tags and aliases from the title.
    private async smartTitle(currentFile: TFile): Promise<void> {
        const currentTitle = currentFile.basename
        // use separator to extract tag and alias, stop if once successful.
        if (this.settings.tagSeparators && this.settings.tagSeparators.length > 0) {
            const separatorsArray: string[] = this.settings.tagSeparators.split(TAG_SEPARATORS_SEPARATOR);
            for (const separator of separatorsArray) {
                const index = currentTitle.indexOf(separator);
                // only when the separator exists and whether not head or tail.
                if (index > 0 && index < currentTitle.length - 1) {
                    //  extract tag and remaining
                    const tag = currentTitle.slice(0, index);
                    const remaining = currentTitle.slice(index + 1);
                    // add tag and alias
                    this.addTagAndAlias(currentFile, tag, remaining, this.settings.remainingAsAlias)
                    // then break, ignore other separators
                    break;
                }
            }
        }
    }


    // add tags & alias
    private async addTagAndAlias(currentFile: TFile, tag: string, remaining: string, remainingAsAlias: boolean): Promise<void> {
        await this.app.fileManager.processFrontMatter(currentFile, (frontMatter: { aliases: string[] | string, tags: string[] | string }): void => {
            const tags = [...(frontMatter.tags || [])];
            const aliases = [...(frontMatter.aliases || [])]
            // add tags
            if (tag && tag.length > 0 && /[^0-9#\s]/g.test(tag) && !tags.includes(tag)) {
                tags.push(tag);
                frontMatter.tags = tags;
            }
            // add alias
            if (remainingAsAlias && remaining && remaining.length > 0 && !aliases.includes(remaining)) {
                aliases.push(remaining);
                frontMatter.aliases = aliases;
            }
        });
    }
}
