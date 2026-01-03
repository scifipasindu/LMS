<template>
  <q-layout view="lHh Lpr lFf" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
    <q-header reveal :class="$q.dark.isActive ? 'bg-transparent text-white' : 'bg-white text-dark'" class="q-py-lg" style="backdrop-filter: blur(10px);">
      <q-toolbar>
        <q-btn flat no-caps no-wrap class="logo-btn" to="/">
           <img v-if="currentLogo" :key="$q.dark.isActive" :src="currentLogo" class="logo-img" alt="OnlineClass" />
           <div v-else class="logo-text text-primary text-weight-bold">Online<span :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Class</span></div>
        </q-btn>

        <q-space />

        <!-- Desktop Menu -->
        <div class="gt-sm q-gutter-x-md">
          <q-btn flat no-caps label="Home" to="/" class="text-weight-medium" />
          <q-btn flat no-caps label="Features" @click="scrollToSection('features')" />
          <q-btn flat no-caps label="About" @click="scrollToSection('about')" />
          <q-btn flat no-caps label="Contact" @click="scrollToSection('contact')" />
          <q-btn v-if="!user" unelevated rounded color="accent" label="Student Login" class="q-px-md" to="/login" />
          <q-btn v-else unelevated rounded color="primary" label="Dashboard" class="q-px-md" to="/dashboard" />
        </div>

        <!-- Theme Toggle -->
        <q-btn flat round dense :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" class="q-mr-sm" @click="toggleTheme">
           <q-tooltip>Toggle Theme</q-tooltip>
        </q-btn>

        <!-- Mobile Menu Button -->
        <q-btn flat dense round icon="menu" class="lt-md" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      side="right"
      overlay
      behavior="mobile"
      elevated
      :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'"
    >
      <q-list class="q-mt-lg">
        <q-item clickable v-close-popup @click="scrollToSection('home')">
          <q-item-section avatar><q-icon name="home" color="accent"/></q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="scrollToSection('features')">
          <q-item-section avatar><q-icon name="star" color="accent"/></q-item-section>
          <q-item-section>Features</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="scrollToSection('about')">
           <q-item-section avatar><q-icon name="info" color="accent"/></q-item-section>
          <q-item-section>About</q-item-section>
        </q-item>
         <q-item clickable v-close-popup @click="scrollToSection('contact')">
           <q-item-section avatar><q-icon name="phone" color="accent"/></q-item-section>
          <q-item-section>Contact</q-item-section>
        </q-item>
        <q-separator :dark="$q.dark.isActive" class="q-my-md"/>
        <div class="flex justify-center">
           <q-btn v-if="!user" unelevated rounded color="accent" label="Student Login" class="full-width q-mx-md" to="/login" />
           <q-btn v-else unelevated rounded color="primary" label="Dashboard" class="full-width q-mx-md" to="/dashboard" />
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
      
      <footer :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-grey-1 text-dark'">
        <!-- Main Footer Content -->
        <div class="container q-py-xl">
            <div class="row" :class="$q.screen.lt.md ? 'q-col-gutter-md justify-center' : 'q-col-gutter-xl'">
              <!-- Left: Brand -->
              <div class="col-12 col-md-3" :class="$q.screen.lt.md ? 'text-center' : 'text-left'">
                  <div class="q-mb-md">
                   <img v-if="currentLogo" :key="$q.dark.isActive" :src="currentLogo" style="max-width: 180px; height: auto;" alt="OnlineClass" />
                   <div v-else class="text-h4 text-primary text-weight-bold">Online<span class="text-white">Class</span></div>
                  </div>
                  <div class="text-grey-5 text-body2">
                     Empowering students with smart education management solutions in Sri Lanka.
                  </div>
              </div>
              
              <!-- Spacer -->
              <div class="col-0 col-md-3"></div>
  
              <!-- Links Columns -->
              <div class="col-12 col-md-6" :class="$q.screen.lt.md ? 'text-center' : ''">
                 <div class="row q-col-gutter-lg">
                    <!-- Company -->
                    <div class="col-4">
                       <div class="text-subtitle1 text-weight-bold q-mb-md">Company</div>
                       <div class="flex column q-gutter-y-sm">
                          <a href="#about" class="footer-link">About</a>
                          <a href="#" class="footer-link">Careers</a>
                          <a href="#" class="footer-link">Contact</a>
                       </div>
                    </div>
                    
                    <!-- Community -->
                    <div class="col-4">
                       <div class="text-subtitle1 text-weight-bold q-mb-md">Community</div>
                       <div class="flex column q-gutter-y-sm">
                          <a href="#" class="footer-link">Blog</a>
                          <a href="#" class="footer-link">Forum</a>
                          <a href="#" class="footer-link">Events</a>
                       </div>
                    </div>
                    
                    <!-- Legal -->
                    <div class="col-4">
                       <div class="text-subtitle1 text-weight-bold q-mb-md">Legal</div>
                       <div class="flex column q-gutter-y-sm">
                          <a href="#" class="footer-link">Privacy</a>
                          <a href="#" class="footer-link">Terms</a>
                          <a href="#" class="footer-link">Security</a>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
        </div>
        
        <!-- Bottom Strip -->
        <div class="bg-primary q-py-xs">
           <div class="text-center text-white text-caption text-weight-medium">
               © {{ new Date().getFullYear() }} OnlineClass.edu.lk.
           </div>
        </div>
      </footer>
    </q-page-container>

  </q-layout>
</template>

<style scoped>
.logo-btn {
  margin-left: 0;
}
.logo-img {
  height: 40px;
  width: auto;
}
.logo-text {
  font-size: 1.5rem; /* h5 */
}

@media (min-width: 1024px) {
  .logo-btn {
    margin-left: 100px;
  }
  .logo-img {
    height: 60px; /* Restored desktop size */
  }
  .logo-text {
     font-size: 1.5rem;
  }
}

/* Mobile specific adjustments */
@media (max-width: 600px) {
  .logo-text {
    font-size: 1.25rem; /* h6 */
  }
}

.footer-link {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 0.9em;
  transition: color 0.3s;
}
.footer-link:hover {
  color: var(--q-accent);
}
</style>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const leftDrawerOpen = ref(false)
const user = ref(null)

const logoSettings = ref({ dark: '', light: '' })
const currentLogo = ref('')

// Watch for theme changes or settings load
watch([() => $q.dark.isActive, logoSettings], () => {
   const isDark = $q.dark.isActive
   currentLogo.value = isDark ? logoSettings.value.dark : (logoSettings.value.light || logoSettings.value.dark)
}, { deep: true, immediate: true })

const toggleTheme = () => {
   $q.dark.toggle()
}

onMounted(async () => {
  // Get initial user
  const { data } = await supabase.auth.getUser()
  user.value = data.user
  
  // Fetch settings
  await fetchSettings()

  // Listen for changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null
  })
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
      // Manually trigger immediate update after fetch
      const isDark = $q.dark.isActive
      currentLogo.value = isDark ? logoSettings.value.dark : (logoSettings.value.light || logoSettings.value.dark)
   }
}



function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function scrollToSection(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
