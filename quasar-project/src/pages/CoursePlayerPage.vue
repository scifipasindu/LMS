<template>
  <q-page class="bg-black text-white full-height flex flex-center" v-if="loading">
    <q-spinner size="3em" color="primary" />
  </q-page>

  <q-page v-else-if="!hasAccess && !checkingAccess" class="flex flex-center bg-black text-white column">
      <q-icon name="lock" size="4em" color="negative" />
      <div class="text-h5 q-mt-md">Access Denied</div>
      <div class="text-grey q-mt-sm">You are not enrolled in this course.</div>
      <q-btn color="primary" label="Go Back" to="/dashboard/classes" class="q-mt-md" />
  </q-page>

  <q-page v-else class="bg-black text-white row">
    <!-- Main Video Section -->
    <div class="col-12 col-md-9 q-pa-md flex column">
        <div class="row items-center q-mb-md">
            <q-btn flat icon="arrow_back" color="grey" to="/dashboard/classes" />
            <div class="text-h5 q-ml-sm">{{ course.title }}</div>
        </div>

        <div class="video-container relative-position bg-dark rounded-borders overflow-hidden shadow-10" ref="videoContainer">
            <iframe 
                v-if="currentLesson"
                ref="videoIframe"
                width="100%" 
                height="100%" 
                :src="getEmbedUrl(currentLesson.video_id)" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
                class="absolute-full"
            ></iframe>
            <div v-else class="absolute-full flex flex-center text-grey">
                Select a lesson to start learning
            </div>

            <!-- SECURITY SHIELD: Covers Top part (prevents right click on video) but exposes controls -->
            <div 
                v-if="currentLesson" 
                class="absolute-top transparent-shield cursor-pointer" 
                style="z-index: 20; height: calc(100% - 60px);"
                @click="togglePlay"
                @contextmenu.prevent
            >
            </div>

            <!-- EXTRA SHIELDS: Block External Links -->
            <!-- Top Right: Blocks 'Share' and 'Watch Later' -->
            <div class="absolute-top-right" style="width: 120px; height: 80px; z-index: 30; cursor: default;" @click.stop @contextmenu.prevent></div>
            
            <!-- Bottom Right: Blocks 'YouTube' Logo -->
            <div class="absolute-bottom-right" style="width: 160px; height: 60px; z-index: 30; cursor: default;" @click.stop @contextmenu.prevent></div>
        </div>

        <div class="q-mt-md">
            <div class="row justify-between items-center">
                <div class="text-h6 text-primary">{{ currentLesson?.title || 'Course Intro' }}</div>
                <div v-if="currentLesson?.completed" class="text-positive text-subtitle2 flex items-center">
                    <q-icon name="check_circle" class="q-mr-xs" /> Completed
                </div>
            </div>
            <div class="text-caption text-grey-5">{{ course.description }}</div>
        </div>
    </div>

    <!-- Sidebar Playlist -->
    <div class="col-12 col-md-3 bg-dark-sidebar q-pa-md border-left">
        <div class="text-subtitle1 text-weight-bold q-mb-md text-uppercase text-grey-6 px-2">Course Payload</div>
        
        <q-scroll-area style="height: calc(100vh - 100px);">
            <div v-for="(subject, sIndex) in subjects" :key="subject.id" class="q-mb-sm">
                <q-expansion-item
                    group="subjects"
                    :default-opened="sIndex === 0"
                    header-class="bg-dark text-weight-bold text-subtitle1"
                    expand-icon-class="text-grey"
                    dense
                >
                    <template v-slot:header>
                         <q-item-section>
                             {{ subject.title }}
                         </q-item-section>
                    </template>

                    <div class="q-pl-sm">
                         <div v-for="(unit, uIndex) in subject.units" :key="unit.id" class="q-mb-xs">
                             <q-expansion-item
                                group="units"
                                :default-opened="uIndex === 0"
                                header-class="text-grey-4 text-subtitle2"
                                dense
                             >
                                <template v-slot:header>
                                    <q-item-section>
                                        {{ unit.title }}
                                    </q-item-section>
                                </template>

                                <q-list separator dark class="q-pl-sm">
                                    <q-item 
                                        v-for="(lesson) in unit.lessons" 
                                        :key="lesson.id" 
                                        clickable 
                                        v-ripple 
                                        :active="currentLesson?.id === lesson.id"
                                        active-class="bg-primary-glass text-white"
                                        @click="playLesson(lesson)"
                                        class="rounded-borders q-mb-xs"
                                        dense
                                    >
                                        <q-item-section avatar style="min-width: 30px">
                                             <q-icon v-if="lesson.completed" name="check_circle" color="positive" size="xs" />
                                             <q-icon v-else name="play_circle_outline" size="xs" :color="currentLesson?.id === lesson.id ? 'accent' : 'grey-7'" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label class="text-body2">{{ lesson.title }}</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                             </q-expansion-item>
                         </div>
                    </div>
                </q-expansion-item>
            </div>
            
            <div v-if="subjects.length === 0 && lessons.length === 0" class="text-grey text-center q-pa-md">
                No content available.
            </div>
        </q-scroll-area>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const loading = ref(true)
const course = ref({})
const lessons = ref([])
const subjects = ref([]) // NEW
const currentLesson = ref(null)
const videoIframe = ref(null)
const isPlaying = ref(false)
const hasAccess = ref(false)
const checkingAccess = ref(true)
const currentUserId = ref(null)

