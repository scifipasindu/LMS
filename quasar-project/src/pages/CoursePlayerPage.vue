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
            <!-- YouTube Player Container -->
            <div id="youtube-player" class="absolute-full"></div>
            
            <div v-if="!currentLesson" class="absolute-full flex flex-center text-grey" style="z-index: 10; background: #000;">
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
            <div class="absolute-top-right" style="width: 30%; height: 25%; z-index: 30; cursor: default;" @click.stop @contextmenu.prevent></div>
            
            <!-- Bottom Right: Blocks 'YouTube' Logo -->
            <div class="absolute-bottom-right" style="width: 25%; height: 20%; z-index: 30; cursor: default;" @click.stop @contextmenu.prevent></div>
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
const subjects = ref([]) 
const currentLesson = ref(null)
const isPlaying = ref(false)
const hasAccess = ref(false)
const checkingAccess = ref(true)
const currentUserId = ref(null)
const videoContainer = ref(null)



// YouTube Player
let player = null
const YT_API_URL = 'https://www.youtube.com/iframe_api'

onMounted(async () => {
    // Load YouTube API
    loadYoutubeApi()
    
    // Key Listener
    window.addEventListener('keydown', handleKeydown)

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

        // Mark completions in hierarchy & flat list
        lessons.value.forEach(l => l.completed = completedIds.has(l.id))
        subjects.value.forEach(sub => {
            sub.units.forEach(unit => {
                unit.lessons.forEach(l => l.completed = completedIds.has(l.id))
            })
        })

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
            // Delay init player slightly to ensure DOM is ready
            setTimeout(() => initPlayer(lessons.value[0].video_id), 500)
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
    window.removeEventListener('keydown', handleKeydown)
    if (player && player.destroy) {
        player.destroy()
    }
})

// --- YouTube API Logic ---

const loadYoutubeApi = () => {
    if (!window.YT) {
        const tag = document.createElement('script')
        tag.src = YT_API_URL
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
        
        // Define gloabl callback
        window.onYouTubeIframeAPIReady = () => {
            // Player will be inited when data is ready or explicitly called
        }
    }
}

const initPlayer = (videoId) => {
    if (!window.YT || !window.YT.Player) {
        // Retry if API not ready
        setTimeout(() => initPlayer(videoId), 500)
        return
    }

    if (player) {
        player.loadVideoById(videoId)
        return
    }

    player = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'modestbranding': 1,
            'rel': 0,
            'controls': 1,
            'fs': 1 // Enable fullscreen button (even if we block it)
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    })
}

const onPlayerStateChange = (event) => {
    if (event.data == window.YT.PlayerState.PLAYING) {
        isPlaying.value = true
    } else if (event.data == window.YT.PlayerState.PAUSED) {
        isPlaying.value = false
    } else if (event.data == window.YT.PlayerState.ENDED) {
        isPlaying.value = false
        markComplete()
    }
}

const togglePlay = () => {
    if (!player || !player.getPlayerState) return
    const state = player.getPlayerState()
    if (state === window.YT.PlayerState.PLAYING) {
        player.pauseVideo()
    } else {
        player.playVideo()
    }
}

const playLesson = (lesson) => {
    currentLesson.value = lesson
    if (player && player.loadVideoById) {
        player.loadVideoById(lesson.video_id)
        isPlaying.value = true
    } else {
        initPlayer(lesson.video_id)
    }
}

// --- Shortcuts ---

const handleKeydown = (e) => {
    // Fullscreen 'f'
    if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
    }
    
    // Seek Shortcuts
    if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime()
        if (e.key === 'ArrowRight') {
            player.seekTo(currentTime + 10, true)
        } else if (e.key === 'ArrowLeft') {
            player.seekTo(Math.max(currentTime - 10, 0), true)
        }
    }
}

const toggleFullscreen = () => {
    if (!videoContainer.value) return

    if (!document.fullscreenElement) {
        videoContainer.value.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
    } else {
        document.exitFullscreen()
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
