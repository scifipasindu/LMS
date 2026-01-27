<template>
  <q-page :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
    
    <!-- Hero Section -->
    <section id="home" class="hero-section relative-position">
      <div class="absolute-full overflow-hidden">
        <div class="glow-effect q-ma-xl"></div>
      </div>
      
      <div class="container q-pa-md relative-position z-10 text-center">
        <div class="row items-center justify-center q-col-gutter-lg reverse-wrap-mobile">
          <div class="col-12 col-md-7" :class="$q.screen.gt.sm ? 'text-left' : 'text-center'">
            <q-badge color="secondary" label="New Enrollment Open" class="q-py-xs q-px-sm q-mb-md" rounded />
            <h1 class="text-h2 text-weight-bolder leading-tight q-mb-md">
              {{ config.home.slider.subtitle }} <br>
              <span class="text-gradient">{{ config.home.slider.title }}</span>
            </h1>
            <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'" class="text-h6 q-mb-xl" :style="$q.screen.gt.sm ? 'margin-right: auto' : 'margin-inline: auto'">
              {{ config.home.slider.subText }}
            </p>
            <div class="row q-gutter-md" :class="$q.screen.gt.sm ? 'justify-start' : 'justify-center'">
              <q-btn 
                size="lg" 
                rounded 
                color="primary" 
                class="q-px-xl shadow-10" 
                :label="config.home.slider.btnText"
                :to="config.home.slider.btnUrl"
                no-caps 
                icon-right="arrow_forward"
              />
               <q-btn 
                size="lg" 
                rounded 
                outline
                :color="$q.dark.isActive ? 'white' : 'primary'" 
                class="q-px-xl" 
                label="Learn More" 
                no-caps 
              />
            </div>
          </div>
          
          <div class="col-12 col-md-5 flex flex-center">
             <div class="hero-card relative-position">
                   <q-img 
                     :src="config.home.slider.image"
                     class="rounded-borders"
                     style="border-radius: 20px; height: 500px; object-fit: cover;"
                  />
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <!-- Dynamic Guides Section -->
    <section v-if="config.home.guides && config.home.guides.length > 0 && config.home.guides[0].title" class="q-py-xl border-y-dim" :class="$q.dark.isActive ? 'bg-dark-light' : 'bg-grey-2'">
      <div class="container">
        <div class="row q-col-gutter-lg justify-center">
          <div v-for="(guide, index) in config.home.guides" :key="index" class="col-12 col-md-3">
             <q-card class="h-full text-center q-pa-md transition-hover row flex-center column" :class="$q.dark.isActive ? 'bg-glass-card no-shadow' : 'bg-white shadow-2'">
                <div class="text-h6 text-primary q-mb-sm">{{ guide.title }}</div>
                <div class="text-caption q-mb-md" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ guide.subText }}</div>
                <q-btn v-if="guide.link" outline rounded size="sm" :color="$q.dark.isActive ? 'white' : 'primary'" label="View" :href="guide.link" />
             </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="q-py-xl relative-position">
       <div class="container q-pa-md">
          <div class="text-center q-mb-xl">
             <h2 class="text-h3 text-weight-bold q-mb-sm">Powerful <span class="text-secondary">Features</span></h2>
             <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'" class="text-subtitle1">Everything you need to manage your institute efficiently.</p>
          </div>
          
          <div class="row q-col-gutter-lg">
             <!-- Feature 1 -->
             <div class="col-12 col-md-4">
                <q-card class="h-full transition-hover" :class="$q.dark.isActive ? 'bg-glass-card text-white no-shadow' : 'bg-white text-dark shadow-2'">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-primary-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="manage_accounts" size="32px" :color="$q.dark.isActive ? 'white' : 'primary'"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Student Management</div>
                      <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">Complete usage tracking, profile management, and attendance history in one place.</p>
                   </q-card-section>
                </q-card>
             </div>
             
              <!-- Feature 2 -->
             <div class="col-12 col-md-4">
                <q-card class="h-full transition-hover" :class="$q.dark.isActive ? 'bg-glass-card text-white no-shadow' : 'bg-white text-dark shadow-2'">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-secondary-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="qr_code_scanner" size="32px" :color="$q.dark.isActive ? 'white' : 'secondary'"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Smart Attendance</div>
                      <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">QR based attendance system with instant SMS notification to parents.</p>
                   </q-card-section>
                </q-card>
             </div>

              <!-- Feature 3 -->
             <div class="col-12 col-md-4">
                <q-card class="h-full transition-hover" :class="$q.dark.isActive ? 'bg-glass-card text-white no-shadow' : 'bg-white text-dark shadow-2'">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-accent-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="payments" size="32px" :color="$q.dark.isActive ? 'white' : 'accent'"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Fee Management</div>
                      <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">Automated fee collection, pending alerts, and digital receipts.</p>
                   </q-card-section>
                </q-card>
             </div>
             
              <!-- Feature 4 -->
             <div class="col-12 col-md-4">
                 <q-card class="h-full transition-hover" :class="$q.dark.isActive ? 'bg-glass-card text-white no-shadow' : 'bg-white text-dark shadow-2'">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-warning-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="quiz" size="32px" :color="$q.dark.isActive ? 'white' : 'warning'"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Exam & Results</div>
                      <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">Online exams, automated grading, and detailed performance analysis.</p>
                   </q-card-section>
                </q-card>
             </div>
             
              <!-- Feature 5 -->
             <div class="col-12 col-md-4">
                <q-card class="h-full transition-hover" :class="$q.dark.isActive ? 'bg-glass-card text-white no-shadow' : 'bg-white text-dark shadow-2'">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-info-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="dashboard" size="32px" :color="$q.dark.isActive ? 'white' : 'info'"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Admin Dashboard</div>
                      <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">Powerful insights, financial reports, and overall institute control.</p>
                   </q-card-section>
                </q-card>
             </div>

             <!-- Feature 6 -->
             <div class="col-12 col-md-4">
                <q-card class="h-full transition-hover" :class="$q.dark.isActive ? 'bg-glass-card text-white no-shadow' : 'bg-white text-dark shadow-2'">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-positive-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="live_tv" size="32px" :color="$q.dark.isActive ? 'white' : 'positive'"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Online Classes</div>
                      <p :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">Seamless integration for zoom/live classes and video recordings.</p>
                   </q-card-section>
                </q-card>
             </div>
          </div>
       </div>
    </section>

    <!-- About Section -->
    <section id="about" class="q-py-xl" :class="$q.dark.isActive ? 'bg-dark-lighter' : 'bg-grey-1'">
      <div class="container q-pa-md">
         <div class="row items-center q-col-gutter-xl">
            <div class="col-12 col-md-6">
               <div class="relative-position">
                   <q-img 
                     :src="config.home.about.image"
                     class="rounded-borders shadow-20"
                     style="height: 400px; border-radius: 20px;"
                  >
                     <div class="absolute-bottom text-center">
                         {{ config.home.about.title }}
                     </div>
                  </q-img>
                  <div class="absolute-bottom-right q-mb-n-md q-mr-n-md bg-accent q-pa-lg rounded-borders shadow-10">
                     <div class="text-h4 text-weight-bold text-white">10+</div>
                     <div class="text-subtitle2 text-white">Years Experience</div>
                  </div>
               </div>
            </div>
            <div class="col-12 col-md-6">
               <div class="text-primary text-subtitle1 text-weight-bold q-mb-sm">ABOUT US</div>
               <h2 class="text-h3 text-weight-bold q-mb-md" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">{{ config.home.about.title }}</h2>
               <div :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'" class="text-body1 q-mb-lg" v-html="config.home.about.description"></div>
               
               <q-list class="q-mb-lg">
                  <q-item>
                     <q-item-section avatar><q-icon name="check_circle" color="secondary" /></q-item-section>
                     <q-item-section :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                        <div class="text-weight-bold">Streamlined Operations</div>
                        <div class="text-caption">Automate tasks and focus on teaching.</div>
                     </q-item-section>
                  </q-item>
                   <q-item>
                     <q-item-section avatar><q-icon name="verified_user" color="secondary" /></q-item-section>
                     <q-item-section :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                        <div class="text-weight-bold">Enterprise Security</div>
                        <div class="text-caption">Keep your data safe with advanced encryption.</div>
                     </q-item-section>
                  </q-item>
                   <q-item>
                     <q-item-section avatar><q-icon name="smartphone" color="secondary" /></q-item-section>
                     <q-item-section :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">
                        <div class="text-weight-bold">Anywhere Access</div>
                        <div class="text-caption">Learn and manage from any device, anytime.</div>
                     </q-item-section>
                  </q-item>
               </q-list>
               
               <q-btn v-if="config.home.about.btnText" :to="config.home.about.btnUrl" :color="$q.dark.isActive ? 'white' : 'primary'" :text-color="$q.dark.isActive ? 'dark' : 'white'" :label="config.home.about.btnText" rounded class="q-px-xl" no-caps/>
            </div>
         </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="q-py-xl">
       <div class="container q-pa-md">
          <div class="bg-primary-gradient rounded-xl overflow-hidden shadow-20">
             <div class="row">
                <div class="col-12 col-md-6 q-pa-xl text-white">
                   <h3 class="text-h3 text-weight-bold q-mb-md">Get in Touch</h3>
                   <p class="text-body1 q-mb-xl opacity-80">
                      Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                   </p>
                   
                   <div class="q-gutter-y-lg">
                      <div class="text-h6 text-weight-regular q-my-lg opacity-80">
                          Connect with us on social media for updates and news.
                      </div>
                   </div>
                   
                   <div class="row q-gutter-md q-mt-xl">
                      <q-btn round flat icon="facebook" />
                      <q-btn round flat icon="smart_display" /> <!-- Youtube -->
                      <q-btn round flat icon="group" /> <!-- LinkedIn/Community -->
                   </div>
                </div>
                
                <div class="col-12 col-md-6 q-pa-xl" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
                   <h4 class="text-h5 text-weight-bold q-mb-lg">Send Message</h4>
                   <q-form class="q-gutter-md">
                      <q-input outlined label="Your Name" v-model="name" />
                      <q-input outlined label="Your Email" v-model="email" />
                      <q-input outlined label="Message" type="textarea" v-model="message" />
                      
                      <q-btn color="primary" label="Send Message" class="full-width q-py-sm" size="lg" rounded no-caps />
                   </q-form>
                </div>
             </div>
          </div>
       </div>
    </section>
    
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const name = ref('')
const email = ref('')
const message = ref('')

