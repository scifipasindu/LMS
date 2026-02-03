<template>
  <q-page class="q-pa-lg">
    <div class="row justify-between items-center q-mb-lg">
       <h4 class="text-h4 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Course Management</h4>
       <q-btn v-if="!isStaff" color="primary" icon="add" label="New Course" @click="openNewCourse" />
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
        <q-spinner size="3em" color="primary" />
    </div>

    <div v-else class="row q-col-gutter-lg">
        <div class="col-12 col-md-6 col-lg-4" v-for="course in courses" :key="course.id">
            <q-card class="column full-height" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
                <q-img :src="course.image_url || 'https://cdn.quasar.dev/img/parallax2.jpg'" :ratio="16/9">
                </q-img>
                <q-card-section>
                    <div class="row items-center justify-between no-wrap q-mb-xs">
                         <div class="text-subtitle2 text-accent">{{ course.category || 'Uncategorized' }}</div>
                         <q-badge outline color="primary" class="q-ml-sm">{{ course.profiles?.full_name || 'Unknown' }}</q-badge>
                    </div>
                    <div class="text-h6 q-mb-xs">{{ course.title }}</div>
                    <div class="row items-center q-gutter-x-sm q-mb-xs">
                        <q-badge color="secondary" outline v-if="course.grade">Grade {{ course.grade }}</q-badge>
                        <q-chip dense outline color="grey-6" size="sm" icon="library_books">{{ course.lessons?.length || 0 }} Lessons</q-chip>
                    </div>
                    <div class="text-caption text-grey-5 ellipsis-2-lines">{{ course.description }}</div>
                </q-card-section>
                <q-card-actions class="q-mt-auto row justify-between">
                    <div>
                        <q-btn flat round icon="edit" color="primary" @click="editCourse(course)" />
                        <!-- Only Admin can delete -->
                        <q-btn v-if="!isStaff" flat round icon="delete" color="negative" @click="deleteCourse(course.id)" />
                        <!-- Only Admin can assign staff -->
                        <q-btn v-if="!isStaff" flat round icon="group_add" color="secondary" @click="openStaffManager(course)">
                            <q-tooltip>Assign Staff</q-tooltip>
                        </q-btn>
                        <!-- Enroll Student -->
                        <q-btn flat round icon="person_add" color="positive" @click="openEnrollmentManager(course)">
                            <q-tooltip>Enroll Student</q-tooltip>
                        </q-btn>
                    </div>
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
        <q-card style="width: 90vw; max-width: 600px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
            <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
                <div class="text-h6">{{ isEditing ? 'Edit Course' : 'Create New Course' }}</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup />
            </q-bar>

            <q-card-section class="q-gutter-y-md q-pt-md">
                <div class="row q-col-gutter-sm">
                    <div class="col-12">
                         <q-input filled :dark="$q.dark.isActive" v-model="courseForm.title" label="Course Title" :rules="[val => !!val || 'Required']" />
                    </div>
                    <div class="col-12 col-md-6">
                        <q-select
                            filled
                            :dark="$q.dark.isActive"
                            v-model="courseForm.grade"
                            :options="[1,2,3,4,5,6,7,8,9,10,11,12,13]"
                            label="Grade"
                            hint="Class/Year"
                            multiple
                            use-chips
                        />
                    </div>
                     <div class="col-12 col-md-6">
                        <q-select
                            filled
                            :dark="$q.dark.isActive"
                            v-model="courseForm.category"
                            use-input
                            input-debounce="0"
                            label="Subject/Category"
                            :options="subjectOptions"
                            @filter="filterSubjects"
                            @new-value="createSubjectValue"
                            behavior="menu"
                            hint="Select or Type new"
                        />
                     </div>
                </div>

                <q-input filled :dark="$q.dark.isActive" v-model="courseForm.description" label="Description" type="textarea" rows="3" />
                
                <div class="row q-col-gutter-sm">
                     <div class="col-12 col-md-6">
                        <q-select 
                            filled :dark="$q.dark.isActive" 
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
                        <q-input filled :dark="$q.dark.isActive" v-model="courseForm.schedule" label="Schedule" hint="Pick Date & Time">
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
                            filled :dark="$q.dark.isActive" 
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
                <q-input filled :dark="$q.dark.isActive" v-model="courseForm.image_url" label="Or enter Image URL" caption="Auto-filled if you upload an image" />
            
            </q-card-section>

            <q-card-actions align="right" class="q-pb-md q-pr-md">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn color="primary" icon="save" label="Save Course" @click="saveCourse" :loading="processing || uploadingImage" />
            </q-card-actions>
        </q-card>
    </q-dialog>

    <!-- CONTENT MANAGER DIALOG (Subjects > Units > Lessons) -->
    <q-dialog v-model="showLessonDialog" maximized transition-show="slide-up" transition-hide="slide-down">
        <q-card :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
            <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
                <q-btn dense flat icon="arrow_back" v-close-popup />
                <div class="text-h6 q-ml-md">Manage Content: {{ selectedCourse?.title }}</div>
                <q-space />
            </q-bar>
            
            <q-card-section class="q-pa-lg">
                <!-- Breadcrumbs -->
                <div class="row items-center q-mb-md text-h6">
                     <span class="cursor-pointer text-primary" @click="resetToSubjects">Subjects</span>
                     <q-icon name="chevron_right" v-if="currentSubject" />
                     <span v-if="currentSubject" class="cursor-pointer text-primary" @click="resetToUnits(currentSubject)">{{ currentSubject.title }}</span>
                     <q-icon name="chevron_right" v-if="currentUnit" />
                     <span v-if="currentUnit" class="text-grey">{{ currentUnit.title }}</span>
                </div>

                <!-- VIEW: SUBJECTS LIST -->
                <div v-if="!currentSubject">
                    <div class="row items-center justify-between q-mb-md">
                        <div class="text-h5">Subjects</div>
                        <q-btn color="primary" icon="add" label="Add Subject" @click="promptAddSubject" />
                    </div>
                    <q-list :dark="$q.dark.isActive" separator bordered class="rounded-borders">
                        <q-item v-for="subject in courseSubjects" :key="subject.id" clickable @click="selectSubject(subject)" v-ripple>
                            <q-item-section avatar>
                                <q-icon name="folder" color="warning" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="text-h6">{{ subject.title }}</q-item-label>
                                <q-item-label caption>{{ subject.units_count || 0 }} Units</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <div class="row q-gutter-sm">
                                    <q-btn flat round icon="edit" color="primary" @click.stop="promptEditSubject(subject)" />
                                    <q-btn flat round icon="delete" color="negative" @click.stop="deleteSubject(subject.id)" />
                                </div>
                            </q-item-section>
                        </q-item>
                         <q-item v-if="courseSubjects.length === 0">
                            <q-item-section class="text-center text-grey">No subjects created.</q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- VIEW: UNITS LIST -->
                <div v-else-if="currentSubject && !currentUnit">
                    <div class="row items-center justify-between q-mb-md">
                        <div class="text-h5">Units in {{ currentSubject.title }}</div>
                        <q-btn color="primary" icon="add" label="Add Unit" @click="promptAddUnit" />
                    </div>
                    <q-list :dark="$q.dark.isActive" separator bordered class="rounded-borders">
                        <q-item v-for="unit in subjectUnits" :key="unit.id" clickable @click="selectUnit(unit)" v-ripple>
                            <q-item-section avatar>
                                <q-icon name="article" color="secondary" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="text-h6">{{ unit.title }}</q-item-label>
                                <q-item-label caption>{{ unit.lessons_count || 0 }} Videos</q-item-label>
                            </q-item-section>
                             <q-item-section side>
                                <div class="row q-gutter-sm">
                                    <q-btn flat round icon="edit" color="primary" @click.stop="promptEditUnit(unit)" />
                                    <q-btn flat round icon="delete" color="negative" @click.stop="deleteUnit(unit.id)" />
                                </div>
                            </q-item-section>
                        </q-item>
                         <q-item v-if="subjectUnits.length === 0">
                            <q-item-section class="text-center text-grey">No units created.</q-item-section>
                        </q-item>
                    </q-list>
                </div>

                <!-- VIEW: LESSONS (VIDEOS) LIST -->
                <div v-else-if="currentUnit">
                    <div class="row items-center justify-between q-mb-md">
                        <div class="text-h5">Videos in {{ currentUnit.title }}</div>
                        <q-btn color="accent" icon="add" label="Add Video" @click="showAddVideo = true" />
                    </div>
                    <q-list :dark="$q.dark.isActive" separator bordered class="rounded-borders">
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
                </div>

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
        <q-card style="width: 90vw; max-width: 500px; border: 1px solid #333" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark'">
            <q-card-section>
                <div class="text-h6">Add YouTube Video</div>
            </q-card-section>
            <q-card-section class="q-gutter-y-md">
                <q-input filled :dark="$q.dark.isActive" v-model="videoForm.title" label="Lesson Title" :rules="[val => !!val || 'Required']" />
                <q-input 
                    filled :dark="$q.dark.isActive" 
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

    <!-- ASSIGN STAFF DIALOG -->
    <q-dialog v-model="showStaffDialog">
        <q-card style="width: 90vw; max-width: 500px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
             <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
                <div class="text-h6">Assign Staff</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup />
             </q-bar>
             
             <q-card-section>
                <div class="text-subtitle1 q-mb-sm">Select Staff to manage <b>{{ selectedCourse?.title }}</b></div>
                <div v-if="staffList.length === 0" class="text-grey">No Staff members found.</div>
                <q-list separator>
                     <q-item v-for="staff in staffList" :key="staff.id" tag="label" v-ripple>
                        <q-item-section side top>
                           <q-checkbox v-model="staff.assigned" @update:model-value="toggleAssignment(staff)" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                           <q-item-label>{{ staff.full_name || staff.email }}</q-item-label>
                           <q-item-label caption>{{ staff.email }}</q-item-label>
                        </q-item-section>
                     </q-item>
                </q-list>
             </q-card-section>
        </q-card>
    </q-dialog>

    <!-- ENROLLMENT MANAGER DIALOG -->
    <q-dialog v-model="showEnrollmentDialog">
        <q-card style="width: 90vw; max-width: 600px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
             <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
                <div class="text-h6">Enroll Students: {{ selectedCourse?.title }}</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup />
             </q-bar>
             
             <q-card-section>
                <!-- Add Student Form -->
                <div class="row q-col-gutter-sm items-center q-mb-md">
                    <div class="col-grow">
                    <div class="col-grow">
                         <StudentSelector 
                            v-model="selectedStudent" 
                            label="Search Student to Enroll" 
                            :dark="$q.dark.isActive"
                         />
                    </div>
                    </div>
                    <div class="col-auto">
                        <q-btn color="positive" icon="person_add" label="Enroll" @click="enrollStudent" :disable="!selectedStudent" />
                    </div>
                </div>

                <q-separator class="q-my-md" />

                <!-- Enrolled List -->
                <div class="text-subtitle1 q-mb-sm">Enrolled Students ({{ enrolledStudents.length }})</div>
                <div v-if="enrolledStudents.length === 0" class="text-grey">No students enrolled yet.</div>
                
                <q-list separator style="max-height: 400px; overflow-y: auto">
                     <q-item v-for="student in enrolledStudents" :key="student.id">
                        <q-item-section avatar>
                           <q-avatar color="primary" text-color="white" icon="person" />
                        </q-item-section>
                        <q-item-section>
                           <q-item-label>{{ student.full_name }}</q-item-label>
                           <q-item-label caption>{{ student.email }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn flat round icon="delete" color="negative" @click="unenrollStudent(student)">
                                <q-tooltip>Remove/Unenroll</q-tooltip>
                            </q-btn>
                        </q-item-section>
                     </q-item>
                </q-list>
             </q-card-section>
        </q-card>
    </q-dialog>

    <!-- PIN Dialog -->
    <PinDialog 
      v-model="showPin" 
      @verified="handlePinVerified" 
    />

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'
import PinDialog from 'components/PinDialog.vue'
import StudentSelector from 'components/StudentSelector.vue'

const $q = useQuasar()
const loading = ref(false)
const courses = ref([])
const instructors = ref([]) 
const subjects = ref([])
const subjectOptions = ref([])
const imageFile = ref(null)
const uploadingImage = ref(false)
const isStaff = ref(false) // New State

// Course CRUD
const showCourseDialog = ref(false)
const isEditing = ref(false)
const processing = ref(false)
const courseForm = ref({ title: '', description: '', image_url: '', schedule: '', teacher_id: null, category: '', grade: null })
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

// Staff Assignment
const showStaffDialog = ref(false)
const staffList = ref([])

onMounted(() => {
    fetchInstructors()
    fetchCourses()
    fetchSubjects()
})

const fetchSubjects = async () => {
    const { data } = await supabase.from('course_categories').select('name').order('name', { ascending: true })
    if (data) {
        subjects.value = data.map(s => s.name)
    }
}

const filterSubjects = (val, update) => {
    update(() => {
        if (val === '') {
            subjectOptions.value = subjects.value
        } else {
            const needle = val.toLowerCase()
            subjectOptions.value = subjects.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
        }
    })
}

const createSubjectValue = (val, done) => {
    if (val.length > 0) {
        if (!subjects.value.includes(val)) {
            subjects.value.push(val)
        }
        done(val, 'add-unique')
    }
}

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
    
    // Check Role First
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'staff') {
            isStaff.value = true
        }
    }

    let query = supabase.from('courses').select('*, lessons(*), profiles(full_name)').order('created_at', { ascending: false })

    // Filter for Staff
    if (isStaff.value) {
        const { data: assignments } = await supabase.from('course_assignments').select('course_id').eq('staff_id', user.id)
        if (assignments && assignments.length > 0) {
            const assignedIds = assignments.map(a => a.course_id)
            query = query.in('id', assignedIds)
        } else {
             // If no assignments, show nothing (force empty ID list)
             query = query.in('id', ['00000000-0000-0000-0000-000000000000'])
        }
    }

    const { data, error } = await query
    if (error) console.error(error)
    else courses.value = data
    
    loading.value = false
}

