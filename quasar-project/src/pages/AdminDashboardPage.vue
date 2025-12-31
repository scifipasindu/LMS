<template>
  <q-page class="q-pa-lg text-white">
    <h4 class="text-h4 text-weight-bold q-mb-lg">Admin Dashboard</h4>
    
    <div class="row q-col-gutter-lg">
       <div class="col-12 col-md-3">
          <q-card class="bg-dark-card text-center q-pa-md">
             <div class="text-h2 text-weight-bold text-primary">3</div>
             <div class="text-subtitle1 text-grey-5">Total Users</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="bg-dark-card text-center q-pa-md">
             <div class="text-h2 text-weight-bold text-secondary">0</div>
             <div class="text-subtitle1 text-grey-5">Active Sessions</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="bg-dark-card text-center q-pa-md">
             <div class="text-h2 text-weight-bold text-accent">$0</div>
             <div class="text-subtitle1 text-grey-5">Revenue (Today)</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="bg-dark-card text-center q-pa-md">
             <div class="text-h2 text-weight-bold text-white">1</div>
             <div class="text-subtitle1 text-grey-5">Admin Users</div>
          </q-card>
       </div>
    </div>
    
    <div class="row q-mt-xl">
       <div class="col-12">
          <h5 class="text-h5 text-weight-bold q-mb-md">Quick Actions</h5>
          <q-btn unelevated color="primary" label="Manage Users" to="/admin/users" class="q-mr-md" />
          <q-btn outline color="white" label="System Settings" to="/admin/settings" />
       </div>
    </div>
  </q-page>
</template>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; }
</style>
