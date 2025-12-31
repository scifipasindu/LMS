<template>
  <q-page class="bg-dark text-white">
    
    <!-- Hero Section -->
    <section id="home" class="hero-section relative-position">
      <div class="absolute-full overflow-hidden">
        <div class="glow-effect q-ma-xl"></div>
      </div>
      
      <div class="container q-pa-md relative-position z-10 text-center">
        <div class="row items-center justify-center q-col-gutter-lg reverse-wrap-mobile">
          <div class="col-12 col-md-7 text-left-md text-center">
            <q-badge color="secondary" label="New Enrollment Open" class="q-py-xs q-px-sm q-mb-md" rounded />
            <h1 class="text-h2 text-weight-bolder leading-tight q-mb-md">
              The Future of <br>
              <span class="text-gradient">Tuition Management</span>
            </h1>
            <p class="text-h6 text-grey-4 q-mb-xl" style="max-width: 600px; margin-inline: auto 0;">
              All-in-one platform for students, teachers, and parents. seamless learning, smart management.
            </p>
            <div class="row q-gutter-md justify-center justify-md-start">
              <q-btn 
                size="lg" 
                rounded 
                color="primary" 
                class="q-px-xl shadow-10" 
                label="Get Started" 
                no-caps 
                icon-right="arrow_forward"
              />
               <q-btn 
                size="lg" 
                rounded 
                outline
                color="white" 
                class="q-px-xl" 
                label="Learn More" 
                no-caps 
              />
            </div>
          </div>
          
          <div class="col-12 col-md-5 flex flex-center">
             <div class="hero-card relative-position">
                 <q-img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    class="rounded-borders shadow-20"
                    style="border-radius: 30px; transform: rotate(3deg); border: 5px solid rgba(255,255,255,0.1);"
                 >
                    <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                      OnlineClass.edu.lk
                    </div>
                 </q-img>
                
                <!-- Floating Elements decoration -->
                <div class="float-badge top-right bg-secondary">
                  <q-icon name="check" color="white"/>
                </div>
                 <div class="float-badge bottom-left bg-warning">
                  <q-icon name="bolt" color="white"/>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="q-py-xl bg-dark-light border-y-dim">
      <div class="container">
        <div class="row justify-evenly text-center q-col-gutter-md">
          <div class="col-6 col-md-3">
             <div class="text-h3 text-weight-bold text-primary">500+</div>
             <div class="text-subtitle1 text-grey-5">Active Students</div>
          </div>
          <div class="col-6 col-md-3">
             <div class="text-h3 text-weight-bold text-secondary">98%</div>
             <div class="text-subtitle1 text-grey-5">Pass Rate</div>
          </div>
           <div class="col-6 col-md-3">
             <div class="text-h3 text-weight-bold text-accent">24/7</div>
             <div class="text-subtitle1 text-grey-5">Support</div>
          </div>
           <div class="col-6 col-md-3">
             <div class="text-h3 text-weight-bold text-positive">50+</div>
             <div class="text-subtitle1 text-grey-5">Expert Teachers</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="q-py-xl relative-position">
       <div class="container q-pa-md">
          <div class="text-center q-mb-xl">
             <h2 class="text-h3 text-weight-bold q-mb-sm">Powerful <span class="text-secondary">Features</span></h2>
             <p class="text-grey-4 text-subtitle1">Everything you need to manage your institute efficiently.</p>
          </div>
          
          <div class="row q-col-gutter-lg">
             <!-- Feature 1 -->
             <div class="col-12 col-md-4">
                <q-card class="bg-glass-card h-full text-white no-shadow transition-hover">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-primary-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="manage_accounts" size="32px" color="white"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Student Management</div>
                      <p class="text-grey-4">Complete usage tracking, profile management, and attendance history in one place.</p>
                   </q-card-section>
                </q-card>
             </div>
             
              <!-- Feature 2 -->
             <div class="col-12 col-md-4">
                <q-card class="bg-glass-card h-full text-white no-shadow transition-hover">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-secondary-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="qr_code_scanner" size="32px" color="white"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Smart Attendance</div>
                      <p class="text-grey-4">QR based attendance system with instant SMS notification to parents.</p>
                   </q-card-section>
                </q-card>
             </div>

              <!-- Feature 3 -->
             <div class="col-12 col-md-4">
                <q-card class="bg-glass-card h-full text-white no-shadow transition-hover">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-accent-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="payments" size="32px" color="white"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Fee Management</div>
                      <p class="text-grey-4">Automated fee collection, pending alerts, and digital receipts.</p>
                   </q-card-section>
                </q-card>
             </div>
             
              <!-- Feature 4 -->
             <div class="col-12 col-md-4">
                 <q-card class="bg-glass-card h-full text-white no-shadow transition-hover">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-warning-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="quiz" size="32px" color="white"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Exam & Results</div>
                      <p class="text-grey-4">Online exams, automated grading, and detailed performance analysis.</p>
                   </q-card-section>
                </q-card>
             </div>
             
              <!-- Feature 5 -->
             <div class="col-12 col-md-4">
                <q-card class="bg-glass-card h-full text-white no-shadow transition-hover">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-info-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="dashboard" size="32px" color="white"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Admin Dashboard</div>
                      <p class="text-grey-4">Powerful insights, financial reports, and overall institute control.</p>
                   </q-card-section>
                </q-card>
             </div>

             <!-- Feature 6 -->
             <div class="col-12 col-md-4">
                <q-card class="bg-glass-card h-full text-white no-shadow transition-hover">
                   <q-card-section class="q-pa-lg">
                      <div class="bg-positive-soft q-pa-md rounded-borders inline-block q-mb-md">
                         <q-icon name="live_tv" size="32px" color="white"/>
                      </div>
                      <div class="text-h5 text-weight-bold q-mb-sm">Online Classes</div>
                      <p class="text-grey-4">Seamless integration for zoom/live classes and video recordings.</p>
                   </q-card-section>
                </q-card>
             </div>
          </div>
       </div>
    </section>

    <!-- About Section -->
    <section id="about" class="q-py-xl bg-dark-lighter">
      <div class="container q-pa-md">
         <div class="row items-center q-col-gutter-xl">
            <div class="col-12 col-md-6">
               <div class="relative-position">
                   <q-img 
                    src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    class="rounded-borders shadow-20"
                    style="height: 400px; border-radius: 20px;"
                 >
                    <div class="absolute-bottom text-center">
                        Excellence in Education
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
               <h2 class="text-h3 text-weight-bold q-mb-md">We are transforming <br>How you learn</h2>
               <p class="text-grey-4 text-body1 q-mb-lg">
                  OnlineClass.edu.lk is designed to bridge the gap between technology and education. 
                  We provide a seamless ecosystem for tuition providers to manage their classes, payments, and students 
                  effortlessly while providing a top-tier learning experience for students.
               </p>
               
               <q-list class="q-mb-lg">
                  <q-item>
                     <q-item-section avatar><q-icon name="check_circle" color="secondary" /></q-item-section>
                     <q-item-section class="text-grey-4">Automated Workflows</q-item-section>
                  </q-item>
                   <q-item>
                     <q-item-section avatar><q-icon name="check_circle" color="secondary" /></q-item-section>
                     <q-item-section class="text-grey-4">Secure Data Management</q-item-section>
                  </q-item>
                   <q-item>
                     <q-item-section avatar><q-icon name="check_circle" color="secondary" /></q-item-section>
                     <q-item-section class="text-grey-4">Easy Mobile Access</q-item-section>
                  </q-item>
               </q-list>
               
               <q-btn color="white" text-color="dark" label="Read More" rounded class="q-px-xl" no-caps/>
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
                
                <div class="col-12 col-md-6 bg-white q-pa-xl text-dark">
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
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const message = ref('')
</script>

<style lang="scss">
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
  background-color: lighten($dark, 5%);
}

.bg-dark-lighter {
  background-color: lighten($dark, 8%);
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
   max-width: 400px;
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