const config = reactive({
  home: {
    slider: { 
       image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
       subtitle: 'The Future of', 
       title: 'Tuition Management', 
       subText: 'All-in-one platform for students, teachers, and parents. seamless learning, smart management.',
       btnText: 'Get Started',
       btnUrl: '/login' 
    },
    guides: [],
    about: { 
       title: 'About Us', 
       image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
       description: 'Welcome to the future of education. We provide a comprehensive, all-in-one platform designed to streamline institute management and enhance the learning experience. From smart attendance to automated results, we empower educators and students alike.', 
       btnText: 'Learn More', 
       btnUrl: '#' 
    },
    contact: { phone1: '', phone2: '', whatsapp: '', telegram: '', email: '', website: '' }
  }
})

onMounted(async () => {
  const { data } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'config')
    .single()
    
  if (data?.value?.home) {
      Object.assign(config.home, data.value.home)
  }
})
</script>

<style lang="scss">
@use "sass:color";

.text-left-md {
  @media (min-width: $breakpoint-md-min) {
    text-align: left;
  }
}

.hero-section {
  min-height: auto;
  padding-top: 160px; // Increased top padding to sit below navbar
  padding-bottom: 100px;
}

.bg-dark-light {
  background-color: color.adjust($dark, $lightness: 5%);
}

