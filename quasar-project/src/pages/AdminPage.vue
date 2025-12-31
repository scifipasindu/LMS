<template>
  <q-page class="q-pa-lg text-white">
    <div class="row justify-between items-center q-mb-lg">
      <h4 class="text-h4 text-weight-bold q-my-none">User Management</h4>
      <!-- Add User removed as it requires Cloud Functions -->
    </div>
    
    <q-card class="bg-dark-card">
       <q-table
          :rows="users"
          :columns="columns"
          row-key="id"
          dark
          flat
          :loading="loading"
          class="bg-transparent"
       >
          <template v-slot:body-cell-role="props">
             <q-td :props="props">
                <q-chip 
                  :color="getRoleColor(props.row.role)" 
                  text-color="white" 
                  dense 
                  class="text-capitalize"
                >
                   {{ props.row.role }}
                </q-chip>
             </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
             <q-td :props="props">
                <q-btn flat round dense icon="edit" color="primary" @click="editUser(props.row)">
                   <q-tooltip>Edit Profile</q-tooltip>
                </q-btn>
                <q-btn flat round dense icon="delete" color="negative" @click="deleteUser(props.row.id)">
                   <q-tooltip>Delete Profile</q-tooltip>
                </q-btn>
             </q-td>
          </template>
       </q-table>
    </q-card>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="editDialog" persistent>
       <q-card class="bg-dark text-white" style="min-width: 400px">
          <q-card-section>
             <div class="text-h6">Edit Profile</div>
          </q-card-section>
          
          <q-card-section class="q-pt-none q-gutter-y-md" v-if="selectedUser">
             <q-input filled dark v-model="selectedUser.full_name" label="Full Name" />
             
             <!-- Password update requires Cloud Functions, removed. -->

             <q-select 
               filled dark 
               v-model="selectedUser.role" 
               :options="roleOptions" 
               label="Role" 
             />
          </q-card-section>
          
          <q-card-actions align="right" class="text-primary">
             <q-btn flat label="Cancel" v-close-popup />
             <q-btn flat label="Save Changes" @click="updateUser" :loading="processing" />
          </q-card-actions>
       </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const users = ref([])
const loading = ref(false)
const processing = ref(false)

// Edit State
const editDialog = ref(false)
const selectedUser = ref(null)

const roleOptions = ['student', 'teacher', 'admin']

const columns = [
  { name: 'full_name', label: 'Name', align: 'left', field: 'full_name', sortable: true },
  { name: 'role', label: 'Role', align: 'center', field: 'role', sortable: true },
  { name: 'updated_at', label: 'Last Active', align: 'right', field: row => new Date(row.updated_at).toLocaleDateString() },
  { name: 'actions', label: 'Actions', align: 'right' }
]

onMounted(() => {
   fetchUsers()
})

const fetchUsers = async () => {
   loading.value = true
   const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      
   if (error) {
       console.error(error)
       $q.notify({ type: 'negative', message: 'Failed to fetch users' })
   } else {
       // Filter client-side if a specific role is requested
       const roleFilter = route.query.role
       if (roleFilter) {
           users.value = data.filter(u => u.role === roleFilter)
       } else {
           users.value = data
       }
   }
   loading.value = false
}

// Watch for route changes to re-fetch/re-filter if user clicks different sidebar link
watch(() => route.query.role, () => {
   fetchUsers()
})

const getRoleColor = (role) => {
   if (role === 'admin') return 'negative'
   if (role === 'teacher') return 'secondary'
   return 'primary'
}

const editUser = (user) => {
   selectedUser.value = { ...user }
   editDialog.value = true
}

const updateUser = async () => {
   processing.value = true
   try {
       // Only update Profile table (Name, Role)
       // Cannot update Password/Email without Backend Function
       const { error } = await supabase
          .from('profiles')
          .update({ 
              full_name: selectedUser.value.full_name,
              role: selectedUser.value.role
          })
          .eq('id', selectedUser.value.id)

       if (error) throw error

       $q.notify({ type: 'positive', message: 'User profile updated' })
       editDialog.value = false
       fetchUsers()
   } catch (err) {
       console.error(err)
       $q.notify({ type: 'negative', message: 'Error updating user' })
   } finally {
       processing.value = false
   }
}

const deleteUser = async (id) => {
    if (!confirm('Are you sure? This will remove the User Profile only (Login may still exist).')) return
    
    try {
        const { error } = await supabase
           .from('profiles')
           .delete()
           .eq('id', id)
           
        if (error) throw error

        $q.notify({ type: 'positive', message: 'Profile removed successfully' })
        fetchUsers()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to delete profile' })
    }
}
</script>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); }
</style>
