<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-xl">
       <!-- Left Column: Profile Card -->
       <div class="col-12 col-md-4">
          <q-card class="text-center q-pa-lg profile-card" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
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
              <div class="text-subtitle2 q-mb-sm" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ userEmail }}</div>
              <div class="text-caption text-primary text-uppercase text-weight-bold">{{ profile.role }}</div>
              
              <q-separator :dark="$q.dark.isActive" class="q-my-md" />
              
              <div v-if="profile.bio" class="text-body2 q-mb-md" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                  {{ profile.bio }}
              </div>
          </q-card>
       </div>

       <!-- Right Column: Edit Details -->
       <div class="col-12 col-md-8">
          <q-card class="q-pa-lg" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
              <h5 class="text-h5 text-weight-bold q-mt-none q-mb-lg">Profile Details</h5>
              
              <q-form @submit="updateProfile" class="q-gutter-md">
                 <q-input 
                   filled :dark="$q.dark.isActive" 
                   v-model="profile.full_name" 
                   label="Full Name" 
                   class="input-dynamic"
                 />

                 <q-input 
                   filled :dark="$q.dark.isActive" 
                   v-model="profile.bio" 
                   label="Bio / About Me" 
                   type="textarea"
                   rows="3"
                   class="input-dynamic"
                 />

                 <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <q-input 
                           filled :dark="$q.dark.isActive" 
                           v-model="userEmail" 
                           label="Email Address" 
                           class="input-dynamic"
                           hint="Confirmation required for new email"
                        />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input 
                           filled :dark="$q.dark.isActive" 
                           v-model="profile.phone" 
                           label="Phone Number" 
                           class="input-dynamic"
                        />
                    </div>
                 </div>

                  <q-separator :dark="$q.dark.isActive" class="q-my-lg" />
                  
                  <h6 class="text-h6 text-weight-bold q-my-none">Security</h6>
                  <p class="text-caption q-mb-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Update your password (optional)</p>

                 <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <q-input 
                          filled :dark="$q.dark.isActive" 
                          v-model="newPassword" 
                          label="New Password" 
                          type="password"
                          class="input-dynamic"
                        />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-input 
                          filled :dark="$q.dark.isActive" 
                          v-model="confirmPassword" 
                          label="Confirm Password" 
                          type="password"
                          class="input-dynamic"
                        />
                    </div>
                 </div>

                 <!-- Security PIN -->
                 <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-12">
                         <q-input 
                           filled :dark="$q.dark.isActive" 
                           v-model="profile.security_pin" 
                           label="Security PIN (6 Digits)" 
                           type="password"
                           mask="######"
                           hint="Required for critical Admin actions"
                           class="input-dynamic"
                         />
                    </div>
                 </div>

                 <q-separator :dark="$q.dark.isActive" class="q-my-lg" />
                 
                 <h6 class="text-h6 text-weight-bold q-my-none text-accent">Two-Factor Authentication</h6>
                 <p class="text-caption q-mb-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Secure your account with TOTP (Authenticator App).</p>
                 
                 <div v-if="!isMfaEnabled">
                     <q-btn v-if="!mfaData.secret" label="Enable 2FA" color="accent" outline rounded icon="security" @click="startMfaEnrollment" />
                     
                     <div v-else class="q-pa-md bg-dark-glass rounded-borders">
                        <div class="text-center q-mb-md">
                            <img :src="mfaData.qrCodeUrl" style="border-radius: 10px; border: 4px solid white;">
                            <div class="text-caption q-mt-sm text-grey">Scan this QR code with your Authenticator App</div>
                        </div>
                        
                        <div class="row items-center q-gutter-md">
                            <q-input filled dense v-model="mfaCode" label="Enter Code" class="col" :dark="$q.dark.isActive" mask="######" />
                            <q-btn label="Verify & Enable" color="positive" @click="verifyMfa" :loading="verifyingMfa" />
                            <q-btn flat round icon="close" color="negative" @click="mfaData = {}" />
                        </div>
                     </div>
                 </div>
                 <div v-else>
                     <q-banner class="bg-positive text-white rounded-borders">
                         <template v-slot:avatar>
                             <q-icon name="verified_user" />
                         </template>
                         Two-Factor Authentication is ENABLED. Your account is secure.
                     </q-banner>
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
import QRCode from 'qrcode'

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
    bio: '',
    security_pin: ''
})

