<template>
  <q-layout view="lHh Lpr lFf" :class="$q.dark.isActive ? 'bg-dark-page text-white' : 'bg-grey-1 text-dark'">
    <q-header :class="$q.dark.isActive ? 'bg-dark-glass text-white' : 'bg-white text-dark'" class="backdrop-blur q-py-xs" :style="$q.dark.isActive ? 'border-bottom: 1px solid rgba(255,255,255,0.05)' : 'border-bottom: 1px solid rgba(0,0,0,0.05)'">
      <q-toolbar>
         <q-toolbar-title class="text-weight-bold">
            <span class="text-accent">Admin</span>Console
         </q-toolbar-title>
         
         <q-btn flat dense icon="logout" label="Logout" @click="handleLogout" />
       </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" :class="$q.dark.isActive ? 'bg-dark-sidebar text-white' : 'bg-white text-dark'" :width="260">
       <div class="q-pa-lg flex flex-center q-mb-md">
         <img v-if="currentLogo" :key="$q.dark.isActive" :src="currentLogo" style="height: 45px; object-fit: contain;" />
         <div v-else class="text-h6 text-weight-bold"><span class="text-primary">Online</span><span :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Class</span></div>
       </div>
       
       <div class="q-px-md">
        <!-- GENERAL -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">General</div>
        <q-list class="q-gutter-y-xs q-mb-md">
          <q-item clickable v-ripple to="/dashboard" active-class="active-item exact">
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
          <q-item clickable v-ripple to="/dashboard/live-classes" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="live_tv" />
            </q-item-section>
            <q-item-section>Live Classes</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/dashboard/subjects" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="menu_book" />
            </q-item-section>
            <q-item-section>Subjects</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/dashboard/institutes" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="domain" />
            </q-item-section>
            <q-item-section>Institutes</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/admin/courses" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="video_library" />
            </q-item-section>
            <q-item-section>Courses & Lessons</q-item-section>
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

        <!-- USERS -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">Users</div>
        <q-list class="q-gutter-y-xs q-mb-md">
          <q-item v-if="isAdmin" clickable v-ripple to="/admin/users?role=admin" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>Admins</q-item-section>
          </q-item>
          <q-item v-if="isAdmin" clickable v-ripple to="/admin/users?role=staff" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="assignment_ind" />
            </q-item-section>
            <q-item-section>Staff</q-item-section>
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
    </q-drawer>

    <q-page-container>
       <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(true)
const isAdmin = ref(false)
const isStaff = ref(false)

const logoSettings = ref({ dark: '', light: '' })
const currentLogo = ref('')

// Watch for theme changes or settings load
watch([() => $q.dark.isActive, logoSettings], () => {
   const isDark = $q.dark.isActive
   currentLogo.value = isDark ? logoSettings.value.dark : (logoSettings.value.light || logoSettings.value.dark)
}, { deep: true, immediate: true })

onMounted(async () => {
   await checkRole()
   await fetchSettings()
})

const checkRole = async () => {
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
       const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
       if (profile) {
           if (profile.role === 'admin') isAdmin.value = true
           if (profile.role === 'staff') isStaff.value = true
       }
   }
}

const fetchSettings = async () => {
   const { data } = await supabase
     .from('system_settings')
     .select('value')
     .eq('key', 'config')
     .single()
     
   if (data?.value?.general) {
      logoSettings.value.dark = data.value.general.logoUrl || ''
      logoSettings.value.light = data.value.general.logoUrlLight || ''
      // Trigger update
      const isDark = $q.dark.isActive
      currentLogo.value = isDark ? logoSettings.value.dark : (logoSettings.value.light || logoSettings.value.dark)
   }
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  $q.notify({ type: 'info', message: 'Logged out successfully' })
  router.push('/login')
}
</script>

<style scoped lang="scss">
.bg-dark-glass { background: rgba(10, 9, 12, 0.8); }
.bg-dark-page { background: #000000; }
.bg-dark-sidebar { background: #050505; border-right: 1px solid rgba(255,255,255,0.05); }
.backdrop-blur { backdrop-filter: blur(12px); }
.bg-white-5 { background: rgba(255,255,255,0.05); }
</style>
