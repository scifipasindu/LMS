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
          
          <!-- Activity Graph -->
          <div class="q-mt-xl">
              <h5 class="text-h5 text-weight-bold q-mb-lg" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Learning Activity</h5>
              <q-card class="graph-card q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
                 <div v-if="activityData.length > 0" class="row items-end justify-between q-gutter-x-sm" style="height: 150px">
                    <div v-for="(day, idx) in activityData" :key="idx" 
                        class="column items-center" style="flex: 1; height: 100%">
                         <div class="col-grow relative-position full-width flex items-end justify-center">
                             <!-- Bar -->
                             <div 
                                class="rounded-borders"
                                :class="day.count > 0 ? 'bg-primary' : 'bg-primary-soft'" 
                                :style="{ height: day.percent + '%', width: '60%', minHeight: '4px', transition: 'height 0.5s ease' }"
                             ></div>
                         </div>
                         <div class="text-caption text-grey-6 q-mt-sm">{{ day.label }}</div>
                    </div>
                 </div>
                 <div v-else class="text-center text-grey q-py-lg">
                    No activity recorded this week.
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
           <div class="row q-col-gutter-sm q-mb-xl">
              <div class="col-6">
                 <q-btn unelevated :color="$q.dark.isActive ? 'dark-lighter' : 'white'" class="full-width action-btn shadow-1" no-caps @click="showUploadDialog = true">
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

           <!-- Community Polls -->
           <div class="row items-center justify-between q-mb-md">
              <h5 class="text-h5 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Polls</h5>
              <q-btn v-if="canCreatePoll" dense flat round icon="add_circle" color="primary" @click="showPollDialog = true">
                  <q-tooltip>Create Poll</q-tooltip>
              </q-btn>
           </div>
           
           <div v-if="polls.length > 0">
               <PollCard 
                  v-for="poll in polls" 
                  :key="poll.id" 
                  :poll="poll" 
                  :user-votes="poll.userVotes"
                  :is-admin="isAdmin"
                  :is-creator="poll.created_by === currentUserId"
                  :voting="voting"
                  @vote="handleVote"
                  @delete="deletePoll"
                  @end="endPoll"
               />
           </div>
           <div v-else class="text-grey text-center q-py-md">
               No active polls.
           </div>
       </div>
    </div>
    
    <PollCreatorDialog v-model="showPollDialog" @create="handleCreatePoll" />
    <HomeworkUploadDialog v-model="showUploadDialog" />
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar, date } from 'quasar'
import AnnouncementsSection from 'components/AnnouncementsSection.vue'
import PollCard from 'components/PollCard.vue'
import PollCreatorDialog from 'components/PollCreatorDialog.vue'
import HomeworkUploadDialog from 'components/HomeworkUploadDialog.vue'

const $q = useQuasar()

const userName = ref('User')
const userRole = ref('')
const currentUserId = ref(null)
const isAdmin = ref(false)
const canCreatePoll = computed(() => ['admin', 'teacher', 'staff'].includes(userRole.value.toLowerCase()))

const attendance = ref('0%')
const assignmentCount = ref(0)
const paymentDue = ref(0)
const courses = ref([])
const schedule = ref([])
const activityData = ref([])
const currencySymbol = ref('Rs.') // Default

// Polls State
const polls = ref([])
const showPollDialog = ref(false)
const showUploadDialog = ref(false)
const voting = ref(false)

