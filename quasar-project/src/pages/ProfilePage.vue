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

                    <!-- Current Password Input -->
                    <div class="q-mb-md">
                        <q-input 
                            filled :dark="$q.dark.isActive" 
                            v-model="currentPassword" 
                            label="Current Password" 
                            :type="showCurrentPw ? 'text' : 'password'"
                            class="input-dynamic"
                            placeholder="********"
                            hint="Required to authorize password changes"
                        >
                            <template v-slot:append>
                                <q-icon
                                    :name="showCurrentPw ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="showCurrentPw = !showCurrentPw"
                                />
                            </template>
                        </q-input>
                    </div>

                    <div class="row q-col-gutter-md">
                        <div class="col-12 col-md-6">
                            <q-input 
                            filled :dark="$q.dark.isActive" 
                            v-model="newPassword" 
                            label="New Password" 
                            :type="showNewPw ? 'text' : 'password'"
                            class="input-dynamic"
                            >
                                <template v-slot:append>
                                    <q-icon
                                        :name="showNewPw ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer"
                                        @click="showNewPw = !showNewPw"
                                    />
                                </template>
                            </q-input>
                        </div>
                        <div class="col-12 col-md-6">
                            <q-input 
                            filled :dark="$q.dark.isActive" 
                            v-model="confirmPassword" 
                            label="Confirm Password" 
                            :type="showConfirmPw ? 'text' : 'password'"
                            class="input-dynamic"
                            >
                                <template v-slot:append>
                                    <q-icon
                                        :name="showConfirmPw ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer"
                                        @click="showConfirmPw = !showConfirmPw"
                                    />
                                </template>
                            </q-input>
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

    <!-- OTP Verification Dialog -->
    <VerifyOtpDialog 
      v-model="showOtp" 
      :action="otpAction" 
      @verified="handleOtpVerified" 
    />

    <PinDialog 
      v-model="showPin"
      :target-pin="profile.security_pin"
      @verified="handlePinVerified"
    />



  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'
import QRCode from 'qrcode'
import VerifyOtpDialog from 'components/VerifyOtpDialog.vue'
import PinDialog from 'components/PinDialog.vue'

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

const initialPin = ref('') // Track initial PIN state

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Password Visibility State
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const showConfirmPw = ref(false)
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
const MAIN_ADMIN_EMAIL = 'janiruhansaga2029@gmail.com'
// Verification State
const showOtp = ref(false)
const otpAction = ref('profile_update')
const isOtpVerified = ref(false)
// PIN & PW Verification State
const showPin = ref(false)
const isPinVerified = ref(false)
const isPasswordVerified = ref(false)

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
    userEmail.value = user.email // Initialize Input Field

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
       initialPin.value = data.security_pin // Store initial PIN
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

    // STRICT Password Change Verification
    if (newPassword.value && !isEditingOther.value) {
        // 1. Require Current Password
        if (!currentPassword.value) {
            $q.notify({ type: 'warning', message: 'Please enter your current password to change it.' })
            return
        }

        // 2. Verify Current Password (Re-Auth)
        // Only verify if we haven't just verified it (optimization? No, safer to verify always or track it)
        // We'll verify every time they hit save if password field is filled
        if (!isPasswordVerified.value) {
             const { error } = await supabase.auth.signInWithPassword({
                email: currentUserEmail.value,
                password: currentPassword.value
            })
            if (error) {
                $q.notify({ type: 'negative', message: 'Incorrect Current Password' })
                return
            }
            isPasswordVerified.value = true
        }

        // 3. Require PIN (if exists)
        if (profile.value.security_pin && !isPinVerified.value) {
            showPin.value = true
            return
        }
    }

    // Detect Sensitive Changes
    const changes = []
    if (profile.value.security_pin !== initialPin.value) changes.push('change_pin')
    if (profile.value.role !== initialRole.value) changes.push('change_role')
    if (newPassword.value) changes.push('change_password')
    if (userEmail.value !== currentUserEmail.value && !isEditingOther.value) changes.push('change_email') // Rough check

    // If sensitive changes and NOT verified yet
    if (changes.length > 0 && !isOtpVerified.value) {
        otpAction.value = changes[0] // Use the first substantial action as label
        showOtp.value = true
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
                security_pin: profile.value.security_pin,
                role: profile.value.role
            })
            .eq('id', profile.value.id)

        if (error) throw error

        // 2. Secure Auth Updates (Email/Password) via Edge Function
        // This bypasses the email confirmation link requirement (Admin Privilege) 
        // and sends a security notice instead.
        const newEmailNorm = userEmail.value ? userEmail.value.trim().toLowerCase() : ''
        const currentRes = await supabase.auth.getUser()
        const currentEmail = currentRes.data.user?.email || ''
        const currentEmailNorm = currentEmail.trim().toLowerCase()
        const emailChanged = newEmailNorm !== currentEmailNorm

        if ((newPassword.value || emailChanged) && !isEditingOther.value) {
             const { data: funcData, error: funcError } = await supabase.functions.invoke('secure-profile-update', {
                body: {
                    id: profile.value.id,
                    email: userEmail.value.trim(),
                    password: newPassword.value || undefined
                }
             })

             if (funcError) throw funcError
             if (funcData?.error) throw new Error(funcData.error)
             
             // Update Success Message
             if (emailChanged) {
                $q.notify({ type: 'positive', message: 'Email updated immediately. Security notice sent.' })
             }
             if (newPassword.value) {
                $q.notify({ type: 'positive', message: 'Password updated successfully.' })
             }
        }
        
        $q.notify({ type: 'positive', message: 'Profile updated successfully!' })
        
        // Reset State
        initialRole.value = profile.value.role 
        initialPin.value = profile.value.security_pin
        
        // If password was changed, keep it as currentPassword for this session
        if (newPassword.value) {
            currentPassword.value = newPassword.value
        }
        
        newPassword.value = ''
        confirmPassword.value = ''
        // Do NOT clear currentPassword to keep it visible/ready
        
        isOtpVerified.value = false 
        isPinVerified.value = false 
        isPasswordVerified.value = false
        // Update current email ref to avoid re-triggering change detection until confirmed
        // Actually, we should keep it until page reload or real update, but local state is fine.
        
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Error updating profile details' })
    } finally {
        loading.value = false
    }
}

const handleOtpVerified = () => {
    isOtpVerified.value = true
    updateProfile() // Retry
}

const handlePinVerified = () => {
    isPinVerified.value = true
    updateProfile()
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
