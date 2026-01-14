<template>
  <q-page class="q-pa-lg" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">
    <h4 class="text-h4 text-weight-bold q-mb-lg">Admin Dashboard</h4>
    
    <div class="row q-col-gutter-lg">
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold text-primary">3</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Total Users</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold text-secondary">{{ activeSessions }}</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Active Sessions</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold text-accent">$0</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Revenue (Today)</div>
          </q-card>
       </div>
       <div class="col-12 col-md-3">
          <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
             <div class="text-h2 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">{{ adminCount }}</div>
             <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Admin Users</div>
          </q-card>
       </div>
    </div>
    
    <div class="row q-col-gutter-lg q-mt-xs">
        <div class="col-12 col-md-4">
             <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
                 <div class="text-h2 text-weight-bold text-positive">{{ totalEnrollments }}</div>
                 <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Total Enrollments</div>
             </q-card>
        </div>
        <div class="col-12 col-md-4">
             <q-card class="text-center q-pa-md" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-2'">
                 <div class="text-h2 text-weight-bold text-info">{{ totalCompletions }}</div>
                 <div class="text-subtitle1" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-8'">Lessons Completed</div>
             </q-card>
        </div>
    </div>

    <div class="q-mt-xl">
        <AnnouncementsSection />
    </div>
    
    <div class="row q-mt-xl">
       <div class="col-12 col-md-8">
           <div class="row items-center justify-between q-mb-md">
              <h5 class="text-h5 text-weight-bold q-my-none">Community Polls</h5>
              <q-btn dense flat round icon="add_circle" color="primary" @click="showPollDialog = true">
                  <q-tooltip>Create Poll</q-tooltip>
              </q-btn>
           </div>
           
           <div v-if="polls.length > 0">
               <PollCard 
                  v-for="poll in polls" 
                  :key="poll.id" 
                  :poll="poll" 
                  :user-votes="poll.userVotes"
                  :is-admin="true"
                  :is-creator="poll.created_by === currentUserId"
                  :voting="voting"
                  @vote="handleVote"
                  @delete="deletePoll"
                  @end="endPoll"
               />
           </div>
           <div v-else class="text-grey text-center q-py-md">
               No polls created.
           </div>
       </div>

       <div class="col-12 col-md-4">
          <h5 class="text-h5 text-weight-bold q-mb-md">Quick Actions</h5>
          <q-btn unelevated color="primary" label="Manage Users" to="/admin/users" class="q-mr-md" />
          <q-btn outline :color="$q.dark.isActive ? 'white' : 'primary'" label="System Settings" to="/admin/settings" />
       </div>
    </div>
    
    <PollCreatorDialog v-model="showPollDialog" @create="handleCreatePoll" />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'
import AnnouncementsSection from 'components/AnnouncementsSection.vue'
import PollCard from 'components/PollCard.vue'
import PollCreatorDialog from 'components/PollCreatorDialog.vue'

const $q = useQuasar()
const polls = ref([])
const showPollDialog = ref(false)
const voting = ref(false)
const currentUserId = ref(null)

// Stats
const totalEnrollments = ref(0)
const totalCompletions = ref(0)
const adminCount = ref(1)
const activeSessions = ref(0)

onMounted(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        currentUserId.value = user.id
        fetchPolls()
        fetchStats()
    }
})

const fetchStats = async () => {
    // Enrollments
    const { count: enrollCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true })
    totalEnrollments.value = enrollCount || 0
    
    // Completions
    const { count: completeCount } = await supabase.from('lesson_completions').select('*', { count: 'exact', head: true })
    totalCompletions.value = completeCount || 0
    
    // Admins
    const { count: admins } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin')
    adminCount.value = admins || 1
}

const fetchPolls = async () => {
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
    
    if (!pollsData) return

    const { data: userVotes } = await supabase
        .from('poll_votes')
        .select('poll_id, question_id, option_id')
        .eq('user_id', currentUserId.value)
        .in('poll_id', pollsData.map(p => p.id))
        
    const votesMap = {}
    userVotes?.forEach(v => {
        votesMap[v.question_id] = v.option_id
    })
    
    polls.value = pollsData.map(p => ({
        ...p,
        userVotes: votesMap,
        poll_questions: p.poll_questions.sort((a,b) => a.display_order - b.display_order).map(q => ({
            ...q,
            poll_options: q.poll_options.sort((a,b) => a.option_text.localeCompare(b.option_text))
        }))
    }))
}

const handleCreatePoll = async ({ title, description, questions }) => {
    try {
        const { data: poll, error } = await supabase.from('polls').insert([{
            created_by: currentUserId.value,
            title,
            description
        }]).select().single()
        
        if (error) throw error
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            const { data: qData, error: qError } = await supabase.from('poll_questions').insert([{
                poll_id: poll.id,
                question_text: q.text,
                display_order: i
            }]).select().single()
            if (qError) throw qError
            
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
        
        $q.notify({ type: 'positive', message: 'Vote Cast!' })
        fetchPolls()
        
    } catch (e) {
        if (e.message.includes('duplicate') || e.code === '23505') {
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

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; }
</style>
