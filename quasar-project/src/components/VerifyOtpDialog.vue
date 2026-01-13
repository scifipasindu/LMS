<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 350px" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark'">
      <q-card-section>
        <div class="text-h6 text-weight-bold row items-center">
            <q-icon name="security" color="primary" class="q-mr-sm"/>
            Security Verification
        </div>
        <div class="text-caption q-mt-xs text-grey">
            Verification required for: <strong class="text-primary">{{ actionLabel }}</strong>
        </div>
      </q-card-section>

      <q-card-section>
         <transition name="fade" mode="out-in">
             <!-- Step 1: Send Code -->
             <div v-if="step === 1" key="step1" class="text-center q-pa-md">
                 <p>We need to verify your identity. <br> A verification code will be sent to your email.</p>
                 <q-btn 
                    label="Send Verification Code" 
                    color="primary" 
                    rounded 
                    unelevated 
                    class="full-width q-mt-md"
                    :loading="loading"
                    @click="sendCode"
                    icon="send"
                 />
                 <div v-if="hasTotp" class="q-mt-sm">
                    <div class="text-caption text-grey q-mb-xs">OR</div>
                     <q-btn 
                        flat
                        label="Use Authenticator App" 
                        color="accent" 
                        class="full-width"
                        @click="useTotp"
                        icon="security"
                     />
                 </div>
             </div>

             <!-- Step 2: Verify Code -->
             <div v-else key="step2" class="text-center">
                 <!-- If NOT hasTotp (Email users), show simple text -->
                 <!-- If hasTotp, we are enforcing TOTP, no tabs needed -->
                 
                 <p class="text-caption q-mb-md" v-if="method === 'email'">Enter the 6-digit code sent to your email.</p>
                 <p class="text-caption q-mb-md" v-else>Enter the code from your Authenticator App.</p>
                 
                 <q-input
                    v-model="code"
                    filled
                    :dark="$q.dark.isActive"
                    :label="method === 'email' ? 'Email Code' : 'Authenticator Code'"
                    mask="######"
                    class="text-center text-h5 q-mb-md"
                    input-class="text-center letter-spacing-lg"
                    autofocus
                    :error="!!error"
                    :error-message="error"
                    @keyup.enter="handleVerify"
                 />

                 <div class="row q-gutter-md justify-between items-center">
                     <q-btn v-if="method === 'email'" flat :label="emailSent ? 'Resend' : 'Send Code'" color="primary" size="sm" @click="sendCode" :disable="loading" />
                     <div v-else></div> <!-- Spacer -->
                     <q-btn label="Verify" color="positive" rounded unelevated @click="handleVerify" :loading="loading" />
                 </div>
             </div>
         </transition>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'boot/supabase' // Make sure this path is correct for your project
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  action: {
      type: String,
      default: 'auth'
  },
  title: String
})

const emit = defineEmits(['update:modelValue', 'verified'])

const $q = useQuasar()
const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const step = ref(1)
const code = ref('')
const loading = ref(false)
const error = ref('')
const emailSent = ref(false)
const hasTotp = ref(false)
const method = ref('email')
const totpFactorId = ref(null)
const factorsLoaded = ref(false)

const checkFactors = async () => {
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const verified = factors?.totp?.find(f => f.status === 'verified')
    if (verified) {
        hasTotp.value = true
        totpFactorId.value = verified.id
        // Force immediate switch
        method.value = 'totp'
        step.value = 2
    }
    factorsLoaded.value = true
}

onMounted(() => {
    checkFactors()
})

const initDialog = () => {
    // Reset State Validation
    code.value = ''
    error.value = ''
    loading.value = false
    
    if (hasTotp.value) {
        method.value = 'totp'
        step.value = 2
    } else {
        method.value = 'email'
        step.value = 1
    }
}

// Watch for Dialog Open
import { watch } from 'vue'
watch(show, (val) => {
    if (val) {
        // Re-check factors to be sure (in case they enabled it in profile just now)
        checkFactors().then(() => {
             initDialog()
        })
    }
})

// Auto-skip to Step 2 if they prefer TOTP?
// For now, let's keep it simple: Step 1 sends email (backup), then Step 2 allows switching.
// Or better: In Step 1, show "Use Authenticator" button to skip email sending.

const actionLabel = computed(() => {
    return props.title || props.action.replace('_', ' ').toUpperCase()
})

const sendCode = async () => {
    loading.value = true
    error.value = ''
    try {
        const { data, error: funcError } = await supabase.functions.invoke('send-otp', {
            body: { action: props.action }
        })

        if (funcError) throw funcError
        if (data?.error) throw new Error(data.error)

        $q.notify({ type: 'positive', message: 'Verification code sent to email' })
        emailSent.value = true
        step.value = 2
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to send code: ' + err.message })
    } finally {
        loading.value = false
    }
}

const useTotp = () => {
    method.value = 'totp'
    step.value = 2
}

const handleVerify = () => {
    if (method.value === 'totp') {
        verifyTotp()
    } else {
        verifyEmailCode()
    }
}

const verifyTotp = async () => {
    if (code.value.length !== 6) {
        error.value = 'Code must be 6 digits'
        return
    }
    loading.value = true
    error.value = ''
    try {
        const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({
            factorId: totpFactorId.value,
            code: code.value
        })
        if (mfaError) throw mfaError
        
        $q.notify({ type: 'positive', message: 'Authenticator Verified!' })
        emit('verified')
        show.value = false
        resetState()
    } catch (err) {
        console.error(err)
        error.value = 'Invalid Authenticator Code'
        $q.notify({ type: 'negative', message: 'Verification Failed' })
    } finally {
        loading.value = false
    }
}

const verifyEmailCode = async () => {
    if (code.value.length !== 6) {
        error.value = 'Code must be 6 digits'
        return
    }

    loading.value = true
    error.value = ''
    try {
        const { data, error: funcError } = await supabase.functions.invoke('verify-otp', {
            body: { 
                action: props.action,
                code: code.value
            }
        })

        if (funcError) throw funcError
        if (data?.error) throw new Error(data.error)

        $q.notify({ type: 'positive', message: 'Verified Successfully!' })
        emit('verified')
        show.value = false
        resetState()

    } catch (err) {
        console.error(err)
        error.value = err.message || 'Invalid Code'
        $q.notify({ type: 'negative', message: 'Verification Failed' })
    } finally {
        loading.value = false
    }
}

const resetState = () => {
     // Managed by initDialog on open
}
</script>

<style scoped>
.bg-dark-card {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
}
.letter-spacing-lg {
    letter-spacing: 5px;
}
</style>
