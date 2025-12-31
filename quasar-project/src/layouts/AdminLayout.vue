<template>
  <q-layout view="lHh Lpr lFf" class="bg-dark-page">
    <q-header class="bg-dark-glass backdrop-blur text-white q-py-xs" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
       <q-toolbar>
         <q-toolbar-title class="text-weight-bold">
            <span class="text-accent">Admin</span>Console
         </q-toolbar-title>
         <q-btn flat dense icon="logout" label="Exit to App" to="/dashboard" />
       </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" class="bg-dark-sidebar" :width="260">
       <div class="q-pa-lg flex flex-center q-mb-md">
         <img src="~assets/logo_footer.png" style="height: 45px; opacity: 0.9;" />
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
          <q-item clickable v-ripple to="/dashboard/pages" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="article" />
            </q-item-section>
            <q-item-section>Pages</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/dashboard/guides" active-class="active-item">
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
        </q-list>

        <!-- MANAGEMENT -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">Management</div>
        <q-list class="q-gutter-y-xs q-mb-md">
          <q-item clickable v-ripple to="/dashboard/reports" active-class="active-item">
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
          <q-item clickable v-ripple to="/dashboard/permissions" active-class="active-item">
            <q-item-section avatar>
              <q-icon name="lock" />
            </q-item-section>
            <q-item-section>Permissions</q-item-section>
          </q-item>
        </q-list>

        <!-- USERS -->
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

        <!-- CONFIG -->
        <div class="text-caption text-grey-6 q-mb-sm q-ml-sm text-weight-bold text-uppercase">Config</div>
        <q-list class="q-gutter-y-xs">
          <q-item clickable v-ripple to="/dashboard/settings" active-class="active-item">
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
import { ref } from 'vue'
const leftDrawerOpen = ref(true)
</script>

<style scoped lang="scss">
.bg-dark-glass { background: rgba(10, 9, 12, 0.8) !important; }
.bg-dark-page { background: #000000 !important; }
.bg-dark-sidebar { background: #050505 !important; border-right: 1px solid rgba(255,255,255,0.05); }
.backdrop-blur { backdrop-filter: blur(12px); }
.bg-white-5 { background: rgba(255,255,255,0.05); }
</style>