// PIN LOGIC
const showPin = ref(false)
const pendingPinAction = ref(null)

const triggerPin = (callback) => {
    pendingPinAction.value = callback
    showPin.value = true
}

const handlePinVerified = () => {
    if (pendingPinAction.value) pendingPinAction.value()
    pendingPinAction.value = null
}

const saveCourse = async () => {
    if (!courseForm.value.title) return
    
    // Require PIN for Adding/Editing Course
    triggerPin(async () => {
        processing.value = true
        try {
            const payload = { ...courseForm.value }
            
            // Format Grade: Array -> String "12-13"
            if (Array.isArray(payload.grade)) {
                if (payload.grade.length > 0) {
                     // Sort numbers 
                     const sorted = payload.grade.sort((a,b) => a - b)
                     payload.grade = sorted.join('-')
                } else {
                     payload.grade = null
                }
            }

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
    })
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

    // Handle Grade Parsing (Str -> Array)
    let parsedGrade = []
    if (course.grade) {
        // If "12-13" -> [12, 13]
        // If "12" -> [12]
        // If "1,2" -> [1,2]
        const str = String(course.grade)
        if (str.includes('-')) {
             parsedGrade = str.split('-').map(Number)
        } else if (str.includes(',')) {
             parsedGrade = str.split(',').map(Number)
        } else {
             parsedGrade = [Number(str)]
        }
    }

    courseForm.value = { 
        title: course.title, 
        description: course.description, 
        image_url: course.image_url,
        schedule: course.schedule,
        teacher_id: course.teacher_id,
        category: course.category,
        grade: parsedGrade.length > 0 ? parsedGrade : null
    }
    showCourseDialog.value = true
}

const openNewCourse = () => {
    isEditing.value = false
    editingId.value = null
    imageFile.value = null // Reset file input
    courseForm.value = { title: '', description: '', image_url: '', schedule: '', teacher_id: null, category: '', grade: [] }
    showCourseDialog.value = true
}

const courseSubjects = ref([])
const subjectUnits = ref([])
const currentSubject = ref(null)
const currentUnit = ref(null)

const openLessonManager = async (course) => {
    selectedCourse.value = course
    await loadSubjects(course.id)
    currentSubject.value = null
    currentUnit.value = null
    showLessonDialog.value = true
}

// 1. SUBJECTS LOGIC
const loadSubjects = async (courseId) => {
    const { data } = await supabase.from('subjects')
        .select('*, units:course_units(count)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true })
        
    courseSubjects.value = (data || []).map(s => ({
        ...s,
        units_count: s.units?.[0]?.count || 0
    }))
}

const promptAddSubject = () => {
    const name = prompt("Enter Subject Name:")
    if (!name) return
    createSubject(name)
}

const promptEditSubject = (subject) => {
    const name = prompt("Rename Subject:", subject.title)
    if (!name || name === subject.title) return
    updateSubject(subject.id, name)
}

const createSubject = async (title) => {
    const { error } = await supabase.from('subjects').insert([{
        course_id: selectedCourse.value.id,
        title
    }])
    if (!error) {
        $q.notify({ type: 'positive', message: 'Subject created' })
        loadSubjects(selectedCourse.value.id)
    }
}

const updateSubject = async (id, title) => {
    const { error } = await supabase.from('subjects').update({ title }).eq('id', id)
    if (!error) {
        $q.notify({ type: 'positive', message: 'Subject updated' })
        loadSubjects(selectedCourse.value.id)
    }
}

const deleteSubject = async (id) => {
    if (!confirm('Delete this Subject and ALL units/videos inside it?')) return
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (!error) loadSubjects(selectedCourse.value.id)
}

const selectSubject = async (subject) => {
    currentSubject.value = subject
    currentUnit.value = null
    // Load Units
    const { data } = await supabase.from('course_units')
        .select('*, lessons(count)')
        .eq('subject_id', subject.id)
        .order('created_at', { ascending: true })
        
    subjectUnits.value = (data || []).map(u => ({
        ...u,
        lessons_count: u.lessons?.[0]?.count || 0
    }))
}

const resetToSubjects = () => {
    currentSubject.value = null
    currentUnit.value = null
}

// 2. UNITS LOGIC
const promptAddUnit = () => {
    const name = prompt("Enter Unit Name:")
    if (!name) return
    createUnit(name)
}

const promptEditUnit = (unit) => {
    const name = prompt("Rename Unit:", unit.title)
    if (!name || name === unit.title) return
    updateUnit(unit.id, name)
}

const createUnit = async (title) => {
    const { error } = await supabase.from('course_units').insert([{
        subject_id: currentSubject.value.id,
        title
    }])
    if (!error) {
        $q.notify({ type: 'positive', message: 'Unit created' })
        selectSubject(currentSubject.value) // Reload
    }
}

const updateUnit = async (id, title) => {
    const { error } = await supabase.from('course_units').update({ title }).eq('id', id)
    if (!error) {
        $q.notify({ type: 'positive', message: 'Unit updated' })
        selectSubject(currentSubject.value) // Reload
    }
}

const deleteUnit = async (id) => {
    if (!confirm('Delete this Unit and ALL videos inside it?')) return
    const { error } = await supabase.from('course_units').delete().eq('id', id)
    if (!error) selectSubject(currentSubject.value)
}

const selectUnit = async (unit) => {
    currentUnit.value = unit
    fetchLessons(unit.id)
}

const resetToUnits = (subject) => {
    currentSubject.value = subject
    currentUnit.value = null
}

// 3. LESSONS LOGIC (Modified to use Unit ID)
const fetchLessons = async (unitId) => {
    const { data } = await supabase.from('lessons')
        .select('*')
        .eq('unit_id', unitId)
        .order('created_at', { ascending: true }) // You might want sequence_order later
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
            unit_id: currentUnit.value.id, // CHANGED: Link to Unit
            title: videoForm.value.title,
            video_id: cleanId
        }])
        
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Video Added!' })
        videoForm.value = { title: '', video_id: '' }
        showAddVideo.value = false
        fetchLessons(currentUnit.value.id)
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
    if (!error) fetchLessons(currentUnit.value.id)
}

