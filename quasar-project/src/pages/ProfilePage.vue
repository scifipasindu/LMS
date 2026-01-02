<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-xl">
       <!-- Left Column: Profile Card -->
       <div class="col-12 col-md-4">
          <q-card class="bg-dark-card text-white text-center q-pa-lg profile-card">
              <div class="relative-position inline-block q-mb-md">
                 <q-avatar size="120px" class="shadow-10">
                    <img :src="avatarUrl || 'https://cdn.quasar.dev/img/boy-avatar.png'" style="object-fit: cover;">
                 </q-avatar>
                 <q-btn 
                    round 
                    color="primary" 
                    icon="edit" 
                    size="sm" 
                    class="absolute-bottom-right" 
                    style="bottom: 5px; right: 5px;" 
                    @click="$refs.fileInput.pickFiles()"
                 />
                 <q-file 
                    v-model="avatarFile" 
                    ref="fileInput" 
                    style="display: none" 
                    accept="image/*"
                    @update:model-value="handleAvatarUpload"
                 />
              </div>
              
              <h5 class="text-h5 text-weight-bold q-my-sm">{{ profile.full_name || 'User' }}</h5>
              <div class="text-subtitle2 text-grey-5 q-mb-sm">{{ userEmail }}</div>
              <div class="text-caption text-primary text-uppercase text-weight-bold">{{ profile.role }}</div>
              
              <q-separator dark class="q-my-md" />
              
              <div v-if="profile.bio" class="text-body2 text-grey-4 q-mb-md">
                  {{ profile.bio }}
              </div>
          </q-card>
       </div>

       <!-- Right Column: Edit Details -->
       <div class="col-12 col-md-8">
          <q-card class="bg-dark-card text-white q-pa-lg">
              <h5 class="text-h5 text-weight-bold q-mt-none q-mb-lg">Profile Details</h5>
              
              <q-form @submit="updateProfile" class="q-gutter-md">
                 <q-input 
                   filled dark 
                   v-model="profile.full_name" 
                   label="Full Name" 
                   class="input-glass"
                 />

                 <q-input 
                   filled dark 
                   v-model="profile.bio" 
                   label="Bio / About Me" 
                   type="textarea"
                   rows="3"
                   class="input-glass"
                 />

                 <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <q-input 
                           filled dark 
                           v-model="userEmail" 
                           label="Email Address" 
                           class="input-glass"
                           readonly
                           hint="Cannot change email"
                        >
                           <template v-slot:append>
                              <q-icon name="lock" color="grey-6" />
                           </template>
                        </q-input>
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input 
                           filled dark 
                           v-model="profile.phone" 
                           label="Phone Number" 
                           class="input-glass"
                        />
                    </div>
                 </div>

                  <q-separator dark class="q-my-lg" />
                  
                  <h6 class="text-h6 text-weight-bold q-my-none">Security</h6>
                  <p class="text-grey-5 text-caption q-mb-md">Update your password (optional)</p>

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
                    <q-btn 
                      unelevated 
                      rounded 
                      color="primary" 
                      label="Save Changes" 
                      class="q-px-xl shadow-4"
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const userEmail = ref('')
const avatarFile = ref(null)

const profile = ref({
    id: '',
    full_name: '',
    avatar_url: '',
    role: '',
    phone: '',
    bio: ''
})

const newPassword = ref('')
const confirmPassword = ref('')

const avatarUrl = computed(() => profile.value.avatar_url)

onMounted(async () => {
    getProfile()
})

const getProfile = async () => {
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) return

   userEmail.value = user.email
   
   // Fetch from profiles table
   const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

   if (data) {
       profile.value = data
   }
}

const handleAvatarUpload = async (file) => {
    if (!file) return
    
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${profile.value.id}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
            
        // Update local state immediately
        profile.value.avatar_url = publicUrl
        
        // Save to DB
        await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', profile.value.id)

        $q.notify({ type: 'positive', message: 'Avatar updated!' })
    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Failed to upload avatar' })
    }
}

const updateProfile = async () => {
    if (newPassword.value && newPassword.value !== confirmPassword.value) {
        $q.notify({ type: 'negative', message: 'Passwords do not match' })
        return
    }

    loading.value = true
    try {
        // 1. Update Profile Data
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: profile.value.full_name,
                phone: profile.value.phone,
                bio: profile.value.bio
            })
            .eq('id', profile.value.id)

        if (error) throw error

        // 2. Update Password if provided
        if (newPassword.value) {
            const { error: pwError } = await supabase.auth.updateUser({
                password: newPassword.value
            })
            if (pwError) throw pwError
        }
        
        $q.notify({ type: 'positive', message: 'Profile updated successfully!' })
        
        newPassword.value = ''
        confirmPassword.value = ''
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Error updating profile' })
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
