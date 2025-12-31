<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-xl">
       <!-- Left Column: Profile Card -->
       <div class="col-12 col-md-4">
          <q-card class="bg-dark-card text-white text-center q-pa-lg profile-card">
              <div class="relative-position inline-block q-mb-md">
                 <q-avatar size="120px" class="shadow-10">
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                 </q-avatar>
                 <q-btn round color="primary" icon="edit" size="sm" class="absolute-bottom-right" style="bottom: 5px; right: 5px;" />
              </div>
              
              <h5 class="text-h5 text-weight-bold q-my-sm">{{ firstName }} {{ lastName }}</h5>
              <div class="text-subtitle2 text-grey-5 q-mb-lg">{{ email }}</div>
              
              <q-chip color="accent" text-color="white" icon="star">Pro Student</q-chip>
              
              <q-separator dark class="q-my-md" />
              
              <div class="row justify-center q-gutter-x-lg">
                 <div class="column">
                    <span class="text-h6 text-weight-bold">{{ courseCount }}</span>
                    <span class="text-caption text-grey-6">Courses</span>
                 </div>
                 <div class="column">
                    <span class="text-h6 text-weight-bold">{{ attendanceRate }}%</span>
                    <span class="text-caption text-grey-6">Attendance</span>
                 </div>
                 <div class="column">
                    <span class="text-h6 text-weight-bold">{{ gpa }}</span>
                    <span class="text-caption text-grey-6">GPA</span>
                 </div>
              </div>
          </q-card>
       </div>

       <!-- Right Column: Edit Details -->
       <div class="col-12 col-md-8">
          <q-card class="bg-dark-card text-white q-pa-lg">
              <h5 class="text-h5 text-weight-bold q-mt-none q-mb-lg">Account Settings</h5>
              
              <q-form @submit="updateProfile" class="q-gutter-md">
                 <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <q-input 
                          filled dark 
                          v-model="firstName" 
                          label="First Name" 
                          class="input-glass"
                        />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input 
                          filled dark 
                          v-model="lastName" 
                          label="Last Name" 
                          class="input-glass"
                        />
                    </div>
                 </div>

                 <q-input 
                    filled dark 
                    v-model="email" 
                    label="Email Address" 
                    class="input-glass"
                    readonly
                    hint="Contact support to change email"
                 >
                    <template v-slot:append>
                       <q-icon name="lock" color="grey-6" />
                    </template>
                 </q-input>
                 
                 <q-input 
                    filled dark 
                    v-model="phone" 
                    label="Phone Number" 
                    class="input-glass"
                 />

                  <q-separator dark class="q-my-lg" />
                  
                  <h6 class="text-h6 text-weight-bold q-my-none">Change Password</h6>
                  <p class="text-grey-5 text-caption q-mb-md">Leave blank if you don't want to change it</p>

                 <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <q-input 
                          filled dark 
                          v-model="newPassword" 
                          label="New Password" 
                          type="password"
                          class="input-glass"
                        />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input 
                          filled dark 
                          v-model="confirmPassword" 
                          label="Confirm Password" 
                          type="password"
                          class="input-glass"
                        />
                    </div>
                 </div>

                 <div class="row justify-end q-mt-xl">
                    <q-btn flat color="grey-5" label="Cancel" class="q-mr-sm" />
                    <q-btn 
                      unelevated 
                      rounded 
                      color="primary" 
                      label="Save Changes" 
                      class="q-px-xl"
                      type="submit"
                      :loading="loading"
                    />
                 </div>
              </q-form>
          </q-card>
       </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const courseCount = ref(0)
const attendanceRate = ref(0)
const gpa = ref(0.0)

onMounted(async () => {
    getProfile()
})

const getProfile = async () => {
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
       email.value = user.email
       if (user.user_metadata) {
           firstName.value = user.user_metadata.first_name || ''
           lastName.value = user.user_metadata.last_name || ''
           phone.value = user.user_metadata.phone || ''
       }
   }
}

const updateProfile = async () => {
    if (newPassword.value && newPassword.value !== confirmPassword.value) {
        $q.notify({
            type: 'negative',
            message: 'Passwords do not match',
            position: 'top'
        })
        return
    }

    loading.value = true
    try {
        const updates = {
            data: { 
                first_name: firstName.value,
                last_name: lastName.value,
                phone: phone.value
            }
        }

        if (newPassword.value) {
            updates.password = newPassword.value
        }

        const { error } = await supabase.auth.updateUser(updates)
        
        if (error) throw error
        
        $q.notify({
            type: 'positive',
            message: 'Profile updated successfully!',
            position: 'top'
        })
        
        // Clear password fields on success
        newPassword.value = ''
        confirmPassword.value = ''
        
    } catch {
        $q.notify({
            type: 'negative',
            message: 'Error updating profile',
            position: 'top'
        })
    } finally {
        loading.value = false
    }
}
</script>

<style scoped lang="scss">
.bg-dark-card {
  background: #121212;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.05);
}

.input-glass :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
}

.profile-card {
    border-top: 5px solid $primary;
}
</style>
