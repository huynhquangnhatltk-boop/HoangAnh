import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import './styles.css'; // optional

createApp(App).use(router).mount('#app');
