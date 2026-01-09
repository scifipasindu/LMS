<template>
  <q-page class="flex flex-center bg-dark relative-position overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute-top-right bg-primary" style="height: 300px; width: 300px; border-radius: 50%; opacity: 0.2; filter: blur(80px); transform: translate(50%, -50%);"></div>
    <div class="absolute-bottom-left bg-accent" style="height: 400px; width: 400px; border-radius: 50%; opacity: 0.15; filter: blur(100px); transform: translate(-30%, 30%);"></div>

    <div class="login-card q-pa-xl relative-position z-10" style="width: 100%; max-width: 450px;">
       <div class="text-center q-mb-lg">
           <img v-if="currentLogo" :src="currentLogo" style="height: 60px; margin-bottom: 20px; object-fit: contain;" alt="Logo" /> 
           <div v-else class="text-h4 text-primary text-weight-bold q-mb-md">Online<span class="text-white">Class</span></div> 
           <h4 class="text-h4 text-weight-bold text-white q-mt-none q-mb-sm">Welcome Back</h4>
           <p class="text-grey-5">Sign in to continue your learning journey</p>
       </div>

       <q-tabs
          v-model="selectedRole"
          class="text-grey-5 q-mb-lg"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          dense
          no-caps
       >
          <q-tab name="student" label="Student Login" icon="school" />
          <q-tab name="staff" label="Staff Login" icon="badge" />
          <q-tab name="admin" label="Admin Login" icon="admin_panel_settings" />
       </q-tabs>

       <q-form @submit="handleLogin" class="q-gutter-md">
           <q-input 
             filled 
             v-model="email" 
             label="Email Address" 
             dark 
             color="accent" 
             class="input-glass"
             :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Invalid email']"
           >
              <template v-slot:prepend>
                <q-icon name="email" color="grey-5" />
              </template>
           </q-input>

           <q-input 
             filled 
             v-model="password" 
             label="Password" 
             :type="isPwd ? 'password' : 'text'"
             dark 
             color="accent"
             class="input-glass"
             :rules="[val => !!val || 'Password is required']"
           >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-5" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-5"
                  @click="isPwd = !isPwd"
                />
              </template>
           </q-input>

           <div class="row justify-between items-center q-mb-md">
               <q-checkbox v-model="rememberMe" label="Remember me" dark size="sm" color="accent" />
               <a href="#" class="text-accent text-decoration-none text-weight-medium" style="font-size: 0.9em;">Forgot Password?</a>
           </div>

           <q-btn 
             type="submit" 
             unelevated 
             rounded 
             color="primary" 
             label="Sign In" 
             class="full-width q-py-md text-weight-bold shadow-10 btn-gradient"
             :loading="loading"
           />
       </q-form>

       <div class="text-center q-mt-xl text-grey-5">
           Don't have an account? 
           <router-link to="/register" class="text-white text-weight-bold text-decoration-none hover-accent">Create Account</router-link>
       </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const email = ref('')
const password = ref('')
const isPwd = ref(true)
const rememberMe = ref(false)
const loading = ref(false)
const selectedRole = ref('student')


const logoSettings = ref({ dark: '', light: '' })
const currentLogo = ref('')

// Watch for theme changes or settings load
watch([() => $q.dark.isActive, logoSettings], () => {
   currentLogo.value = logoSettings.value.dark || logoSettings.value.light
}, { deep: true, immediate: true })

onMounted(async () => {
   await fetchSettings()
})

const fetchSettings = async () => {
   const { data } = await supabase
     .from('system_settings')
     .select('value')
     .eq('key', 'config')
     .single()
     
   if (data?.value?.general) {
      logoSettings.value.dark = data.value.general.logoUrl || ''
      logoSettings.value.light = data.value.general.logoUrlLight || ''
      currentLogo.value = logoSettings.value.dark || logoSettings.value.light
   }
}

const handleLogin = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    // Fetch Profile to verify Role and Status
    const { data: profile } = await supabase
       .from('profiles')
       .select('role, status')
       .eq('id', data.user.id)
       .single()
    
    // Check for Pending Status
    if (profile?.status !== 'active') {
        await supabase.auth.signOut() 
        throw new Error('Your account is pending approval by an administrator.')
    }

    // Authorization Check
    const role = profile?.role?.toLowerCase() || 'student'

    $q.notify({
      type: 'positive',
      message: `Welcome back!`,
      position: 'top'
    })
    
    // Redirect based on verified role
    if (role === 'admin') {
        router.push('/admin')
    } else {
        router.push('/dashboard')
    }
    
  } catch (err) {
    if (err.message.includes('Access Denied')) {
        // Keep loading false, show explicit error
    } else {
        // Standard login error
    }
    
    $q.notify({
      type: 'negative',
      message: err.message || 'Login failed',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.input-glass :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 12px;
}

.btn-gradient {
  background: linear-gradient(135deg, $primary, $secondary);
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
}

.hover-accent {
  transition: color 0.3s;
  &:hover {
    color: $accent !important;
  }
}
</style>
