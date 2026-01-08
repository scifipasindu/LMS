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
              <div class="text-subtitle2 q-mb-sm" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ (isEditingOther && profile.email) ? profile.email : userEmail }}</div>
              
              <div v-if="isAdmin && currentUserEmail === 'janiruhansaga2029@gmail.com'" class="q-mt-sm">
                  <q-select 
                    v-model="profile.role" 
                    :options="roleOptions" 
                    label="Role" 
                    dense 
                    filled 
                    :dark="$q.dark.isActive"
                    class="q-mx-auto"
                    style="max-width: 150px"
                    :hint="!isEditingOther ? 'WARNING: Changing own role may lose Admin access' : ''"
                  />
              </div>
              <div v-else class="text-caption text-primary text-uppercase text-weight-bold">{{ profile.role }}</div>
              
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
                  
                  <template v-if="!isEditingOther">
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
                  </template>

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
                 
                 <!-- 2FA Section: Main Admin ONLY -->
                 <template v-if="!isEditingOther && currentUserEmail === MAIN_ADMIN_EMAIL">
                    <h6 class="text-h6 text-weight-bold q-my-none text-accent">Two-Factor Authentication</h6>
                    <p class="text-caption q-mb-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Secure your account with TOTP (Authenticator App).</p>
                    
                    <div v-if="!isMfaEnabled">
                        <q-btn v-if="!mfaData.id" label="Enable 2FA" color="accent" outline rounded icon="security" @click="startMfaEnrollment" :loading="enrollingMfa" />
                        
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
                 </template>

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

    <!-- MFA Verification Dialog -->
    <q-dialog v-model="showMfaDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Security Check</div>
          <div class="text-caption">Enter your Authenticator Code to verify role change.</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="verificationCode" autofocus @keyup.enter="verifyAndProceed" mask="######" filled placeholder="000000" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Verify & Save" @click="verifyAndProceed" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'
import QRCode from 'qrcode'

const $q = useQuasar()
const route = useRoute()
const loading = ref(false)
const userEmail = ref('')
const currentUserEmail = ref('')
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
const enrollingMfa = ref(false)
const roleOptions = ['admin', 'teacher', 'student', 'staff']
const initialRole = ref('')
const currentUserId = ref(null)
const isAdmin = ref(false)
const adminMfaFactorId = ref(null)
const showMfaDialog = ref(false)
const verificationCode = ref('')
const isRoleVerified = ref(false)
const MAIN_ADMIN_EMAIL = 'janiruhansaga2029@gmail.com'

const avatarUrl = computed(() => profile.value.avatar_url)

const isEditingOther = computed(() => {
    return route.query.userId && currentUserId.value && route.query.userId !== currentUserId.value
})

onMounted(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Store current user ID for permission checks
    currentUserId.value = user.id
    currentUserEmail.value = user.email

    // Check if current user is admin
    const { data: myProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (myProfile?.role === 'admin') {
        isAdmin.value = true
        
        // Fetch Admin's MFA factors (for verification later)
        const { data: factors } = await supabase.auth.mfa.listFactors()
        if (factors && factors.totp.length > 0) {
            const verifiedFactor = factors.totp.find(f => f.status === 'verified')
            if (verifiedFactor) adminMfaFactorId.value = verifiedFactor.id
        }
    }

    // Check if we are editing another user (Admin only)
    const targetUserId = route.query.userId
    
    if (targetUserId) {
         if (isAdmin.value) {
             getUserProfile(targetUserId)
             return
         } else {
             $q.notify({ type: 'negative', message: 'Unauthorized access' })
             return
         }
    }

    getUserProfile(user.id)
})



