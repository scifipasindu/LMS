<template>
  <q-page class="q-pa-lg" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">
    <div class="row justify-between items-center q-mb-lg">
       <h4 class="text-h4 text-weight-bold q-my-none">User Management</h4>
       <!-- Removed Add User Button - Users must Register themselves -->
    </div>
    
    <div class="q-pa-md q-mb-md" :class="$q.dark.isActive ? 'bg-dark-card text-grey-5' : 'bg-blue-1 text-primary'" style="border-radius: 8px; border-left: 4px solid var(--q-primary)">
        <q-icon name="info" size="sm" class="q-mr-sm"/>
        To add a new Admin or Teacher, ask them to <strong>Register</strong> first. Then find them here and update their <strong>Role</strong>.
    </div>

    <q-card :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
       <q-table
          :rows="users"
          :columns="columns"
          row-key="id"
          :dark="$q.dark.isActive"
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
                <div v-if="props.row.email !== MAIN_ADMIN_EMAIL">
                    <!-- Approve: MAIN ADMIN ONLY -->
                    <q-btn v-if="props.row.status !== 'active' && currentUserEmail === MAIN_ADMIN_EMAIL" flat round dense icon="check_circle" color="positive" @click="approveUser(props.row)">
                        <q-tooltip>Approve User</q-tooltip>
                    </q-btn>

                    <q-btn flat round dense icon="edit" color="primary" @click="editUser(props.row)" :disable="!canEdit(props.row)">
                       <q-tooltip>Edit Profile</q-tooltip>
                    </q-btn>
                    
                    <q-btn flat round dense icon="lock_reset" color="warning" @click="resetPassword(props.row)">
                       <q-tooltip>Send Password Reset Email</q-tooltip>
                    </q-btn>

                    <!-- Delete NEVER allowed for Main Admin -->
                    <!-- Delete Button: STRICTLY MAIN ADMIN ONLY -->
                    <q-btn v-if="currentUserEmail === MAIN_ADMIN_EMAIL" flat round dense icon="delete" color="negative" @click="confirmDelete(props.row)">
                       <q-tooltip>Delete Profile</q-tooltip>
                    </q-btn>
                </div>
                <div v-else class="text-caption" :class="$q.dark.isActive ? 'text-grey-7' : 'text-grey-5'">Protected</div>
             </q-td>
          </template>
       </q-table>
    </q-card>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="editDialog" persistent>
       <q-card style="min-width: 400px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
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
               :readonly="currentUserEmail !== MAIN_ADMIN_EMAIL"
               :disable="currentUserEmail !== MAIN_ADMIN_EMAIL"
               :hint="currentUserEmail !== MAIN_ADMIN_EMAIL ? 'Only Main Admin can change roles' : ''"
             />
          </q-card-section>
          
          <q-card-actions align="right" class="text-primary">
             <q-btn flat label="Cancel" v-close-popup />
             <q-btn flat label="Save Role" @click="updateUser" :loading="processing" />
          </q-card-actions>
       </q-card>
    </q-dialog>

  
    <!-- Security PIN Dialog -->
     <q-dialog v-model='pinDialog' persistent>
        <q-card style='min-width: 300px' :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
            <q-card-section>
                <div class='text-h6 text-negative'>Security Check</div>
                <div class='text-caption'>Enter your 6-digit Security PIN to proceed.</div>
            </q-card-section>
            
            <q-card-section>
                <q-input 
                    v-model="pinInput" 
                    dense filled 
                    :dark="$q.dark.isActive" 
                    label='Security PIN' 
                    mask='######' 
                    type='password' 
                    autofocus
                    @keyup.enter='verifyPin'
                />
            </q-card-section>

            <q-card-actions align='right'>
                <q-btn flat label='Cancel' v-close-popup />
                <q-btn flat label='Verify & Proceed' color='negative' @click='verifyPin' :disable='pinInput.length !== 6' />
            </q-card-actions>
        </q-card>
     </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const users = ref([])
const loading = ref(false)
const processing = ref(false)
const currentUserEmail = ref('')
const isAdmin = ref(false)

// CONSTANTS
const MAIN_ADMIN_EMAIL = 'janiruhansaga2029@gmail.com'

// Edit State
const editDialog = ref(false)
const selectedUser = ref(null)

// PIN State
const pinDialog = ref(false)
const pinInput = ref('')
const currentUserPin = ref('')

