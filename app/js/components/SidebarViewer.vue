<template>
  <v-navigation-drawer
    v-model="drawer"
    absolute
    @update:model-value="changedDrawer"
    location="right"
    :width="jsonActive ? 1000 : 650"
    class="logger-viewer"
    temporary
  >
    <v-card class="mx-auto" elevation="0">
      <v-card-title class="sidebar-gradient text-white">
        <span class="title">Log - {{ itemSelected.uniqueKey }}</span>
        <v-spacer></v-spacer>
        <v-icon @click="drawer = false" class="text-white">mdi-close</v-icon>
      </v-card-title>
      <v-card-text class="py-0">
        <v-row>
          <v-col>
            <v-timeline
              density="compact"
              class="timeline max-min-height-timeline"
            >
              <v-timeline-item
                v-for="(item, index) in itemSelected.items"
                :key="item.uniqueKey + item.timestamp + index"
                fill-dot
                size="small"
                @click="selectJsonView(item.data, index)"
              >
                <template v-slot:icon>
                  <div
                    class="content-log"
                    :class="item.status.toLowerCase() + '-background'"
                  >
                    {{ formatDate(item.timestamp) }}
                  </div>
                </template>
                <v-card class="log-text">
                  {{ item.name }}
                  <v-spacer></v-spacer>
                  <v-icon
                    v-if="index === activeIndex"
                    size="small"
                    :class="item.status.toLowerCase() + '-text'"
                    >mdi-checkbox-blank-circle</v-icon
                  >
                </v-card>
              </v-timeline-item>
            </v-timeline>
          </v-col>
          <v-col v-if="jsonActive">
            <json-viewer
              class="max-min-height-timeline"
              :value="jsonValue"
              copyable
              boxed
              expanded
            ></json-viewer>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import { parseISO } from 'date-fns';
import { format } from 'date-fns-tz';

export default {
  props: ['itemSelected'],
  data() {
    return {
      jsonActive: false,
      jsonValue: '',
      drawer: false,
      activeIndex: null,
    };
  },
  methods: {
    formatDate(date) {
      const parsedDate = parseISO(date);
      return format(parsedDate, 'dd/MM/yyyy HH:mm:ss', {
        timeZone: 'America/Sao_Paulo',
      });
    },
    selectJsonView(data, index) {
      this.jsonValue = data || 'null';
      this.activeIndex = index;
      this.jsonActive = true;
    },
    active() {
      this.drawer = true;
      this.jsonValue = '';
      this.activeIndex = null;
      this.jsonActive = false;
    },
    changedDrawer(value) {
      if (!value) {
        this.jsonValue = '';
        this.activeIndex = null;
        this.jsonActive = false;
      }
    },
  },
};
</script>

<style>
.logger-viewer .v-card,
.logger-viewer .v-card-text {
  background-color: inherit !important;
}

/* Remove margem negativa que causa corte visual */
.logger-viewer .v-card.mx-auto {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Corrige header verde - sem corte nas laterais */
.sidebar-gradient {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 16px 24px !important;
  margin: 0 !important;
  width: 100% !important;
}

.sidebar-gradient .title {
  flex: 1;
  margin-right: 16px;
}

.sidebar-gradient .v-icon {
  cursor: pointer;
  margin-left: 16px;
}

/* Recua timeline e caixinhas de data/hora para evitar corte visual */
.logger-viewer .timeline {
  padding-left: 32px !important;
  padding-right: 16px !important;
}

.logger-viewer .v-timeline-item {
  margin-left: 16px;
  margin-bottom: 8px; /* Controla o espaçamento vertical entre os itens */
}

/* Garante espaçamento horizontal consistente entre caixinha e card */
.logger-viewer .v-timeline-item .v-timeline-item__body {
  justify-content: flex-start !important;
  margin-left: 48px !important;
  padding-left: 0 !important;
}

.content-log {
  width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
  position: relative;
  padding: 10px;
  border-radius: 3px;
  margin-left: 0;
  flex-shrink: 0;
}

.log-text {
  padding: 20px;
  display: flex;
}

.timeline {
  overflow: auto;
}

.timeline .v-timeline-item {
  cursor: pointer;
}

.timeline .v-timeline-item__body {
  margin-left: 15px;
}

.jv-code.open.boxed {
  max-height: 77vh !important;
}
</style>
