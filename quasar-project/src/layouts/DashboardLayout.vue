<template>
  <q-layout view="lHh Lpr lFf" :class="$q.dark.isActive ? 'bg-dark-page' : 'bg-grey-1'">
    
    <!-- Modern Header -->
    <q-header 
      :class="$q.dark.isActive ? 'bg-dark-glass backdrop-blur text-white' : 'bg-white backdrop-blur text-dark'" 
      class="q-py-xs" 
      :style="$q.dark.isActive ? 'border-bottom: 1px solid rgba(255,255,255,0.05);' : 'border-bottom: 1px solid rgba(0,0,0,0.05);'"
    >
      <q-toolbar>
        <q-btn flat dense round icon="menu_open" aria-label="Menu" @click="toggleLeftDrawer" class="q-mr-md" color="accent" />

        <q-toolbar-title class="text-weight-bold row items-center">
           <span class="text-primary">Online</span>Class
        </q-toolbar-title>

        <!-- Search Bar (Desktop) -->
        <div class="gt-xs q-mx-md" style="flex: 1; max-width: 400px;">
           <q-input dense filled v-model="search" placeholder="Search courses, teachers..." class="search-input" :dark="$q.dark.isActive">
              <template v-slot:prepend>
                <q-icon name="search" :color="$q.dark.isActive ? 'grey-6' : 'grey-8'" />
              </template>
           </q-input>
        </div>

        <q-btn flat dense no-caps icon="home" label="Home" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'" class="q-mr-sm gt-xs" type="a" href="/" target="_blank" />
        


        <q-btn flat round dense icon="notifications_none" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'" class="q-mr-sm">
           <q-badge color="accent" floating rounded dot />
        </q-btn>
        
        <q-btn flat round dense no-caps class="q-ml-sm">
           <q-avatar size="32px">
              <img :src="userAvatar || 'https://cdn.quasar.dev/img/boy-avatar.png'">
           </q-avatar>
           <q-menu auto-close :dark="$q.dark.isActive" :class="$q.dark.isActive ? 'bg-dark-glass backdrop-blur' : 'bg-white backdrop-blur'" :style="$q.dark.isActive ? 'border: 1px solid rgba(255,255,255,0.1)' : 'border: 1px solid rgba(0,0,0,0.1)'">
              <q-list style="min-width: 150px">
                <q-item clickable to="/dashboard/profile">
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable to="/dashboard/settings">
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-separator :dark="$q.dark.isActive" />
                <q-item clickable class="text-negative" @click="handleLogout">
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
           </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Glassmorphism Sidebar -->
    <q-drawer 
      show-if-above 
      v-model="leftDrawerOpen" 
      side="left" 
      
      :class="$q.dark.isActive ? 'bg-dark-sidebar' : 'bg-white'"
      style="border-right: 1px solid rgba(0,0,0,0.05);"
      :width="260"
      :breakpoint="700"
    >
      <div class="q-pa-lg flex flex-center q-mb-md">
         <img v-if="currentLogo" :key="$q.dark.isActive" :src="currentLogo" style="height: 45px; object-fit: contain;" />
         <div v-else class="text-h6 text-primary text-weight-bold">Online<span :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Class</span></div>
      </div>
      
      <div class="q-px-md" style="padding-bottom: 100px;">
        <!-- GENERAL -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">General</div>
        <q-list class="q-gutter-y-xs q-mb-md">
          <q-item clickable v-ripple to="/dashboard" active-class="active-item" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          <q-item v-if="isAdmin" clickable v-ripple to="/dashboard/pages" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="article" />
            </q-item-section>
            <q-item-section>Pages</q-item-section>
          </q-item>
          <q-item v-if="isAdmin" clickable v-ripple to="/dashboard/guides" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="help_outline" />
            </q-item-section>
            <q-item-section>Guides</q-item-section>
          </q-item>
        </q-list>

        <!-- ACADEMIC -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">Academic</div>
        <q-list class="q-gutter-y-xs q-mb-md">
          <q-item clickable v-ripple to="/dashboard/classes" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="monitor" />
            </q-item-section>
            <q-item-section>Classes</q-item-section>
          </q-item>
          <q-item v-if="isAdmin" clickable v-ripple to="/dashboard/subjects" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="menu_book" />
            </q-item-section>
            <q-item-section>Subjects</q-item-section>
          </q-item>
          <q-item v-if="isAdmin" clickable v-ripple to="/dashboard/institutes" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="domain" />
            </q-item-section>
            <q-item-section>Institutes</q-item-section>
          </q-item>
          <q-item v-if="isAdmin" clickable v-ripple to="/admin/courses" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="video_library" />
            </q-item-section>
            <q-item-section>Manage Courses</q-item-section>
          </q-item>
        </q-list>

        <!-- MANAGEMENT -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">Management</div>
        <q-list class="q-gutter-y-xs q-mb-md">
          <q-item v-if="isAdmin" clickable v-ripple to="/dashboard/reports" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="bar_chart" />
            </q-item-section>
            <q-item-section>Reports</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/dashboard/payments" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="payments" />
            </q-item-section>
            <q-item-section>Payments</q-item-section>
          </q-item>
          <q-item v-if="isAdmin" clickable v-ripple to="/dashboard/permissions" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="lock" />
            </q-item-section>
            <q-item-section>Permissions</q-item-section>
          </q-item>
        </q-list>

        <!-- USERS (Admin Only) -->
        <div v-if="isAdmin">
            <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">Users</div>
            <q-list class="q-gutter-y-xs q-mb-md">
              <q-item clickable v-ripple to="/admin/users?role=admin" active-class="active-item">
                <q-item-section avatar>
                  <q-icon name="admin_panel_settings" />
                </q-item-section>
                <q-item-section>Admins</q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/admin/users?role=teacher" active-class="active-item">
                <q-item-section avatar>
                  <q-icon name="school" />
                </q-item-section>
                <q-item-section>Instructors</q-item-section>
              </q-item>
              <q-item clickable v-ripple to="/admin/users?role=student" active-class="active-item">
                <q-item-section avatar>
                  <q-icon name="face" />
                </q-item-section>
                <q-item-section>Students</q-item-section>
              </q-item>
            </q-list>
        </div>

        <!-- CONFIG -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">Config</div>
        <q-list class="q-gutter-y-xs">
          <q-item v-if="isAdmin" clickable v-ripple to="/dashboard/settings" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>
        </q-list>
      </div>
      
      <!-- User Mini Profile at bottom -->
      <div class="absolute-bottom q-pa-md">
         <div class="glass-card-mini row items-center q-pa-sm">
            <q-avatar size="36px" class="q-mr-sm">
               <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
            <div class="column">
               <div class="text-subtitle2 text-white leading-tight">{{ userRole }}</div>
               <div class="text-caption text-accent" style="font-size: 10px;">PRO MEMBER</div>
            </div>
         </div>
      </div>
    </q-drawer>

    <q-page-container class="bg-dark-page">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue' // removed computed
import { useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)
const search = ref('')
const isAdmin = ref(false)

const userRole = ref('Student')
const userAvatar = ref('')

const logoSettings = ref({ dark: '', light: '' })
const currentLogo = ref('')

// Watch for theme changes or settings load
watch([() => $q.dark.isActive, logoSettings], () => {
   const isDark = $q.dark.isActive
   currentLogo.value = isDark ? logoSettings.value.dark : (logoSettings.value.light || logoSettings.value.dark)
}, { deep: true, immediate: true })



onMounted(async () => {
   checkRole()
   await fetchSettings() // await ensures settings load before we rely on them, triggering watch once loaded
})

const fetchSettings = async () => {
   const { data } = await supabase
     .from('system_settings')
     .select('value')
     .eq('key', 'config')
     .single()
     
   if (data?.value?.general) {
      logoSettings.value.dark = data.value.general.logoUrl || ''
      logoSettings.value.light = data.value.general.logoUrlLight || ''
      // Manually trigger immediate update after fetch
      const isDark = $q.dark.isActive
      currentLogo.value = isDark ? logoSettings.value.dark : (logoSettings.value.light || logoSettings.value.dark)
   }
}

const checkRole = async () => {
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
       const { data: profile } = await supabase
         .from('profiles')
         .select('role, avatar_url')
         .eq('id', user.id)
         .single()
         
       if (profile) {
           const roleMap = {
              'admin': 'Admin',
              'teacher': 'Instructor',
              'student': 'Student'
           }
           userRole.value = roleMap[profile.role] || 'User'; userAvatar.value = profile.avatar_url;
           
           if (profile.role === 'admin') {
               isAdmin.value = true
           }
       }
   }
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  $q.notify({ type: 'info', message: 'Logged out successfully' })
  router.push('/login')
}
</script>

<style scoped lang="scss">
.bg-dark-glass {
  background: rgba(10, 9, 12, 0.8) !important;
}

.bg-dark-sidebar {
  background: #050505 !important;
  border-right: 1px solid rgba(255,255,255,0.05);
}

.bg-dark-page {
  background: #000000 !important;
}

.backdrop-blur {
  backdrop-filter: blur(12px);
}

.search-input :deep(.q-field__control) {
  background: rgba(255,255,255,0.05) !important;
  border-radius: 8px;
  border: none;
}
body.body--light .search-input :deep(.q-field__control) {
    background: #f5f5f5 !important;
    color: #333;
}

.active-item {
  background: linear-gradient(90deg, rgba($primary, 0.15) 0%, transparent 100%);
  color: $primary !important;
  border-left: 3px solid $primary;
  
  .q-icon {
     color: $primary;
  }
}

.q-item {
  border-radius: 0 8px 8px 0;
  transition: all 0.3s;
}

body.body--dark .q-item {
    color: #a0a0a0;
    &:hover {
        color: white;
        background: rgba(255,255,255,0.02);
    }
}

body.body--light .q-item {
    color: #666;
    &:hover {
        color: $primary;
        background: rgba($primary, 0.05);
    }
}

.hover-negative:hover {
  color: $negative !important;
  background: rgba($negative, 0.1) !important;
  .q-icon { color: $negative; }
}

.glass-card-mini {
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
}

body.body--light .glass-card-mini {
    background: white;
    border: 1px solid rgba(0,0,0,0.05);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

body.body--light .glass-card-mini .text-subtitle2 {
    color: #333 !important;
}
</style>
