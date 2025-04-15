import { createApp } from 'vue';
import './index.css';
import App from './App.vue';
import { OhVueIcon, addIcons } from 'oh-vue-icons';
import {
  CoLocationPin,
  IoChevronDownCircleSharp,
  IoChevronUpCircleSharp,
} from 'oh-vue-icons/icons';

addIcons(CoLocationPin, IoChevronUpCircleSharp, IoChevronDownCircleSharp);

createApp(App).component('VIcon', OhVueIcon).mount('#app');

Vue.component('v-icon', OhVueIcon);
