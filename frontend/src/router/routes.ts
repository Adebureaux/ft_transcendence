import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/',             component: () => import('pages/IndexPage.vue'    ) },
      { path: '/conversation', component: () => import('pages/Conversation.vue' ) },
      { path: '/profil',       component: () => import('pages/Profil.vue'       ) },
      { path: '/usercard',     component: () => import('pages/UserCardTest.vue' ) },
      { path: '/upload',       component: () => import('pages/UploadTest.vue'   ) },
      { path: '/feeddb',       component: () => import('pages/FeedDB.vue'       ) },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
