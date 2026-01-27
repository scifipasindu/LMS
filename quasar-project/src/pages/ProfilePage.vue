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
                   class="input-dynamic q-mb-md"
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

                  <!-- Student Grade Selection -->
                  <div class="row q-col-gutter-md q-mt-none" v-if="profile.role === 'student' || isAdmin">
                     <div class="col-12 col-md-6">
                        <q-select
                            filled
                            :dark="$q.dark.isActive"
                            v-model="profile.grade"
                            :options="['1','2','3','4','5','6','7','8','9','10','11','12','13']"
                            label="Your Grade/Year"
                            hint="Select your current grade"
                            class="input-dynamic"
                        />
                     </div>
                     <div class="col-12 col-md-6">
                        <q-select
                            filled
                            :dark="$q.dark.isActive"
                            v-model="profile.stream"
                            :options="['Maths','Bio','Commerce','Arts','Tech','Other']"
                            label="Stream"
                            hint="Select your stream"
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
                 <!-- 2FA Section: Main Admin ONLY -->
                 <template v-if="!isEditingOther && currentUserEmail === MAIN_ADMIN_EMAIL">
                    <h6 class="text-h6 text-weight-bold q-my-none text-accent">Two-Factor Authentication</h6>
                    <p class="text-caption q-mb-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">Secure your access with Authenticator App (TOTP).</p>
                    
                    <!-- Enrollment / New Device UI -->
                    <div v-if="mfaData.id" class="q-pa-md bg-dark-glass rounded-borders q-mb-md">
                        <div class="text-center q-mb-md">
                            <img :src="mfaData.qrCodeUrl" style="border-radius: 10px; border: 4px solid white;">
                            <div class="text-caption q-mt-sm text-grey">Scan this QR code with your new Authenticator App</div>
                        </div>
                        
                        <div class="row items-center q-gutter-md">
                            <q-input filled dense v-model="mfaCode" label="Enter Code from New App" class="col" :dark="$q.dark.isActive" mask="######" />
                            <q-btn label="Verify & Enable" color="positive" @click="verifyMfa" :loading="verifyingMfa" />
                            <q-btn flat round icon="close" color="negative" @click="mfaData = {}" />
                        </div>
                    </div>

                    <!-- List of Enabled Devices -->
                    <div v-if="isMfaEnabled">
                        <q-list bordered separator class="rounded-borders q-mb-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white'">
                            <q-item-label header>Active Devices</q-item-label>
                            
                            <q-item v-for="factor in activeMfaFactors" :key="factor.id">
                                <q-item-section avatar>
                                    <q-icon name="smartphone" color="primary" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ factor.friendly_name || 'Authenticator App' }}</q-item-label>
                                    <q-item-label caption>ID: ...{{ factor.id.slice(-4) }}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-btn flat round color="negative" icon="delete" @click="initiateMfaAction('remove', factor.id)">
                                        <q-tooltip>Remove Device</q-tooltip>
                                    </q-btn>
                                </q-item-section>
                            </q-item>
                        </q-list>

                        <div class="row justify-end">
                             <q-btn 
                                outline 
                                color="primary" 
                                label="Add New Device" 
                                icon="add_reaction" 
                                @click="initiateMfaAction('add')" 
                             />
                        </div>
                    </div>

                    <!-- Initial State (No Devices) -->
                    <div v-else-if="!mfaData.id">
                        <q-banner class="bg-warning text-dark rounded-borders q-mb-md">
                             <template v-slot:avatar>
                                <q-icon name="warning" />
                             </template>
                             You have not enabled 2FA yet. Your account is at risk.
                        </q-banner>
                        <q-btn label="Enable 2FA Now" color="accent" unelevated rounded icon="security" @click="initiateMfaAction('add')" :loading="enrollingMfa" />
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
    security_pin: '',
    grade: '',
    stream: ''
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
const MAIN_ADMIN_EMAIL = 'janiruhansaga2025@gmail.com'
const activeMfaFactors = ref([]) // Store list of verified factors
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
   
   // Check MFA Status (List all verified factors)
   if (!isEditingOther.value) {
       const { data: factors } = await supabase.auth.mfa.listFactors()
       if (factors && factors.totp.length > 0) {
           activeMfaFactors.value = factors.totp.filter(f => f.status === 'verified')
           isMfaEnabled.value = activeMfaFactors.value.length > 0
       } else {
           activeMfaFactors.value = []
           isMfaEnabled.value = false
       }

       // Auto-Show QR for Main Admin if not enabled
       if (profile.value.is_super_admin && !isMfaEnabled.value) {
           startMfaEnrollment()
       }
   }
}

// MFA Management Flow State
const mfaPendingAction = ref(null) // 'add' or 'remove'
const mfaTargetId = ref(null)

const initiateMfaAction = (action, targetId = null) => {
    mfaPendingAction.value = action
    mfaTargetId.value = targetId
    
    // 1. Require PIN
    if (profile.value.security_pin) {
        showPin.value = true
    } else {
        // No PIN? (Should not happen for admin, but safe fallback)
        proceedToMfaCheck() 
    }
}

const proceedToMfaCheck = () => {
    // 2. Require OTP (only if MFA is enabled/factors exist)
    if (isMfaEnabled.value && activeMfaFactors.value.length > 0) {
        otpAction.value = 'mfa_management' // Custom action for dialog title
        showOtp.value = true
    } else {
        // No existing MFA = Safe to proceed (first enrollment)
        executeMfaAction()
    }
}

const executeMfaAction = async () => {
    if (mfaPendingAction.value === 'add') {
        startMfaEnrollment()
    } else if (mfaPendingAction.value === 'remove' && mfaTargetId.value) {
        await removeMfaFactor(mfaTargetId.value)
    }
    // Reset
    mfaPendingAction.value = null
    mfaTargetId.value = null
}

const removeMfaFactor = async (factorId) => {
    try {
        await supabase.auth.mfa.unenroll({ factorId })
        $q.notify({ type: 'positive', message: 'Device removed successfully' })
        // Refresh list
        getUserProfile(profile.value.id)
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Failed to remove device' })
    }
}

const startMfaEnrollment = async () => {
    if (currentUserEmail.value !== MAIN_ADMIN_EMAIL) return
    if (enrollingMfa.value) return
    enrollingMfa.value = true
    
    try {
        // NO cleanup of old factors to allow multiple devices
        
        // 2. Start new enrollment with unique Friendly Name
        const uniqueName = `OnlineClass (${new Date().toLocaleString()})`
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
        // Force UI to show enrollment
        // We use a separate state or just modal?
        // Let's use the existing mfaData check in template
        
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
                role: profile.value.role,
                grade: profile.value.grade,
                stream: profile.value.stream
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
    
    if (otpAction.value === 'mfa_management') {
        showOtp.value = false // Close dialog
        executeMfaAction()
    } else {
        updateProfile() // Standard update
    }
}

const handlePinVerified = () => {
    isPinVerified.value = true
    
    // If we are in MFA management flow, proceed to OTP check
    if (mfaPendingAction.value) {
        showPin.value = false // Close PIN dialog
        proceedToMfaCheck()
    } else {
        updateProfile()
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