// Role Options computed based on permissions
const roleOptions = computed(() => {
    return ['student', 'teacher', 'admin', 'staff']
})

const canEdit = (row) => {
    // Only Main Admin can edit other Admins/Staff
    if (['admin', 'staff'].includes(row.role) && currentUserEmail.value !== MAIN_ADMIN_EMAIL) return false
    
    // Cannot edit Super Admin unless it's yourself
    if (row.is_super_admin && currentUserEmail.value !== row.email) return false
    return true
}

const columns = [
  { name: 'full_name', label: 'Name', align: 'left', field: 'full_name', sortable: true },
  { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
  { name: 'role', label: 'Role', align: 'center', field: 'role', sortable: true },
  { name: 'status', label: 'Status', align: 'center', field: 'status', sortable: true },
  { name: 'is_super_admin', label: 'Super Admin', align: 'center', field: 'is_super_admin', sortable: true },
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
   
   // Get Current User & PIN
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
       currentUserEmail.value = user.email
       // Fetch current admin's PIN
       const { data: adminProfile } = await supabase.from('profiles').select('security_pin').eq('id', user.id).single()
       if (adminProfile) currentUserPin.value = adminProfile.security_pin
       
       // Check if current user is Admin (vs Staff)
       const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
       if (myProfile?.role === 'admin') isAdmin.value = true
   }

   const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, email, status, updated_at, created_at, is_super_admin')
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

// PIN VALIDATION LOGIC
const pendingAction = ref(null)

const confirmAction = (callback) => {
    pendingAction.value = callback
    
    // Require PIN if current user has one set
    if (currentUserPin.value) {
        pinInput.value = ''
        pinDialog.value = true
    } else {
        // Direct execution if no PIN set
        callback()
    }
}

const verifyPin = () => {
    if (pinInput.value === currentUserPin.value) {
        pinDialog.value = false
        if (pendingAction.value) pendingAction.value()
        pendingAction.value = null
    } else {
        $q.notify({ type: 'negative', message: 'Invalid PIN' })
    }
}

// 1. DELETE ACTION
const confirmDelete = (row) => {
    confirmAction(() => {
        $q.dialog({
            title: 'Confirm Delete',
            message: 'Are you sure? This cannot be undone.',
            cancel: true,
            persistent: true
        }).onOk(() => {
            deleteUser(row.id, true) 
        })
    })
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
    const openProfile = () => {
        router.push({ path: '/dashboard/profile', query: { userId: user.id } })
    }

    if (user.role === 'admin') {
        confirmAction(openProfile)
    } else {
        openProfile()
    }
}

const resetPassword = async (user) => {
    if (!confirm(`Send password reset email to ${user.email}?\nThey will receive a link to set a new password.`)) return
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/dashboard/profile'
        })
        
        if (error) throw error
        
        $q.notify({ type: 'positive', message: `Reset email sent to ${user.email}` })
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to send reset email: ' + err.message })
    }
}

const approveUser = async (user) => {
    if (currentUserEmail.value !== MAIN_ADMIN_EMAIL) {
        $q.notify({ type: 'negative', message: 'Only Main Admin can approve users.' })
        return
    }

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
    // Permission Check: Strictly Main Admin Only for Role Changes
    if (currentUserEmail.value !== MAIN_ADMIN_EMAIL) {
        $q.notify({ type: 'warning', message: 'Only Main Admin can change user roles.' })
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

const deleteUser = async (id, skipConfirm = false) => {
    if (currentUserEmail.value !== MAIN_ADMIN_EMAIL) {
        $q.notify({ type: 'negative', message: 'Only Main Admin can delete users.' })
        return
    }

    if (!skipConfirm && !confirm('Are you sure? This will remove the User COMPLETELY (Login & Profile).')) return
    
    try {
        // Use RPC to delete from Auth Schema (Secure)
        const { error } = await supabase
           .rpc('delete_user_by_admin', { target_user_id: id })
           
        if (error) throw error

        $q.notify({ type: 'positive', message: 'User deleted successfully' })
        
        // Update Local State Immediately
        users.value = users.value.filter(u => u.id !== id)
        
        // Then re-fetch to strict sync
        // fetchUsers() - REMOVED to prevent UI glitch where user reappears briefly

    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to delete user: ' + err.message })
    }
}
</script>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); }
</style>
