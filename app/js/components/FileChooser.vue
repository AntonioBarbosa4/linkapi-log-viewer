<template>
  <v-container
    class="file-chooser-container fill-height"
  >
    <v-row
      align="center"
      justify="center"
      class="fill-height flex-column"
    >
      <v-col cols="auto">
        <input
          ref="fileChooser"
          type="file"
          accept=".log"
          class="file-chooser"
          @change="onFileChanged"
        >
        <img
          class="log-file-format py-2"
          src="images/log-file.png"
        >
      </v-col>
      <v-col cols="auto">
        <v-btn
          size="large"
          color="primary"
          @click="openFileChooser"
        >
          {{ $t("choose-file") }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
	.file-chooser-container {
		height: 88vh;
	}

	.file-chooser {
		position: absolute;
		left: 0;
		top: 0;
		opacity: 0;
	}

	img.log-file-format {
		width: 200px;
		height: 200px;
		display: block;
	}
</style>

<script>
	export default {
		methods: {
			onFileChanged(event) {
				this.$emit('change', event);
			},
			async openFileChooser() {
				// Use Electron dialog instead of HTML file input to get full path
				const result = await window.dialog.openFile({
					properties: ['openFile'],
					filters: [
						{ name: 'Log Files', extensions: ['log'] }
					]
				});

				if (!result.canceled && result.filePaths.length > 0) {
					const filePath = result.filePaths[0];
					const fileName = window.node.path.basename(filePath);

					// Create a fake event object to maintain compatibility
					const fakeEvent = {
						target: {
							files: [{
								name: fileName,
								path: filePath
							}]
						}
					};

					this.$emit('change', fakeEvent);
				}
			}
		}
	}
</script>