.bg-dark-lighter {
  background-color: color.adjust($dark, $lightness: 8%);
}

.bg-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.bg-glass-card {
   background: rgba(255, 255, 255, 0.03);
   backdrop-filter: blur(5px);
   border: 1px solid rgba(255,255,255,0.05);
   transition: all 0.3s ease;
   border-radius: 16px;
}

.transition-hover:hover {
   transform: translateY(-5px);
   background: rgba(255, 255, 255, 0.08);
   border-color: rgba(255,255,255,0.2);
}

.text-gradient {
  background: linear-gradient(to right, $primary, $accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-primary-gradient {
   background: linear-gradient(135deg, $primary, $secondary);
}

.glow-effect {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba($primary, 0.2) 0%, rgba($dark, 0) 70%);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.hero-card {
   width: 100%;
   max-width: 500px;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.float-badge {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  
  &.top-right {
    top: -20px;
    right: -20px;
  }
  
  &.bottom-left {
    bottom: -20px;
    left: -20px;
  }
}

.bg-primary-soft { background: rgba($primary, 0.2); }
.bg-secondary-soft { background: rgba($secondary, 0.2); }
.bg-accent-soft { background: rgba($accent, 0.2); }
.bg-warning-soft { background: rgba($warning, 0.2); }
.bg-info-soft { background: rgba($info, 0.2); }
.bg-positive-soft { background: rgba($positive, 0.2); }

.container {
  width: 100%;
  max-width: 1200px;
  margin-right: auto;
  margin-left: auto;
}

.rounded-xl {
  border-radius: 24px;
}
</style>
