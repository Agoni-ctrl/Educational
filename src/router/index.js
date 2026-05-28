import { createRouter, createWebHistory } from 'vue-router'
import MainHome from '../components/MainHome.vue'
import CommunityView from '../views/CommunityView.vue'
import AssistantView from '../views/AssistantView.vue'
import ProfileView from '../views/ProfileView.vue'
import FeaturesView from '../views/FeaturesView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: MainHome },
    { path: '/features', name: 'features', component: FeaturesView },
    { path: '/assistant', name: 'assistant', component: AssistantView },
    { path: '/community', name: 'community', component: CommunityView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/about', name: 'about', component: AboutView },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
