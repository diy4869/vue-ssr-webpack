import Vue from 'vue'
import App from '../App.vue'
import Router from 'vue-router'

Vue.use(Router)

export function createRouter () {
  return new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'root',
            component: () => import('@/App.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/login.vue')
        }
    ]
  })
}