// STAFF ASSIGNMENT LOGIC
const openStaffManager = async (course) => {
    selectedCourse.value = course
    showStaffDialog.value = true
    
    // Fetch All Staff
    const { data: allStaff } = await supabase.from('profiles')
        .select('id, full_name, email')
        .eq('role', 'staff')
        
    // Fetch Assigned Staff
    const { data: assignments } = await supabase.from('course_assignments')
        .select('staff_id')
        .eq('course_id', course.id)
        
    const assignedIds = (assignments || []).map(a => a.staff_id)
    
    // Merge
    staffList.value = (allStaff || []).map(s => ({
        ...s,
        assigned: assignedIds.includes(s.id)
    }))
}

const toggleAssignment = async (staff) => {
    if (staff.assigned) {
        // ASSIGN
        await supabase.from('course_assignments').insert([{
            course_id: selectedCourse.value.id,
            staff_id: staff.id
        }])
        $q.notify({ type: 'positive', message: `Attached ${staff.full_name || 'Staff'}` })
    } else {
        // UNASSIGN
        await supabase.from('course_assignments').delete()
            .eq('course_id', selectedCourse.value.id)
            .eq('staff_id', staff.id)
        $q.notify({ type: 'warning', message: `Removed ${staff.full_name || 'Staff'}` })
    }
}

