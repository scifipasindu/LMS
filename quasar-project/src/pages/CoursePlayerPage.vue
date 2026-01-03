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
                style="z-index: 20; height: calc(100% - 55px);"
                @click="togglePlay"
                @contextmenu.prevent
            >
            </div>
        </div>

        <div class="q-mt-md">
            <div class="text-h6 text-primary">{{ currentLesson?.title || 'Course Intro' }}</div>
            <div class="text-caption text-grey-5">{{ course.description }}</div>
        </div>
    </div>

    <!-- Sidebar Playlist -->
    <div class="col-12 col-md-3 bg-dark-sidebar q-pa-md border-left">
        <div class="text-subtitle1 text-weight-bold q-mb-md text-uppercase text-grey-6 px-2">Course Payload</div>
        
        <q-scroll-area style="height: calc(100vh - 100px);">
            <q-list separator dark>
                <q-item 
                    v-for="(lesson, index) in lessons" 
                    :key="lesson.id" 
                    clickable 
                    v-ripple 
                    :active="currentLesson?.id === lesson.id"
                    active-class="bg-primary-glass text-white"
                    @click="playLesson(lesson)"
                    class="rounded-borders q-mb-xs"
                >
                    <q-item-section avatar>
                        <q-avatar size="sm" :color="currentLesson?.id === lesson.id ? 'accent' : 'grey-8'" text-color="white">
                            {{ index + 1 }}
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label class="text-subtitle2">{{ lesson.title }}</q-item-label>
                        <q-item-label caption class="text-grey-5">Video</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="currentLesson?.id === lesson.id">
                        <q-icon name="play_circle" color="accent" />
                    </q-item-section>
                </q-item>
            </q-list>
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
const currentLesson = ref(null)
const videoIframe = ref(null)
const isPlaying = ref(false)
const hasAccess = ref(false)
const checkingAccess = ref(true)

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

        // Fetch Lessons
        const { data: lData, error: lError } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('created_at', { ascending: true })
        if (lError) throw lError
        lessons.value = lData || []

        // Auto-play first lesson
        if (lessons.value.length > 0) {
            currentLesson.value = lessons.value[0]
        }
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to load course' })
    } finally {
        loading.value = false
        checkingAccess.value = false
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage)
})

const handleMessage = (event) => {
    // Basic state tracking from YouTube events
    try {
        const data = JSON.parse(event.data)
        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
             // 1 = playing, 2 = paused, 0 = ended
             if (data.info.playerState === 1) isPlaying.value = true
             else if (data.info.playerState === 2) isPlaying.value = false
        }
    } catch {
        // ignore non-json messages
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
