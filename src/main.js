import './assets/main.css'
import './styles/design-tokens.css'
import './styles/animations.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