onMounted(async () => {
    // Listen for YouTube API messages
    window.addEventListener('message', handleMessage)

    const courseId = route.params.id
    if (!courseId) return

    loading.value = true
    try {
        // 1. Check Access First
        checkingAccess.value = true
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
             $q.notify({ type: 'warning', message: 'Please login first' })
             router.push('/login')
             return
        }
        currentUserId.value = user.id

        // Check if Admin
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin') {
            hasAccess.value = true
        } else {
            // Check Enrollment
            const { data: enrollment } = await supabase
                .from('enrollments')
                .select('id')
                .eq('user_id', user.id)
                .eq('course_id', courseId)
                .single()
            
            if (enrollment) {
                hasAccess.value = true
            } else {
                hasAccess.value = false
                loading.value = false
                return // Stop here if no access
            }
        }
        checkingAccess.value = false

        // Fetch Course
        const { data: cData, error: cError } = await supabase.from('courses').select('*').eq('id', courseId).single()
        if (cError) throw cError
        course.value = cData

        // FETCH HIERARCHY
        const { data: sData, error: sError } = await supabase.from('subjects')
            .select('*, units:course_units(*, lessons(*))')
            .eq('course_id', courseId)
            .order('created_at', { ascending: true }) // Subject Order

        if (sError) throw sError

        // Process Hierarchy & Flatten for Playlist
        const rawSubjects = sData || []
        const flatList = []
        
        // Sort & Assign
        subjects.value = rawSubjects.map(sub => {
            const units = (sub.units || []).sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
            
            return {
                ...sub,
                units: units.map(unit => {
                    const unitLessons = (unit.lessons || []).sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
                    // Add to flat list for auto-play logic
                    unitLessons.forEach(l => flatList.push(l))
                    return {
                        ...unit,
                        lessons: unitLessons
                    }
                })
            }
        })
        
        lessons.value = flatList // Keep a flat reference for completions logic

        // Fetch Completions
        const { data: completions } = await supabase.from('lesson_completions')
            .select('lesson_id')
            .eq('user_id', user.id)
            
        const completedIds = new Set((completions || []).map(c => c.lesson_id))

        // Mark completions in hierarchy
        subjects.value.forEach(sub => {
            sub.units.forEach(unit => {
                unit.lessons.forEach(l => {
                    l.completed = completedIds.has(l.id)
                })
            })
        })
        
        // Also update flat list
        lessons.value.forEach(l => l.completed = completedIds.has(l.id))

        // Auto-play first lesson
        if (lessons.value.length > 0) {
            currentLesson.value = lessons.value[0]
            // Expand first subject/unit
            if (subjects.value[0]) {
                 subjects.value[0].expanded = true
                 if (subjects.value[0].units[0]) {
                     subjects.value[0].units[0].expanded = true
                 }
            }
        }
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to load course content' })
    } finally {
        loading.value = false
        checkingAccess.value = false
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage)
})

const handleMessage = async (event) => {
    // Basic state tracking from YouTube events
    try {
        const data = JSON.parse(event.data)
        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
             // 1 = playing, 2 = paused, 0 = ended
             if (data.info.playerState === 1) isPlaying.value = true
             else if (data.info.playerState === 2) isPlaying.value = false
             else if (data.info.playerState === 0) {
                 // Video Ended
                 isPlaying.value = false
                 await markComplete()
             }
        }
    } catch {
        // ignore non-json messages
    }
}

const markComplete = async () => {
    if (!currentLesson.value || currentLesson.value.completed) return

    try {
        const { error } = await supabase.from('lesson_completions').insert([{
            user_id: currentUserId.value,
            lesson_id: currentLesson.value.id
        }])

        if (!error || error.code === '23505') { // Success or duplicate
            currentLesson.value.completed = true
            // Update in list
            const idx = lessons.value.findIndex(l => l.id === currentLesson.value.id)
            if (idx !== -1) lessons.value[idx].completed = true
            
            $q.notify({ 
                type: 'positive', 
                message: 'Lesson Completed!', 
                position: 'top', 
                timeout: 2000 
            })
        }
    } catch (e) {
        console.error('Completion error:', e)
    }
}

const videoContainer = ref(null)

const togglePlay = () => {
    if (!videoIframe.value) return
    const command = isPlaying.value ? 'pauseVideo' : 'playVideo'
    videoIframe.value.contentWindow.postMessage(JSON.stringify({
        'event': 'command',
        'func': command,
        'args': []
    }), '*')
    isPlaying.value = !isPlaying.value // optimistically update
}


const playLesson = (lesson) => {
    currentLesson.value = lesson
    isPlaying.value = true // Assume autoplay
}

const getEmbedUrl = (id) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1&controls=1&fs=1`
}
</script>
<style scoped>
.video-container {
    width: 100%;
    aspect-ratio: 16/9;
    background: #000;
}
.bg-gradient-fade {
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}
.bg-dark-glass {
    background: rgba(0, 0, 0, 0.4);
}
.bg-dark-sidebar {
    background: #121212;
    border-left: 1px solid rgba(255,255,255,0.05);
}
.bg-primary-glass {
    background: rgba(var(--q-primary), 0.2);
    border: 1px solid rgba(var(--q-primary), 0.5);
}
.border-left { border-left: 1px solid rgba(255,255,255,0.05); }

/* Responsive Adjustments */
@media (max-width: 1023px) {
    .bg-dark-sidebar {
        border-left: none;
        border-top: 1px solid rgba(255,255,255,0.05);
        height: auto;
    }
}
</style>
