<template>
  <q-page class="q-pa-lg">
    <!-- Welcome Header -->
    <div class="row items-center q-mb-xl">
       <div class="col-12 col-md-8">
          <h4 class="text-h4 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">
             Welcome Back, <span class="text-gradient">{{ userRole }}</span>! 👋
          </h4>
          <p class="text-subtitle1 q-mt-sm" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">You have <span class="text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">2 sessions</span> coming up today.</p>
       </div>
       <div class="col-12 col-md-4 text-right gt-sm">
          <q-btn unelevated rounded :color="$q.dark.isActive ? 'white' : 'primary'" :text-color="$q.dark.isActive ? 'dark' : 'white'" label="View Schedule" icon="calendar_today" class="q-px-lg q-py-sm text-weight-bold" />
       </div>
    </div>

    <!-- Stats Modules -->
    <div class="row q-col-gutter-lg q-mb-xl">
       <div class="col-12 col-md-4">
          <q-card class="stat-card bg-gradient-1 text-white">
            <q-card-section>
              <div class="row items-center justify-between">
                 <div class="text-h6 text-weight-bold">Attendance</div>
                 <q-icon name="check_circle" size="2em" class="opacity-50" />
              </div>
              <div class="text-h2 text-weight-bolder q-mt-md">{{ attendance }}</div>
              <div class="text-caption opacity-70">Current Term</div>
            </q-card-section>
          </q-card>
       </div>
       
       <div class="col-12 col-md-4">
          <q-card class="stat-card bg-gradient-2 text-white">
             <q-card-section>
               <div class="row items-center justify-between">
                 <div class="text-h6 text-weight-bold">Assignments</div>
                 <q-icon name="assignment_turned_in" size="2em" class="opacity-50" />
              </div>
              <div class="text-h2 text-weight-bolder q-mt-md">{{ assignmentCount }}</div>
              <div class="text-caption opacity-70">Pending Review</div>
             </q-card-section>
          </q-card>
       </div>

       <div class="col-12 col-md-4">
          <q-card class="stat-card bg-gradient-3 text-white">
             <q-card-section>
               <div class="row items-center justify-between">
                 <div class="text-h6 text-weight-bold">Next Payment</div>
                 <q-icon name="account_balance_wallet" size="2em" class="opacity-50" />
              </div>
              <div class="text-h2 text-weight-bolder q-mt-md">{{ currencySymbol }} {{ paymentDue }}</div>
              <div class="text-caption opacity-70">Total Due</div>
             </q-card-section>
          </q-card>
       </div>
    </div>

    <!-- Announcements Section -->
    <AnnouncementsSection />

    <!-- Content Grid -->
    <div class="row q-col-gutter-xl">
       <!-- My Courses -->
       <div class="col-12 col-md-8">
          <div class="row items-center justify-between q-mb-lg">
             <h5 class="text-h5 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">My Courses</h5>
             <q-btn flat dense no-caps label="View All" color="primary" />
          </div>
          
          <div v-if="courses.length > 0" class="row q-col-gutter-md">
             <div v-for="(course, index) in courses" :key="index" class="col-12 col-sm-6">
                <q-card class="course-card" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
                   <q-img src="https://cdn.quasar.dev/img/parallax2.jpg" height="150px">
                      <div class="absolute-bottom text-subtitle2 text-weight-bold bg-transparent">
                         {{ course.name }}
                      </div>
                   </q-img>
                   <q-card-section>
                      <q-linear-progress :value="course.progress" color="accent" class="q-mt-sm rounded-borders" />
                      <div class="row justify-between q-mt-sm text-caption text-grey-6">
                         <span>{{ course.progress * 100 }}% Complete</span>
                      </div>
                   </q-card-section>
                </q-card>
             </div>
          </div>
          <div v-else class="text-grey-5 q-pa-md text-center border-dashed rounded-borders">
             No courses enrolled yet.
          </div>
          
          <!-- Activity Graph Placeholder -->
          <div class="q-mt-xl">
              <h5 class="text-h5 text-weight-bold q-mb-lg" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Learning Activity</h5>
              <q-card class="graph-card q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
                 <!-- Simple visualization for now -->
                 <div class="row items-end justify-between q-gutter-x-sm" style="height: 150px">
                    <div class="bg-primary-soft rounded-borders" style="flex: 1; height: 40%"></div>
                    <div class="bg-primary-soft rounded-borders" style="flex: 1; height: 70%"></div>
                    <div class="bg-accent rounded-borders" style="flex: 1; height: 50%"></div>
                    <div class="bg-primary-soft rounded-borders" style="flex: 1; height: 90%"></div>
                    <div class="bg-primary-soft rounded-borders" style="flex: 1; height: 60%"></div>
                    <div class="bg-primary-soft rounded-borders" style="flex: 1; height: 80%"></div>
                    <div class="bg-secondary rounded-borders" style="flex: 1; height: 30%"></div>
                 </div>
                 <div class="row justify-between q-mt-sm text-caption text-grey-6">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                 </div>
              </q-card>
          </div>
       </div>

       <!-- Sidebar: Schedule & Notifications -->
       <div class="col-12 col-md-4">
           <h5 class="text-h5 text-weight-bold q-mb-lg q-mt-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Up Next</h5>
           <q-card class="q-mb-lg schedule-card" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
              <q-list v-if="schedule.length > 0" separator :dark="$q.dark.isActive">
                 <q-item v-for="(item, index) in schedule" :key="index">
                    <q-item-section avatar>
                       <div class="date-badge bg-primary-soft text-primary column flex-center">
                          <span class="text-bold">{{ item.date }}</span>
                          <span class="text-caption">{{ item.month }}</span>
                       </div>
                    </q-item-section>
                    <q-item-section>
                       <q-item-label class="text-weight-bold">{{ item.title }}</q-item-label>
                       <q-item-label caption :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ item.time }}</q-item-label>
                    </q-item-section>
                 </q-item>
              </q-list>
              <div v-else class="q-pa-md text-center" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">
                 No upcoming sessions.
              </div>
           </q-card>
           
           <!-- Quick Actions -->
           <h5 class="text-h5 text-weight-bold q-mb-md" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Quick Actions</h5>
           <div class="row q-col-gutter-sm">
              <div class="col-6">
                 <q-btn unelevated :color="$q.dark.isActive ? 'dark-lighter' : 'white'" class="full-width action-btn shadow-1" no-caps>
                    <div class="column items-center q-py-sm">
                       <q-icon name="upload_file" color="accent" size="24px" class="q-mb-xs" />
                       <span class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">Upload Homework</span>
                    </div>
                 </q-btn>
              </div>
              <div class="col-6">
                 <q-btn unelevated :color="$q.dark.isActive ? 'dark-lighter' : 'white'" class="full-width action-btn shadow-1" no-caps>
                    <div class="column items-center q-py-sm">
                       <q-icon name="credit_card" color="secondary" size="24px" class="q-mb-xs" />
                       <span class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-8'">Pay Fees</span>
                    </div>
                 </q-btn>
              </div>
           </div>
       </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar, date } from 'quasar'
