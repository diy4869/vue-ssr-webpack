import Vue from 'vue'
import App from './App.vue'
import { createRouter } from '@/router/index'
import { createStore } from '@/store/index'

export function createApp () {
    const router = createRouter()
    const store = createStore()

    const app = new Vue({
        router,
        store,
        render: h => h(App)
    })

    return {
        app,
        store,
        router
    }
}