const getUserProfile = async (userId) => { // Renamed from getProfile
   // Fetch from profiles table
   const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

   if (data) {
       profile.value = data
       initialRole.value = data.role // Store initial role
   }
   
   // Check MFA Status (Only if self)
   if (!isEditingOther.value) {
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
}

const startMfaEnrollment = async () => {
    if (currentUserEmail.value !== MAIN_ADMIN_EMAIL) return
    if (enrollingMfa.value) return
    enrollingMfa.value = true
    
    try {
        // 1. Clean up stale/unverified factors to prevent collisions
        const { data: factors } = await supabase.auth.mfa.listFactors()
        if (factors && factors.totp.length > 0) {
            // Remove ANY unverified factors OR factors starting with 'OnlineClass' (including previous timestamped ones)
            const staleFactors = factors.totp.filter(f => 
                f.status === 'unverified' || 
                f.friendly_name?.startsWith('OnlineClass')
            )
            
            for (const factor of staleFactors) {
                // Ignore errors during cleanup (best effort against race conditions)
                await supabase.auth.mfa.unenroll({ factorId: factor.id }).catch((e) => console.warn('Cleanup failed for ' + factor.id, e))
            }
        }

        // 2. Start new enrollment with unique Friendly Name
        const uniqueName = `OnlineClass (${Date.now()})`
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: uniqueName
        })
        if (error) throw error
        
        const qrCodeUrl = await QRCode.toDataURL(data.totp.uri)

        mfaData.value = {
            id: data.id,
            type: data.type,
            totp_url: data.totp.uri,
            secret: data.totp.secret,
            qrCodeUrl: qrCodeUrl
        }
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to start enrollment: ' + err.message })
    } finally {
        enrollingMfa.value = false
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
        // Check for Role Change
        if (profile.value.role !== initialRole.value) {
            if (currentUserEmail.value !== MAIN_ADMIN_EMAIL) {
                $q.notify({ type: 'negative', message: 'Only Main Admin can change user roles.' })
                loading.value = false
                return
            }

            // Lazy fetch factors if not cached
            if (!adminMfaFactorId.value) {
                 const { data: factors, error: mfaError } = await supabase.auth.mfa.listFactors()
                 if (!mfaError && factors && factors.totp.length > 0) {
                      const verifiedFactor = factors.totp.find(f => f.status === 'verified')
                      if (verifiedFactor) adminMfaFactorId.value = verifiedFactor.id
                 }
            }

            if (!isRoleVerified.value) {
                if (!adminMfaFactorId.value) {
                    $q.notify({ 
                        type: 'negative', 
                        message: 'Action Blocked: You must enable 2FA on your OWN Profile first to change roles.',
                        timeout: 5000
                    })
                    loading.value = false
                    return
                }
                showMfaDialog.value = true
                loading.value = false
                return
            }
        }

        // 1. Update Profile Data
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: profile.value.full_name,
                phone: profile.value.phone,
                bio: profile.value.bio,
                security_pin: profile.value.security_pin,
                role: profile.value.role // Allow role update
            })
            .eq('id', profile.value.id)

        if (error) throw error

        // 2. Update Password if provided (Only for self)
        if (newPassword.value && !isEditingOther.value) {
            const { error: pwError } = await supabase.auth.updateUser({
                password: newPassword.value
            })
            if (pwError) throw pwError
        }

        // 3. Update Email if changed (Isolated try/catch to not block profile save)
        try {
            const currentRes = await supabase.auth.getUser()
            const currentEmail = currentRes.data.user?.email
            
            if (userEmail.value !== currentEmail && !isEditingOther.value) {
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
        
        initialRole.value = profile.value.role // Update initial role to match new saved role
        newPassword.value = ''
        confirmPassword.value = ''
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Error updating profile details' })
    } finally {
        loading.value = false
        // Reset verified status after save attempt (success or fail)
        if (isRoleVerified.value) isRoleVerified.value = false
    }
}

const verifyAndProceed = async () => {
    try {
        const { error } = await supabase.auth.mfa.challengeAndVerify({
            factorId: adminMfaFactorId.value,
            code: verificationCode.value
        })
        
        if (error) {
            $q.notify({ type: 'negative', message: 'Invalid 2FA Code' })
            return
        }
        
        showMfaDialog.value = false
        isRoleVerified.value = true
        verificationCode.value = '' // Clear code
        updateProfile() // Retry update
        
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Verification failed' })
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
