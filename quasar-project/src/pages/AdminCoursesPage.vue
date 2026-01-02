<template>
  <q-page class="q-pa-lg text-white">
    <div class="row justify-between items-center q-mb-lg">
       <h4 class="text-h4 text-weight-bold q-my-none">Course Management</h4>
       <q-btn color="primary" icon="add" label="New Course" @click="openNewCourse" />
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner size="3em" color="primary" />
    </div>

    <div v-else class="row q-col-gutter-lg">
        <div class="col-12 col-md-6 col-lg-4" v-for="course in courses" :key="course.id">
            <q-card class="bg-dark-card text-white column full-height">
                <q-img :src="course.image_url || 'https://cdn.quasar.dev/img/parallax2.jpg'" :ratio="16/9">
                    <div class="absolute-top-right q-pa-xs">
                        <q-btn round flat dense icon="edit" color="white" class="bg-black-glass q-mr-xs" @click="editCourse(course)" />
                        <q-btn round flat dense icon="delete" color="negative" class="bg-black-glass" @click="deleteCourse(course.id)" />
                    </div>
                </q-img>
                <q-card-section>
                    <div class="text-h6">{{ course.title }}</div>
                    <div class="text-caption text-grey-5 ellipsis-2-lines">{{ course.description }}</div>
                    <q-chip dense color="primary" text-color="white" class="q-mt-sm">{{ course.lessons?.length || 0 }} Lessons</q-chip>
                </q-card-section>
                <q-card-actions align="right" class="q-mt-auto">
                    <q-btn flat color="accent" label="Manage Videos" @click="openLessonManager(course)" />
                </q-card-actions>
            </q-card>
        </div>
        
        <div class="col-12" v-if="courses.length === 0">
            <div class="text-grey text-center q-pa-xl">No courses found. Add one to get started!</div>
        </div>
    </div>

    <!-- ADD/EDIT COURSE DIALOG -->
    <q-dialog v-model="showCourseDialog" persistent>
        <q-card class="bg-dark text-white" style="min-width: 500px">
            <q-bar class="bg-black q-py-md">
                <div class="text-h6">{{ isEditing ? 'Edit Course' : 'Create New Course' }}</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup />
            </q-bar>

            <q-card-section class="q-gutter-y-md q-pt-md">
                <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-8">
                         <q-input filled dark v-model="courseForm.title" label="Course Title" :rules="[val => !!val || 'Required']" />
                    </div>
                    <div class="col-12 col-md-4">
                         <q-input filled dark v-model="courseForm.category" label="Subject/Category" hint="e.g. Science" />
                    </div>
                </div>

                <q-input filled dark v-model="courseForm.description" label="Description" type="textarea" rows="3" />
                
                <div class="row q-col-gutter-sm">
                     <div class="col-12 col-md-6">
                        <q-select 
                            filled dark 
                            v-model="courseForm.teacher_id" 
                            :options="instructors" 
                            option-value="id" 
                            option-label="email" 
                            label="Assign Instructor" 
                            emit-value 
                            map-options
                            hint="Select a Teacher/Admin"
                        />
                     </div>
                     <div class="col-12 col-md-6">
                        <q-input filled dark v-model="courseForm.schedule" label="Schedule" hint="Pick Date & Time">
                            <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date v-model="courseForm.schedule" mask="YYYY-MM-DD HH:mm" color="primary">
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Close" color="primary" flat />
                                            </div>
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                            <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-time v-model="courseForm.schedule" mask="YYYY-MM-DD HH:mm" format24h color="primary">
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Close" color="primary" flat />
                                            </div>
                                        </q-time>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                     </div>
                </div>

                <!-- IMAGE UPLOAD -->
                <div class="row items-center q-col-gutter-md">
                    <div class="col-grow">
                        <q-file 
                            filled dark 
                            v-model="imageFile" 
                            label="Upload Cover Image" 
                            accept="image/*"
                            @update:model-value="handleImageUpload"
                            :loading="uploadingImage"
                        >
                            <template v-slot:prepend>
                                <q-icon name="cloud_upload" />
                            </template>
                        </q-file>
                    </div>
                    <div class="col-auto" v-if="courseForm.image_url">
                        <q-avatar rounded size="60px">
                            <img :src="courseForm.image_url" style="object-fit: cover">
                        </q-avatar>
                    </div>
                </div>
                <!-- Fallback URL input -->
                <q-input filled dark v-model="courseForm.image_url" label="Or enter Image URL" caption="Auto-filled if you upload an image" />
            
            </q-card-section>

            <q-card-actions align="right" class="q-pb-md q-pr-md">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn color="primary" icon="save" label="Save Course" @click="saveCourse" :loading="processing || uploadingImage" />
            </q-card-actions>
        </q-card>
    </q-dialog>

    <!-- LESSON MANAGER DIALOG -->
    <q-dialog v-model="showLessonDialog" maximized transition-show="slide-up" transition-hide="slide-down">
        <q-card class="bg-dark text-white">
            <q-bar class="bg-black q-py-md">
                <q-btn dense flat icon="arrow_back" v-close-popup />
                <div class="text-h6 q-ml-md">Manage Videos: {{ selectedCourse?.title }}</div>
                <q-space />
                <q-btn color="accent" icon="add" label="Add Video" @click="showAddVideo = true" />
            </q-bar>
            
            <q-card-section class="q-pa-lg">
                <q-list dark separator bordered class="rounded-borders">
                    <q-item v-for="(lesson, index) in lessons" :key="lesson.id" class="q-py-md">
                        <q-item-section avatar>
                            <q-avatar color="primary" text-color="white">{{ index + 1 }}</q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-h6">{{ lesson.title }}</q-item-label>
                            <q-item-label caption class="text-grey-5">Video ID: {{ lesson.video_id }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <div class="row q-gutter-sm">
                                <q-btn flat round icon="play_circle" color="accent" @click="previewVideo(lesson.video_id)" />
                                <q-btn flat round icon="delete" color="negative" @click="deleteLesson(lesson.id)" />
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="lessons.length === 0">
                        <q-item-section class="text-center text-grey">No videos added yet.</q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
    </q-dialog>

    <!-- PREVIEW VIDEO DIALOG -->
    <q-dialog v-model="showPreview" maximized transition-show="scale" transition-hide="scale" style="z-index: 9999">
        <q-card class="bg-black text-white">
            <q-bar class="bg-dark">
                <div class="text-h6">Preview Video</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup />
            </q-bar>
            <q-card-section class="flex flex-center relative-position" style="height: calc(100vh - 50px)">
                 <div class="relative-position" style="width: 100%; max-width: 1200px; aspect-ratio: 16/9;">
                     <iframe 
                       v-if="previewId"
                       width="100%" 
                       height="100%" 
                       :src="`https://www.youtube.com/embed/${previewId}?autoplay=1&rel=0`" 
                       frameborder="0" 
                       allowfullscreen
                       style="border: 1px solid #333;"
                    ></iframe>
                    <!-- SECURITY SHIELDS -->
                    <div class="absolute-top-right transparent-shield" style="width: 100%; height: 80px; z-index: 10; cursor: default;"></div>
                    <div class="absolute-top-right transparent-shield" style="width: 200px; height: 120px; z-index: 11; cursor: default;"></div>
                    <!-- Bottom Right Shield for YouTube Logo -->
                    <div class="absolute-bottom-right transparent-shield" style="width: 150px; height: 60px; z-index: 10; cursor: default;"></div>
                 </div>
            </q-card-section>
        </q-card>
    </q-dialog>

    <!-- ADD VIDEO DIALOG -->
    <q-dialog v-model="showAddVideo" persistent>
        <q-card class="bg-dark-card text-white" style="min-width: 400px; border: 1px solid #333">
            <q-card-section>
                <div class="text-h6">Add YouTube Video</div>
            </q-card-section>
            <q-card-section class="q-gutter-y-md">
                <q-input filled dark v-model="videoForm.title" label="Lesson Title" :rules="[val => !!val || 'Required']" />
                <q-input 
                    filled dark 
                    v-model="videoForm.video_id" 
                    label="YouTube URL or ID" 
                    :rules="[val => !!val || 'Required']" 
                    hint="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
                />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn color="accent" label="Add Video" @click="saveLesson" :loading="processingVideo" />
            </q-card-actions>
        </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const courses = ref([])
const instructors = ref([]) 
const imageFile = ref(null)
const uploadingImage = ref(false)

// Course CRUD
const showCourseDialog = ref(false)
const isEditing = ref(false)
const processing = ref(false)
const courseForm = ref({ title: '', description: '', image_url: '', schedule: '', teacher_id: null, category: '' })
const editingId = ref(null)

// Lesson CRUD
const showLessonDialog = ref(false)
const selectedCourse = ref(null)
const lessons = ref([])
const showAddVideo = ref(false)
const videoForm = ref({ title: '', video_id: '' })
const processingVideo = ref(false)

// Video Preview
const showPreview = ref(false)
const previewId = ref(null)

onMounted(() => {
    fetchInstructors()
    fetchCourses()
})

const fetchInstructors = async () => {
    const { data } = await supabase.from('profiles').select('id, email, full_name').in('role', ['admin', 'teacher'])
    instructors.value = (data || []).map(p => ({
        id: p.id,
        email: p.full_name || p.email 
    }))
}

const handleImageUpload = async (file) => {
    if (!file) return
    uploadingImage.value = true
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `courses/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, file)
            
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)
        courseForm.value.image_url = data.publicUrl
        $q.notify({ type: 'positive', message: 'Image Uploaded!' })
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Upload failed' })
    } finally {
        uploadingImage.value = false
    }
}

const fetchCourses = async () => {
    loading.value = true
    const { data, error } = await supabase.from('courses').select('*, lessons(*)').order('created_at', { ascending: false })
    if (error) console.error(error)
    else courses.value = data
    loading.value = false
}

const saveCourse = async () => {
    if (!courseForm.value.title) return
    processing.value = true
    try {
        const payload = { ...courseForm.value }
        let error = null
        if (isEditing.value) {
            const { error: e } = await supabase.from('courses').update(payload).eq('id', editingId.value)
            error = e
        } else {
            const { error: e } = await supabase.from('courses').insert([payload])
            error = e
        }
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Course saved!' })
        showCourseDialog.value = false
        fetchCourses()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Error saving course' })
    } finally {
        processing.value = false
    }
}

const deleteCourse = async (id) => {
    if(!confirm('Delete this course and all its videos?')) return
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (!error) {
        $q.notify({ type: 'positive', message: 'Deleted' })
        fetchCourses()
    }
}

const editCourse = (course) => {
    isEditing.value = true
    editingId.value = course.id
    imageFile.value = null // Reset file input
    courseForm.value = { 
        title: course.title, 
        description: course.description, 
        image_url: course.image_url,
        schedule: course.schedule,
        teacher_id: course.teacher_id,
        category: course.category
    }
    showCourseDialog.value = true
}

const openNewCourse = () => {
    isEditing.value = false
    editingId.value = null
    imageFile.value = null // Reset file input
    courseForm.value = { title: '', description: '', image_url: '', schedule: '', teacher_id: null, category: '' }
    showCourseDialog.value = true
}

// VIDEO MANAGEMENT
const openLessonManager = async (course) => {
    selectedCourse.value = course
    await fetchLessons(course.id)
    showLessonDialog.value = true
}

const fetchLessons = async (courseId) => {
    const { data } = await supabase.from('lessons').select('*').eq('course_id', courseId).order('created_at', { ascending: true })
    lessons.value = data || []
}

// Extract YouTube ID from URL or String
const extractVideoId = (input) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input;
}

const previewVideo = (id) => {
    previewId.value = id
    showPreview.value = true
    $q.notify({ message: 'Opening Preview...', color: 'dark', icon: 'visibility' })
}

const saveLesson = async () => {
    if (!videoForm.value.title || !videoForm.value.video_id) return
    processingVideo.value = true
    try {
        // CLEAN ID BEFORE SAVING
        const cleanId = extractVideoId(videoForm.value.video_id)

        const { error } = await supabase.from('lessons').insert([{
            course_id: selectedCourse.value.id,
            title: videoForm.value.title,
            video_id: cleanId
        }])
        
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Video Added!' })
        videoForm.value = { title: '', video_id: '' }
        showAddVideo.value = false
        fetchLessons(selectedCourse.value.id)
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to add video' })
    } finally {
        processingVideo.value = false
    }
}

const deleteLesson = async (id) => {
    if(!confirm('Remove this video?')) return
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (!error) fetchLessons(selectedCourse.value.id)
}
</script>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }
.bg-black-glass { background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
</style>
