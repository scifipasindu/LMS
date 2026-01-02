<template>
  <q-page class="q-pa-lg text-white">
    <div class="row justify-between items-center q-mb-lg">
       <h4 class="text-h4 text-weight-bold q-my-none">User Management</h4>
       <!-- Removed Add User Button - Users must Register themselves -->
    </div>
    
    <div class="q-pa-md bg-dark-card q-mb-md text-grey-5" style="border-radius: 8px; border-left: 4px solid var(--q-primary)">
        <q-icon name="info" size="sm" class="q-mr-sm"/>
        To add a new Admin or Teacher, ask them to <strong>Register</strong> first. Then find them here and update their <strong>Role</strong>.
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
                   {{ props.row.role ? props.row.role.toUpperCase() : 'STUDENT' }}
                </q-chip>
             </q-td>
          </template>

          <template v-slot:body-cell-status="props">
             <q-td :props="props">
                <q-chip :color="getStatusColor(props.row.status)" text-color="white" dense icon="verified_user">
                  {{ props.row.status ? props.row.status.toUpperCase() : 'PENDING' }}
                </q-chip>
             </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
             <q-td :props="props">
                <!-- Actions: Hide for Main Admin UNLESS valid Main Admin is logged in -->
                <div v-if="props.row.email !== MAIN_ADMIN_EMAIL || currentUserEmail === MAIN_ADMIN_EMAIL">
                    <q-btn v-if="props.row.status !== 'active'" flat round dense icon="check_circle" color="positive" @click="approveUser(props.row)">
                        <q-tooltip>Approve User</q-tooltip>
                    </q-btn>

                    <q-btn flat round dense icon="edit" color="primary" @click="editUser(props.row)">
                       <q-tooltip>Edit Profile</q-tooltip>
                    </q-btn>
                    <!-- Delete NEVER allowed for Main Admin -->
                    <q-btn v-if="props.row.email !== MAIN_ADMIN_EMAIL" flat round dense icon="delete" color="negative" @click="deleteUser(props.row.id)">
                       <q-tooltip>Delete Profile</q-tooltip>
                    </q-btn>
                </div>
                <div v-else class="text-grey-7 text-caption">Protected</div>
             </q-td>
          </template>
       </q-table>
    </q-card>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="editDialog" persistent>
       <q-card class="bg-dark text-white" style="min-width: 400px">
          <q-card-section>
             <div class="text-h6">Edit Role</div>
          </q-card-section>
          
          <q-card-section class="q-pt-none q-gutter-y-md" v-if="selectedUser">
             <!-- Full Name: Editable ONLY for Main Admin (Self) -->
             <q-input 
               filled dark 
               v-model="selectedUser.full_name" 
               label="Full Name" 
               :readonly="selectedUser.email !== MAIN_ADMIN_EMAIL" 
               :disable="selectedUser.email !== MAIN_ADMIN_EMAIL"
               :hint="selectedUser.email === MAIN_ADMIN_EMAIL ? 'You can edit your name' : 'User must update this themselves'" 
             />
             
             <q-input filled dark v-model="selectedUser.email" label="Email" readonly disable />

             <!-- Role: Disabled for Main Admin (Self) to prevent lockout -->
             <q-select 
               filled dark 
               v-model="selectedUser.role" 
               :options="roleOptions" 
               label="Role" 
               :readonly="selectedUser.email === MAIN_ADMIN_EMAIL"
               :disable="selectedUser.email === MAIN_ADMIN_EMAIL"
               :hint="selectedUser.email === MAIN_ADMIN_EMAIL ? 'Cannot demote Main Admin' : ''"
             />
          </q-card-section>
          
          <q-card-actions align="right" class="text-primary">
             <q-btn flat label="Cancel" v-close-popup />
             <q-btn flat label="Save Role" @click="updateUser" :loading="processing" />
          </q-card-actions>
       </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const users = ref([])