const newPassword = ref('')
const confirmPassword = ref('')
const isMfaEnabled = ref(false)
const mfaData = ref({})
const mfaCode = ref('')
const verifyingMfa = ref(false)

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
   
   // Check MFA Status
   const { data: factors } = await supabase.auth.mfa.listFactors()
   if (factors && factors.totp.length > 0) {
       const verifiedFactor = factors.totp.find(f => f.status === 'verified')
       if (verifiedFactor) isMfaEnabled.value = true
   }

   // Auto-Show QR for Main Admin if not enabled
   if (profile.value.is_super_admin && !isMfaEnabled.value) {
       startMfaEnrollment()
   }
}

const startMfaEnrollment = async () => {
    try {
        // 1. Clean up stale/unverified factors to prevent collisions
        const { data: factors } = await supabase.auth.mfa.listFactors()
        if (factors && factors.totp.length > 0) {
            // Remove ANY unverified factors OR factors with same name 'OnlineClass' that might be stuck
            const staleFactors = factors.totp.filter(f => f.status === 'unverified' || f.friendly_name === 'OnlineClass')
            
            for (const factor of staleFactors) {
                // Ignore errors during cleanup (best effort)
                await supabase.auth.mfa.unenroll({ factorId: factor.id }).catch(() => {})
            }
        }

        // 2. Start new enrollment with unique Friendly Name
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: `OnlineClass (${new Date().toLocaleTimeString()})`
        })
        if (error) throw error
        
        const qrCodeUrl = await QRCode.toDataURL(data.totp.uri)

        mfaData.value = {
            id: data.id,
            type: data.type,
            totp_url: data.totp.uri,
            secret: data.secret,
            qrCodeUrl: qrCodeUrl
        }
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to start enrollment: ' + err.message })
    }
}

const verifyMfa = async () => {
    verifyingMfa.value = true
    try {
        const { error } = await supabase.auth.mfa.challengeAndVerify({
            factorId: mfaData.value.id,
            code: mfaCode.value
        })
        if (error) throw error
        
        $q.notify({ type: 'positive', message: '2FA Enabled Successfully! 🛡️' })
        isMfaEnabled.value = true
        mfaData.value = {}
        mfaCode.value = ''
    } catch (err) {
         console.error(err)
        $q.notify({ type: 'negative', message: 'Invalid Code. Try again.' })
    } finally {
        verifyingMfa.value = false
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
                bio: profile.value.bio,
                security_pin: profile.value.security_pin
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

        // 3. Update Email if changed (Isolated try/catch to not block profile save)
        try {
            const currentRes = await supabase.auth.getUser()
            const currentEmail = currentRes.data.user?.email
            
            if (userEmail.value !== currentEmail) {
                 const { error: emailError } = await supabase.auth.updateUser({
                     email: userEmail.value
                 })
                 if (emailError) throw emailError
                 
                 $q.notify({ type: 'info', message: 'Confirmation link sent to new email!', timeout: 5000 })
            }
        } catch (emailErr) {
             console.error('Email update failed:', emailErr)
             // Supabase Rate Limit 429 or 500 error
             $q.notify({ type: 'warning', message: 'Profile saved, but Email update failed (Rate Limit). Try again later.' })
        }
        
        $q.notify({ type: 'positive', message: 'Profile updated successfully!' })
        
        newPassword.value = ''
        confirmPassword.value = ''
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Error updating profile details' })
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
