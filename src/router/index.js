import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        name: 'Home',
        path: '/',
        redirect: 'recommend'
    },
    {
        name: 'recommend',
        path: '/recommend',
        component: () => import('@/views/recommend.vue'),
        children: [
            {
                name: 'album',
                path: ':id',
                component: () => import('@/views/album.vue')
            }
        ]
    },
    {
        name: 'singer',
        path: '/singer',
        component: () => import('@/views/singer.vue'),
        children: [
            {
                path: ':id',
                component: () => import('@/views/singer-detail.vue')
            }
        ]
    },
    {
        name: 'top-list',
        path: '/top-list',
        component: () => import('@/views/top-list.vue'),
        children: [
            {
                name: 'top-detail',
                path: ':id',
                component: () => import('@/views/top-detail.vue')
            }
        ]
    },
    {
        name: 'search',
        path: '/search',
        component: () => import('@/views/search.vue'),
        children: [
            {
                path: ':id',
                component: () => import('@/views/singer-detail.vue')
            }
        ]
    },
    {
        name: 'userCenter',
        path: '/user',
        components: {
            user: () => import('@/views/user-center.vue')
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
