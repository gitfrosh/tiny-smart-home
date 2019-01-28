import Settings from 'pages/Settings';

const routes = [
  {
    path: '/',
    name: 'home',
    // component: () => import('layouts/MyLayout.vue'),
    redirect: { name: 'dashboard' }
  },
  {
    path: '/dashboard',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      {
        path: '', name: 'dashboard',
        component: () => import('pages/Index.vue')
      },
    ],
  }, {
    path: '/settings',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      {
        path: '', name: 'settings',
        component: () => import('pages/Settings.vue')
      },
    ],
  }
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  });
}

export default routes;
