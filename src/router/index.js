import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    // {
    //   path: '/',
    //   name: 'Home',
    //   component: () => import('../Pages/Home.vue')
    // },
    {
        path: '/plugins/:code',
        name: 'Plugins',
        component: () => import('../Pages/Plugins/Plugins.vue'), 
        props: true
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