const loading = ref(false)
const processing = ref(false)
const currentUserEmail = ref('')

// CONSTANTS
const MAIN_ADMIN_EMAIL = 'janiruhansaga2029@gmail.com'

// Edit State
const editDialog = ref(false)
const selectedUser = ref(null)

// Role Options computed based on permissions
const roleOptions = computed(() => {
    // Only Main Admin can assign Admin/Staff roles
    if (currentUserEmail.value === MAIN_ADMIN_EMAIL) {
        return ['student', 'teacher', 'admin', 'staff']
    } else {
        return ['student', 'teacher']
    }
})

const columns = [
  { name: 'full_name', label: 'Name', align: 'left', field: 'full_name', sortable: true },
  { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
  { name: 'role', label: 'Role', align: 'center', field: 'role', sortable: true },
  { name: 'status', label: 'Status', align: 'center', field: 'status', sortable: true },
  { name: 'updated_at', label: 'Last Active', align: 'right', field: row => new Date(row.updated_at).toLocaleDateString() },
  { name: 'actions', label: 'Actions', align: 'right' }
]

onMounted(async () => {
   // Get Current User Email
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
       currentUserEmail.value = user.email
   }
   
   fetchUsers()
})

const fetchUsers = async () => {
   loading.value = true
   const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, email, status, updated_at, created_at')
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

// Watch for route changes to re-fetch/re-filter
watch(() => route.query.role, () => {
   fetchUsers()
})

const getRoleColor = (role) => {
   const r = role ? role.toLowerCase() : 'student'
   if (r === 'admin') return 'negative'
   if (r === 'teacher') return 'secondary'
   if (r === 'staff') return 'purple'
   return 'primary' 
}

const getStatusColor = (status) => {
    return status === 'active' ? 'positive' : 'warning'
}

const editUser = (user) => {
   selectedUser.value = { ...user }
   editDialog.value = true
}

const approveUser = async (user) => {
    try {
        const { error } = await supabase
           .from('profiles')
           .update({ status: 'active' })
           .eq('id', user.id)

        if (error) throw error
        
        $q.notify({ type: 'positive', message: 'User Account Approved! ✅' })
        fetchUsers()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to approve.' })
    }
}

// Validation before update
const updateUser = async () => {
    // Double check permission
    if (['admin', 'staff'].includes(selectedUser.value.role) && currentUserEmail.value !== MAIN_ADMIN_EMAIL && selectedUser.value.email !== MAIN_ADMIN_EMAIL) {
        $q.notify({ type: 'warning', message: 'Only Main Admin can assign Admin/Staff roles.' })
        return
    }

    processing.value = true
    try {
        // Update Profile Table ONLY
        const updates = { 
            role: selectedUser.value.role 
        }

        // If Main Admin is editing themselves, include Full Name update
        if (selectedUser.value.email === MAIN_ADMIN_EMAIL) {
            updates.full_name = selectedUser.value.full_name
        }

        const { error } = await supabase
           .from('profiles')
           .update(updates)
           .eq('id', selectedUser.value.id)

        if (error) throw error

        $q.notify({ type: 'positive', message: 'User role updated successfully' })
        editDialog.value = false
        fetchUsers()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Error updating role' })
    } finally {
        processing.value = false
    }
}

const deleteUser = async (id) => {
    if (!confirm('Are you sure? This will remove the User COMPLETELY (Login & Profile).')) return
    
    try {
        // Use RPC to delete from Auth Schema (Secure)
        const { error } = await supabase
           .rpc('delete_user_by_admin', { target_user_id: id })
           
        if (error) throw error

        $q.notify({ type: 'positive', message: 'User deleted successfully' })
        
        // Update Local State Immediately
        users.value = users.value.filter(u => u.id !== id)
        
        // Then re-fetch to strict sync
        fetchUsers()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to delete user: ' + err.message })
    }
}
</script>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); }
</style>
