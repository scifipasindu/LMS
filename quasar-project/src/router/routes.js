const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
    ],
  },

  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'register', component: () => import('pages/RegisterPage.vue') }
    ],
  },

  {
    path: '/dashboard',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue') },
      { path: 'profile', component: () => import('pages/ProfilePage.vue') },

      // General
      { path: 'pages', component: () => import('pages/GenericPage.vue') },
      { path: 'guides', component: () => import('pages/GuidesPage.vue') },

      // Academic
      { path: 'classes', component: () => import('pages/ClassesPage.vue') },
      { path: 'subjects', component: () => import('pages/SubjectsPage.vue') },
      { path: 'institutes', component: () => import('pages/InstitutesPage.vue') },

      // Management
      { path: 'reports', component: () => import('pages/ReportsPage.vue') },
      { path: 'payments', component: () => import('pages/PaymentsPage.vue') },
      { path: 'permissions', component: () => import('pages/PermissionsPage.vue'), meta: { role: 'admin' } },

      // Config
      { path: 'settings', component: () => import('pages/SettingsPage.vue'), meta: { role: 'admin' } },

      // Old
      { path: 'dashboard/assignments', component: () => import('pages/AssignmentsPage.vue') },
      { path: 'course/:id/learn', component: () => import('pages/CoursePlayerPage.vue') }
    ],
    meta: { requiresAuth: true }
  },

  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      { path: '', component: () => import('pages/AdminDashboardPage.vue') },
      { path: 'users', component: () => import('pages/AdminPage.vue') },
      { path: 'courses', component: () => import('pages/AdminCoursesPage.vue') },
      { path: 'settings', component: () => import('pages/AdminPage.vue') } // Placeholder
    ],
    meta: { requiresAuth: true, role: 'admin' }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
