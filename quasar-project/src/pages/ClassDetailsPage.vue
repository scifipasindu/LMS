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
                    <div class="text-subtitle1 text-grey-4 q-mb-lg">{{ course.category || 'General' }} • {{ subjects.reduce((acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.lessons.length, 0), 0) }} Lessons</div>
                    
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
                    
                    <div v-if="subjects.length === 0" class="text-grey q-pa-md border-dashed rounded-borders text-center">
                        No content uploaded yet.
                    </div>

                    <div v-for="(subject, sIndex) in subjects" :key="subject.id" class="q-mb-md">
                        <q-expansion-item
                            group="subjects"
                            :default-opened="sIndex === 0"
                            :header-class="`${$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-grey-2 text-dark'} text-weight-bold text-subtitle1 rounded-borders`"
                            :expand-icon-class="$q.dark.isActive ? 'text-white' : 'text-grey-7'"
                            class="overflow-hidden rounded-borders shadow-1"
                            :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
                        >
                            <template v-slot:header>
                                 <q-item-section>
                                     {{ subject.title }}
                                 </q-item-section>
                                 <q-item-section side>
                                     <q-badge :color="$q.dark.isActive ? 'grey-8' : 'grey-3'" :text-color="$q.dark.isActive ? 'white' : 'dark'">{{ subject.units?.length || 0 }} Units</q-badge>
                                 </q-item-section>
                            </template>

                            <div class="q-pa-sm" :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'">
                                 <div v-for="(unit, uIndex) in subject.units" :key="unit.id" class="q-mb-sm">
                                     <q-expansion-item
                                        group="units"
                                        :default-opened="uIndex === 0"
                                        :header-class="`${$q.dark.isActive ? 'bg-grey-8 text-white' : 'bg-grey-1 text-dark'} text-weight-medium rounded-borders`"
                                        dense
                                        :expand-icon-class="$q.dark.isActive ? 'text-white' : 'text-grey-7'"
                                     >
                                        <template v-slot:header>
                                            <q-item-section avatar>
                                                <q-icon name="article" color="primary" />
                                            </q-item-section>
                                            <q-item-section>
                                                {{ unit.title }}
                                            </q-item-section>
                                            <q-item-section side>
                                                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey'">{{ unit.lessons?.length || 0 }} Videos</div>
                                            </q-item-section>
                                        </template>

                                        <q-list separator class="q-pl-lg" :dark="$q.dark.isActive">
                                            <q-item 
                                                v-for="(lesson) in unit.lessons" 
                                                :key="lesson.id" 
                                                clickable 
                                                v-ripple 
                                                :to="`/dashboard/course/${course.id}/learn`"
                                                class="rounded-borders"
                                            >
                                                <q-item-section avatar style="min-width: 30px">
                                                     <q-icon name="play_circle_outline" color="primary" size="sm" />
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label class="text-body2" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">{{ lesson.title }}</q-item-label>
                                                    <q-item-label caption :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey'">Video Lesson</q-item-label>
                                                </q-item-section>
                                                <q-item-section side>
                                                    <!-- Optional: show duration if available -->
                                                    <q-icon name="chevron_right" :color="$q.dark.isActive ? 'grey-5' : 'grey-5'" />
                                                </q-item-section>
                                            </q-item>
                                            <q-item v-if="unit.lessons?.length === 0">
                                                <q-item-section class="text-grey text-caption q-py-sm">No videos in this unit.</q-item-section>
                                            </q-item>
                                        </q-list>
                                     </q-expansion-item>
                                 </div>
                            </div>
                        </q-expansion-item>
                    </div>
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
const subjects = ref([])
const instructor = ref(null)

onMounted(async () => {
   const courseId = route.params.id
   if(courseId) {
       await fetchCourseDetails(courseId)
   }
})

const fetchCourseDetails = async (id) => {
    try {
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).single()
        if (error) throw error
        course.value = data
        
        // FETCH HIERARCHY
        const { data: sData, error: sError } = await supabase.from('subjects')
            .select('*, units:course_units(*, lessons(*))')
            .eq('course_id', id)
            .order('created_at', { ascending: true })

        if (sError) throw sError

        // Process & Sort
        subjects.value = (sData || []).map(sub => ({
            ...sub,
            units: (sub.units || []).sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).map(u => ({
                 ...u,
                 lessons: (u.lessons || []).sort((a,b) => new Date(a.created_at) - new Date(b.created_at))
            }))
        }))
        

        
        // Legacy support (if no subjects found, try flat fetch just in case, or show 0)
        lessons.value = [] // clear legacy
        
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
