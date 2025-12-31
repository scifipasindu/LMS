<template>
  <q-page class="flex flex-center bg-dark relative-position overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute-top-right bg-primary" style="height: 300px; width: 300px; border-radius: 50%; opacity: 0.2; filter: blur(80px); transform: translate(50%, -50%);"></div>
    <div class="absolute-bottom-left bg-accent" style="height: 400px; width: 400px; border-radius: 50%; opacity: 0.15; filter: blur(100px); transform: translate(-30%, 30%);"></div>

    <div class="login-card q-pa-xl relative-position z-10" style="width: 100%; max-width: 450px;">
       <div class="text-center q-mb-xl">
           <img src="~assets/logo_footer.png" style="height: 60px; margin-bottom: 20px;" alt="Logo" /> 
           <h4 class="text-h4 text-weight-bold text-white q-mt-none q-mb-sm">Welcome Back</h4>
           <p class="text-grey-5">Sign in to continue your learning journey</p>
       </div>

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
             type="password" 
             dark 
             color="accent"
             class="input-glass"
             :rules="[val => !!val || 'Password is required']"
           >
              <template v-slot:prepend>
                <q-icon name="lock" color="grey-5" />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Successfully logged in!',
      position: 'top'
    })
    
    // Redirect to dashboard or home
    router.push('/dashboard')
    
  } catch (err) {
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