onMounted(async () => {
  await fetchSettings()
  await fetchSchedule()
  // ... existing user fetch
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
      currentUserId.value = user.id
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
          userRole.value = roleMap[profile.role] || profile.role
          isAdmin.value = profile.role === 'admin'
          
          // Use name if available, otherwise role
          userName.value = profile.full_name || userRole.value
          
          fetchActivity()
          fetchMyCourses()
          fetchPolls()
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

// POLLS LOGIC
const fetchMyCourses = async () => {
    // 1. Get Enrollments
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
            course:courses (
                id, title, description, image_url,
                lessons (id)
            )
        `)
        .eq('user_id', currentUserId.value)

    if (!enrollments) return

    // 2. Get Completions
    const { data: completions } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_id', currentUserId.value)
    
    const completedSet = new Set((completions || []).map(c => c.lesson_id))

    // 3. Map
    courses.value = enrollments.map(e => {
        const c = e.course
        const totalLessons = c.lessons?.length || 0
        const completedLessons = (c.lessons || []).filter(l => completedSet.has(l.id)).length
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) : 0

        return {
            id: c.id,
            name: c.title,
            progress: progress,
            image: c.image_url
        }
    })
}

const fetchActivity = async () => {
    // Get last 7 days
    const today = new Date()
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 6) // Go back 6 days + today = 7 days
    
    const { data } = await supabase
        .from('lesson_completions')
        .select('completed_at')
        .eq('user_id', currentUserId.value)
        .gte('completed_at', lastWeek.toISOString())
    
    // Group by Day (Mon, Tue...)
    const daysMap = {} // { 'Mon': 5, 'Tue': 2 }
    const daysOrder = []
    
    // Initialize last 7 days buckets
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dayLabel = date.formatDate(d, 'ddd') // Mon, Tue
        daysOrder.push(dayLabel)
        daysMap[dayLabel] = 0
    }
    
    data?.forEach(item => {
        const d = new Date(item.completed_at)
        const dayLabel = date.formatDate(d, 'ddd')
        if (daysMap[dayLabel] !== undefined) {
             daysMap[dayLabel]++
        }
    })
    
    // Find Max for Scaling
    const maxCount = Math.max(...Object.values(daysMap), 5) // At least 5 for scale
    
    activityData.value = daysOrder.map(label => ({
        label,
        count: daysMap[label],
        percent: (daysMap[label] / maxCount) * 100
    }))
}

const fetchPolls = async () => {
    // 1. Fetch Polls with nested Questions and Options
    const { data: pollsData } = await supabase
        .from('polls')
        .select(`
            *,
            poll_questions (
                id, question_text, display_order,
                poll_options (
                    id, option_text, vote_count, is_correct
                )
            )
        `)
        .order('created_at', { ascending: false })
        .eq('is_active', true)
    
    if (!pollsData) return

    // 2. Fetch User Votes for these polls (Need to fetch ALL votes by user for these polls' questions)
    // We can join or just select from poll_votes where user_id = me
    const { data: userVotes } = await supabase
        .from('poll_votes')
        .select('poll_id, question_id, option_id')
        .eq('user_id', currentUserId.value)
        .in('poll_id', pollsData.map(p => p.id))
        
    const votesMap = {} // { questionId: optionId }
    userVotes?.forEach(v => {
        votesMap[v.question_id] = v.option_id
    })
    
    polls.value = pollsData.map(p => ({
        ...p,
        userVotes: votesMap, // Pass the whole map, simpler for checking
        poll_questions: p.poll_questions.sort((a,b) => a.display_order - b.display_order).map(q => ({
            ...q,
            poll_options: q.poll_options.sort((a,b) => a.option_text.localeCompare(b.option_text))
        }))
    }))
}

const handleCreatePoll = async ({ title, description, questions }) => {
    try {
        // 1. Create Poll
        const { data: poll, error } = await supabase.from('polls').insert([{
            created_by: currentUserId.value,
            title,
            description
        }]).select().single()
        
        if (error) throw error
        
        // 2. Create Questions & Options (Sequential for safety or Promise.all)
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            // Create Question
            const { data: qData, error: qError } = await supabase.from('poll_questions').insert([{
                poll_id: poll.id,
                question_text: q.text,
                display_order: i
            }]).select().single()
            
            if (qError) throw qError
            
            // Create Options for this Question
            const optionsData = q.options.map(opt => ({
                question_id: qData.id,
                option_text: opt.text,
                is_correct: opt.isCorrect
            }))
            
            const { error: optError } = await supabase.from('poll_options').insert(optionsData)
            if (optError) throw optError
        }
        
        $q.notify({ type: 'positive', message: 'Survey Created!' })
        showPollDialog.value = false
        fetchPolls()
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Failed to create survey' })
    }
}

const handleVote = async ({ pollId, questionId, optionId }) => {
    voting.value = true
    try {
        const { error } = await supabase.from('poll_votes').insert([{
            poll_id: pollId,
            question_id: questionId,
            option_id: optionId,
            user_id: currentUserId.value
        }])
        
        if (error) throw error
        
        // 2. Refresh Polls
        $q.notify({ type: 'positive', message: 'Vote Cast!' })
        fetchPolls()
        
    } catch (e) {
        if (e.message.includes('duplicate') || e.code === '23505') { // Unique constraint
             $q.notify({ type: 'warning', message: 'Already voted on this question!' })
        } else {
             console.error(e)
             $q.notify({ type: 'negative', message: 'Vote failed' })
        }
    } finally {
        voting.value = false
    }
}

const deletePoll = async (pollId) => {
    if(!confirm('Delete this poll?')) return
    const { error } = await supabase.from('polls').delete().eq('id', pollId)
    if (!error) fetchPolls()
}

const endPoll = async (pollId) => {
    const { error } = await supabase.from('polls').update({ is_active: false }).eq('id', pollId)
    if (!error) fetchPolls()
}
</script>

<style scoped lang="scss">
.text-gradient {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  background-clip: text;
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