import AnnouncementsSection from 'components/AnnouncementsSection.vue'

const $q = useQuasar()

const userName = ref('User')
const userRole = ref('')
const attendance = ref('0%')
const assignmentCount = ref(0)
const paymentDue = ref(0)
const courses = ref([])
const schedule = ref([])
const currencySymbol = ref('Rs.') // Default

 

onMounted(async () => {
  await fetchSettings()
  await fetchSchedule()
  // ... existing user fetch
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
      // Fetch Detailed Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()
      
      if (profile) {
          // Map database role to display title
          const roleMap = {
              'admin': 'Admin',
              'teacher': 'Instructor',
              'student': 'Student'
          }
          userRole.value = roleMap[profile.role] || 'Member'
          
          // Use name if available, otherwise role
          userName.value = profile.full_name || userRole.value
      }
  }
})

const fetchSettings = async () => {
   const { data } = await supabase
     .from('system_settings')
     .select('value')
     .eq('key', 'config')
     .single()
   
   if (data?.value?.general?.currency?.symbol) {
       currencySymbol.value = data.value.general.currency.symbol
   }
}

const fetchSchedule = async () => {
    // Fetch upcoming classes
    const { data } = await supabase
        .from('class_schedules')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3)
        
    if (data && data.length > 0) {
        schedule.value = data.map(cls => {
            const d = new Date(cls.start_time)
            return {
                title: cls.title,
                time: date.formatDate(d, 'h:mm A'),
                date: date.formatDate(d, 'D'),
                month: date.formatDate(d, 'MMM'),
                link: cls.link
            }
        })
    }
}
</script>

<style scoped lang="scss">
.text-gradient {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card {
  border-radius: 20px;
  overflow: hidden;
  transition: transform 0.3s;
  border: none;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.bg-gradient-1 { background: linear-gradient(135deg, #4361ee 0%, #3f37c9 100%); }
.bg-gradient-2 { background: linear-gradient(135deg, #f72585 0%, #b5179e 100%); }
.bg-gradient-3 { background: linear-gradient(135deg, #4cc9f0 0%, #4895ef 100%); }

.bg-dark-card {
  background: #121212;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.05);
}

.course-card {
  overflow: hidden;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 10px 30px -10px rgba(67, 97, 238, 0.3);
    border-color: $primary;
  }
}

.date-badge {
  width: 50px;
  height: 50px;
  border-radius: 12px;
}

.bg-primary-soft { background: rgba($primary, 0.15); color: $primary; }
.bg-secondary-soft { background: rgba($secondary, 0.15); color: $secondary; }
.bg-dark-lighter { background: #1e1e1e; }

.action-btn {
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: background 0.2s;
  
  &:hover {
    background: #252525;
  }
}

.graph-card {
    background: transparent;
}

body.body--dark .graph-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
}
</style>
