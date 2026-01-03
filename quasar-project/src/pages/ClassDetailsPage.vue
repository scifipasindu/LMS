<template>
  <q-page>
    <div v-if="loading" class="flex flex-center" style="height: 400px">
        <q-spinner size="3em" color="primary" />
    </div>

    <div v-else>
        <!-- Hero Section -->
        <div class="relative-position" style="height: 300px;">
             <!-- Background Image with Overlay -->
             <q-img 
                :src="course.image_url || 'https://cdn.quasar.dev/img/parallax2.jpg'" 
                class="absolute-full"
                style="height: 100%;"
             >
                <div class="absolute-full bg-black-grad flex flex-center column q-px-xl text-center">
                    <h2 class="text-h2 text-weight-bold text-white q-mb-sm">{{ course.title }}</h2>
                    <div class="text-subtitle1 text-grey-4 q-mb-lg">{{ course.category || 'General' }} • {{ lessons.length }} Lessons</div>
                    
                    <q-btn 
                        push 
                        color="accent" 
                        size="lg" 
                        icon="play_arrow" 
                        label="Start Learning" 
                        :to="`/dashboard/course/${course.id}/learn`"
                        class="shadow-10"
                    />
                </div>
             </q-img>
        </div>

        <div class="q-pa-lg" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">
            <div class="row q-col-gutter-xl">
                <!-- Left Column: Details -->
                <div class="col-12 col-md-8">
                    <div class="text-h5 text-weight-bold q-mb-md">About this Course</div>
                    <p class="text-body1 text-grey-6" style="white-space: pre-line;">
                        {{ course.description || 'No description available for this course.' }}
                    </p>
                    
                    <q-separator class="q-my-xl" />
                    
                    <div class="text-h5 text-weight-bold q-mb-md">Course Content</div>
                    <q-list bordered separator class="rounded-borders" :dark="$q.dark.isActive">
                        <q-item v-for="(lesson, index) in lessons" :key="lesson.id" clickable v-ripple :to="`/dashboard/course/${course.id}/learn`">
                            <q-item-section avatar>
                                <q-avatar color="primary" text-color="white" size="sm">{{ index + 1 }}</q-avatar>
                            </q-item-section>
                            
                            <q-item-section>
                                <q-item-label class="text-weight-bold">{{ lesson.title }}</q-item-label>
                                <q-item-label caption class="text-grey">Video Lesson</q-item-label>
                            </q-item-section>
                            
                            <q-item-section side>
                                <q-icon name="play_circle_outline" color="grey" />
                            </q-item-section>
                        </q-item>
                        
                        <q-item v-if="lessons.length === 0">
                            <q-item-section class="text-grey text-center q-pa-md">
                                No lessons added yet.
                            </q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- Right Column: Info Card -->
                <div class="col-12 col-md-4">
                    <q-card flat bordered :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-grey-1'">
                        <q-card-section>
                            <div class="text-subtitle2 text-grey text-uppercase q-mb-sm">Instructor</div>
                            <div class="row items-center q-mb-md">
                                <q-avatar size="40px" class="q-mr-sm">
                                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                                </q-avatar>
                                <div>
                                    <div class="text-weight-bold">{{ instructor?.full_name || 'Unknown Instructor' }}</div>
                                    <div class="text-caption text-grey">Senior Teacher</div>
                                </div>
                            </div>
                            
                            <q-separator class="q-my-md" />
                            
                            <div class="text-subtitle2 text-grey text-uppercase q-mb-sm">Schedule</div>
                            <div class="row items-center">
                                <q-icon name="event" class="q-mr-xs text-primary" />
                                <span>{{ course.schedule || 'Flexible Schedule' }}</span>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'boot/supabase'

const route = useRoute()
const loading = ref(true)
const course = ref({})
const lessons = ref([])
const instructor = ref(null)

onMounted(async () => {
   const courseId = route.params.id
   if(courseId) {
       await fetchCourseDetails(courseId)
   }
})

const fetchCourseDetails = async (id) => {
    try {
        const { data, error } = await supabase.from('courses').select('*, lessons(*)').eq('id', id).single()
        if (error) throw error
        
        course.value = data
        lessons.value = data.lessons?.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)) || []
        
        if (data.teacher_id) {
            const { data: teacher } = await supabase.from('profiles').select('full_name').eq('id', data.teacher_id).single()
            instructor.value = teacher
        }
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped lang="scss">
.bg-black-grad {
    background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3));
}
.bg-dark-card {
    background: #1e1e1e;
}
</style>
