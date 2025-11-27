<template>
  <v-app id="drag-and-drop-zone">
    <div class="tabs-header-wrapper">
      <v-tabs
        v-model="currentTab"
        show-arrows
        class="tabs-main"
      >
        <v-tab
          v-for="(tab, i) in tabs"
          :key="tab.id"
          :title="tab.filePath"
          :value="'tab' + tab.id"
        >
          <span class="tab-text">{{ tab.fileName }}</span>

          <v-btn
            v-show="showCloseButton()"
            variant="text"
            icon
            size="x-small"
            class="close-btn"
            @click.stop.prevent="closeTab(i)"
          >
            <v-icon size="x-small">
              mdi-close
            </v-icon>
          </v-btn>
        </v-tab>
      </v-tabs>

      <div class="tabs-actions">
        <v-btn
          v-if="this.tabs.length < 5"
          variant="text"
          icon
          size="small"
          class="add-btn"
          @click="newTab"
        >
          <v-icon size="small">
            mdi-plus
          </v-icon>
        </v-btn>

        <v-switch
          v-model="isDark"
          class="switch-theme"
          color="primary"
          hide-details
          density="compact"
          @update:model-value="toggleTheme"
        >
          <template #label>
            <v-icon size="small">
              mdi-theme-light-dark
            </v-icon>
          </template>
        </v-switch>
      </div>
    </div>

    <v-window v-model="currentTab">
      <v-window-item
        v-for="tab in tabs"
        :key="tab.id"
        :value="'tab' + tab.id"
      >
        <file-chooser
          v-if="!tab.filePath"
          @change="onFileChanged($event, tab)"
        />

        <file-viewer
          v-if="tab.filePath"
          ref="fileViewer"
          :file="tab.filePath"
          :file-settings="tab.fileSettings"
          @fileNotFoundError="fileNotFoundErrorHandler"
          @errorHandler="errorMessage"
        />
      </v-window-item>
    </v-window>

    <message-dialog
      :show="showMessageDialog"
      :severity="'error'"
      :title="messageDialogTitle"
      :message="messageDialogMessage"
      @close="closeMessageDialog"
    />
  </v-app>
</template>

<script>
	const Tab = require("./tab");
	const fs = window.node.fs;
	const FileSettings = require("./fileSettings");
	const UserPreferences = require("./userPreferences");
	const OpenNewFileCommand = require("./commands/openNewFileCommand");
	const FileChooser = require("./components/FileChooser").default;
	const FileViewer = require("./components/FileViewer").default;
	const MessageDialog = require("./components/MessageDialog").default;

	let userPreferences = new UserPreferences();

	export default {
		components: {
			FileChooser,
			FileViewer,
			MessageDialog
		},
		data() {
			return {
				tabs: [],
				currentTab: null,
				showMessageDialog: false,
				messageDialogTitle: '',
				messageDialogMessage: '',
				isDark: true
			}
		},
		async mounted() {
			this.$vuetify.theme.global.name = 'dark';
			const files = await userPreferences.getFiles();

			for (const file of files) {
				if (fs.existsSync(file.path)) {
					let tab = new Tab(file.name, file.path, FileSettings.createFromSettings(file.settings));

					this.tabs.push(tab);
				}
				else {
					await userPreferences.removeFile(file.path);
				}
			}

			const args = window.electron.getGlobal('arguments');
			if (args && args.file) {
				const file = args.file;
				try {
					await new OpenNewFileCommand(
						file,
						this.tabs,
						userPreferences
					)
					.execute();
				}
				catch(error) {
					this.showFileNotFoundMessageDialog(file);
				}
			}

			if (this.tabs.length === 0) {
				this.tabs.push(new Tab(this.$t("new-file")));
			}

			// Ativa automaticamente a primeira aba
			if (this.tabs.length > 0) {
				this.currentTab = 'tab' + this.tabs[0].id;
			}
		},
		methods: {
			toggleTheme() {
				this.$vuetify.theme.global.name = this.isDark ? 'dark' : 'light';
			},
			newTab() {
				if(this.tabs.length < 5) {
					const newTab = new Tab(this.$t("new-file"));
					this.tabs.push(newTab);
					// Ativa automaticamente a nova aba
					this.currentTab = 'tab' + newTab.id;
				}
			},
			async closeTab(index) {
				await userPreferences.removeFile(this.tabs[index].filePath);

				this.tabs.splice(index, 1);

				// Ativa automaticamente outra aba após fechar
				if (this.tabs.length > 0) {
					// Se fechou a última aba, ativa a nova última
					const newIndex = index >= this.tabs.length ? this.tabs.length - 1 : index;
					this.currentTab = 'tab' + this.tabs[newIndex].id;
				}
			},
			showCloseButton() {
				return this.tabs.length > 1
			},
			async onFileChanged(event, tab) {
				if (event.target.files.length > 0) {
					const file = event.target.files[0];
					const selectedFileName = file.name;
					const selectedFilePath = file.path;
					const fileSettings = new FileSettings();

					// Vue 3 reactivity works without $set
					tab.fileName = selectedFileName;
					tab.filePath = selectedFilePath;
					tab.fileSettings = fileSettings;

					await userPreferences.addFile(selectedFileName, selectedFilePath, fileSettings);

					// Garante que a aba está ativa após selecionar arquivo
					this.currentTab = 'tab' + tab.id;
				}
			},
			fileNotFoundErrorHandler(event) {
				this.showFileNotFoundMessageDialog(event.file);
			},
			showFileNotFoundMessageDialog(file) {
				this.showMessageDialog = true;
				this.messageDialogTitle = this.$t("warning");
				this.messageDialogMessage = this.$t("file-no-exists", {filename: file});
			},
			closeMessageDialog() {
				this.showMessageDialog = false;
			},
			errorMessage(event) {
				this.showMessageDialog = true;
				this.messageDialogTitle = this.$t("warning");
				this.messageDialogMessage = event.message
			}
		}
	}
</script>

<style>
.tabs-header-wrapper {
	display: flex;
	align-items: center;
	width: 100%;
	border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
	background-color: inherit;
}

.tabs-main {
	flex: 1 1 auto;
	min-width: 0;
}

.tabs-actions {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 12px;
	flex: 0 0 auto;
	height: 48px;
}

.v-tab {
	text-transform: uppercase !important;
	min-width: 90px;
	max-width: 250px;
}

.tab-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 180px;
	display: inline-block;
}

.close-btn {
	margin-left: 4px !important;
	opacity: 0.7;
}

.close-btn:hover {
	opacity: 1;
}

.add-btn {
	flex-shrink: 0;
}

.switch-theme {
	margin: 0 !important;
	padding: 0 !important;
	flex-shrink: 0;
}

/* Remove extra padding/margin from v-window */
.v-window {
	margin: 0 !important;
	padding: 0 !important;
}

.v-window-item {
	margin: 0 !important;
	padding: 0 !important;
}
</style>