<template>
  <q-page class="flex flex-center bg-dark relative-position overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute-bottom-right bg-secondary" style="height: 350px; width: 350px; border-radius: 50%; opacity: 0.2; filter: blur(90px); transform: translate(40%, 40%);"></div>
    <div class="absolute-top-left bg-accent" style="height: 250px; width: 250px; border-radius: 50%; opacity: 0.15; filter: blur(80px); transform: translate(-30%, -30%);"></div>

    <div class="register-card q-pa-xl relative-position z-10" style="width: 100%; max-width: 500px;">
       <div class="text-center q-mb-lg">
           <q-icon name="person_add" size="3.5em" color="white" class="q-mb-md" />
           <h4 class="text-h4 text-weight-bold text-white q-mt-none q-mb-sm">Create Account</h4>
           <p class="text-grey-5">Join OnlineClass.edu.lk today</p>
       </div>

       <q-form @submit="handleRegister" class="q-gutter-md">
           
           <!-- Name Input -->
           <div class="row q-col-gutter-sm">
             <div class="col-12 col-md-6">
                <q-input 
                 filled 
                 v-model="firstName" 
                 label="First Name" 
                 dark 
                 color="accent" 
                 class="input-glass"
                 :rules="[val => !!val || 'Required']"
                />
             </div>
             <div class="col-12 col-md-6">
                <q-input 
                 filled 
                 v-model="lastName" 
                 label="Last Name" 
                 dark 
                 color="accent" 
                 class="input-glass"
                 :rules="[val => !!val || 'Required']"
                />
             </div>
           </div>

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
             :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Min 6 characters']"
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
           
           <q-input 
             filled 
             v-model="confirmPassword" 
             label="Confirm Password" 
             :type="isPwdConfirm ? 'password' : 'text'"
             dark 
             color="accent"
             class="input-glass"
             :rules="[val => val === password || 'Passwords do not match']"
           >
              <template v-slot:prepend>
                <q-icon name="lock_clock" color="grey-5" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-5"
                  @click="isPwdConfirm = !isPwdConfirm"
                />
              </template>
           </q-input>

           <q-checkbox v-model="terms" label="I agree to the Terms & Conditions" dark size="sm" color="accent" :rules="[val => !!val || 'You must agree to continue']"/>

           <q-btn 
             type="submit" 
             unelevated 
             rounded 
             color="accent" 
             label="Create Account" 
             class="full-width q-py-md text-weight-bold shadow-10 btn-gradient-accent"
             :loading="loading"
           />
       </q-form>

       <div class="text-center q-mt-lg text-grey-5">
           Already have an account? 
           <router-link to="/login" class="text-white text-weight-bold text-decoration-none hover-primary">Sign In</router-link>
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
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isPwd = ref(true)
const isPwdConfirm = ref(true)
const terms = ref(false)
const loading = ref(false)

const handleRegister = async () => {
  if (!terms.value) {
      $q.notify({ type: 'warning', message: 'Please agree to the terms.' })
      return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          first_name: firstName.value,
          last_name: lastName.value,
          role: 'student', // Default role for email template variable {{ .Data.role }}
        },
      },
    })

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: 'Registration successful! Check your email.',
      position: 'top'
    })
    
    // Redirect to login or verification hint page
    router.push('/login')
    
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Registration failed',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-card {
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

.btn-gradient-accent {
  background: linear-gradient(135deg, $accent, $secondary);
  transition: transform 0.2s;
  
  &:active {
    transform: scale(0.98);
  }
}

.hover-primary {
  transition: color 0.3s;
  &:hover {
    color: $primary !important;
  }
}
</style>
