import 'typeface-roboto';
import 'vue-json-viewer/style.css';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import '../css/vuetify-custom.css';
import '../css/main.css';
import '../css/main-dark.css';
import en from './locales/en.json';
import es from './locales/es.json';

import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import JsonViewer from 'vue-json-viewer';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue';

const i18n = createI18n({
  legacy: false,
  locale: navigator.language,
  fallbackLocale: 'en',
  messages: {
    en, es
  },
  silentTranslationWarn: true
});

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VBtn: {
      style: 'font-family: Roboto, sans-serif;',
    },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#3CC896',
          secondary: '#B7BFD1',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#3CC896',
          secondary: '#B7BFD1',
          background: '#1E1E1E',
          surface: '#1E1E1E',
        },
      },
    },
  },
});

const app = createApp(App);

app.use(i18n);
app.use(vuetify);
app.use(JsonViewer);

app.mount('#app');

document.addEventListener('dragover', (event) => {
  event.preventDefault();
  return false;
}, false);

document.addEventListener('drop', (event) => {
  event.preventDefault();
  return false;
}, false);
