let instance = null;

module.exports = class UserPreferences {
  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  async addFile(fileName, filePath, fileSettings) {
    const files = await this.getFiles();

    files.push({ name: fileName, path: filePath, settings: fileSettings });

    await window.store.set('files', files);
  }

  async removeFile(fileToRemove) {
    let files = await this.getFiles();

    files = files.filter((file) => file.path !== fileToRemove);

    await window.store.set('files', files);
  }

  async getFiles() {
    return await window.store.get('files', []);
  }

  async saveFileSettings(filePath, settings) {
    const files = (await this.getFiles()).map((file) => {
      if (file.path === filePath) {
        file.settings = Object.assign(file.settings, settings);
      }

      return file;
    });

    await window.store.set('files', files);
  }
};
