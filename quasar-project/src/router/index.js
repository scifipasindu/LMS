import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Auth & Role Guard
  Router.beforeEach(async (to, from, next) => {
    
    // --- MAINTENANCE MODE CHECK ---
    // Allow direct access to maintenance page to avoid loops
    if (to.path !== '/maintenance') {
        const { supabase } = await import('boot/supabase')
        
        try {
          // Fetch Settings
          const { data: settings, error } = await supabase
               .from('system_settings')
               .select('value')
               .eq('key', 'config')
               .single()

          if (!error && settings?.value?.general?.maintenanceMode === true) {
               // Check if user is admin (allow admins to bypass)
               const { data: { user } } = await supabase.auth.getUser()
               let isAdmin = false
               
               if (user) {
                   const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                   
                   if (profile?.role === 'admin') isAdmin = true
               }

               // If not admin and not trying to login -> Redirect to Maintenance
               if (!isAdmin && to.path !== '/login') {
                   // Avoid infinite redirect if already going there
                   next('/maintenance')
                   return
               }
          }
        } catch (err) {
          console.error('Maintenance Check Failed:', err)
          // Default to allowing access if check fails to avoid lockout
        }
    }

    // Requires Auth check
    if (to.matched.some(record => record.meta.requiresAuth)) {
      const { supabase } = await import('boot/supabase')
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }

      // Check Role
      const requiredRole = to.meta.role
      if (requiredRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const userRole = profile?.role
        const allowed = Array.isArray(requiredRole) 
            ? requiredRole.includes(userRole) 
            : userRole === requiredRole

        if (!allowed) {
          next('/dashboard') // Access Denied
          return
        }
      }
    }
    next()
  })

  return Router
})
