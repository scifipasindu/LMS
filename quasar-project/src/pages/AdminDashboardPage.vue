<template>
  <q-page class="q-pa-lg" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">
    <h4 class="text-h4 text-weight-bold q-mb-lg">Admin Dashboard</h4>
    
    <div class="row q-col-gutter-lg">
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold text-primary">3</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Total Users</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold text-secondary">0</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Active Sessions</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold text-accent">$0</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Revenue (Today)</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">1</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Admin Users</div>
          </q-card>
       </div>
    </div>
    
    <div class="row q-mt-xl">
       <div class="col-12">
          <h5 class="text-h5 text-weight-bold q-mb-md">Quick Actions</h5>
          <q-btn unelevated color="primary" label="Manage Users" to="/admin/users" class="q-mr-md" />
          <q-btn outline :color="$q.dark.isActive ? 'white' : 'primary'" label="System Settings" to="/admin/settings" />
       </div>
    </div>
  </q-page>
</template>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; }
</style>