// ENROLLMENT MANAGER LOGIC
const showEnrollmentDialog = ref(false)

const enrolledStudents = ref([])
const selectedStudent = ref(null)

const openEnrollmentManager = async (course) => {
    selectedCourse.value = course
    showEnrollmentDialog.value = true
    selectedStudent.value = null
    fetchEnrolledStudents(course.id)
}

const fetchEnrolledStudents = async (courseId) => {
    const { data } = await supabase.from('enrollments')
        .select('id, user_id, profiles:user_id(full_name, email)')
        .eq('course_id', courseId)
        
    enrolledStudents.value = (data || []).map(e => ({
        id: e.user_id, // We use user_id to identify
        enrollment_id: e.id,
        full_name: e.profiles?.full_name || 'Unknown',
        email: e.profiles?.email
    }))
}



const enrollStudent = async () => {
    if (!selectedStudent.value) return
    
    // Check if added
    if (enrolledStudents.value.some(s => s.id === selectedStudent.value.id)) {
        $q.notify({ type: 'warning', message: 'Student already enrolled' })
        return
    }

    // Require PIN for Enrolling Student
    triggerPin(async () => {
        const { error } = await supabase.from('enrollments').insert([{
            user_id: selectedStudent.value.id,
            course_id: selectedCourse.value.id
        }])

        if (error) {
            $q.notify({ type: 'negative', message: 'Failed to enroll' })
            console.error(error)
        } else {
            $q.notify({ type: 'positive', message: 'Student Enrolled!' })
            fetchEnrolledStudents(selectedCourse.value.id)
            selectedStudent.value = null
        }
    })
}

const unenrollStudent = async (student) => {
    if (!confirm(`Remove ${student.full_name} from this course?`)) return
    
    // Delete by enrollment_id if we have it, or composite
    const { error } = await supabase.from('enrollments')
        .delete()
        .eq('id', student.enrollment_id)
        
    if (error) {
         $q.notify({ type: 'negative', message: 'Failed to unenroll' })
    } else {
        $q.notify({ type: 'positive', message: 'Student Removed' })
        fetchEnrolledStudents(selectedCourse.value.id)
    }
}
</script>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }
.bg-black-glass { background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
</style>
