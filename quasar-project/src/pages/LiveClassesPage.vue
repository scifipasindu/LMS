<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div class="row items-center">
        <q-icon name="live_tv" size="2em" color="primary" class="q-mr-md" />
        <div class="text-h4 text-weight-bold" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Live Classes</div>
      </div>
      <q-btn 
        v-if="canCreate"
        color="primary" 
        icon="add" 
        label="Schedule Class" 
        rounded
        no-caps
        @click="openScheduleDialog"
      />
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-lg">
       <div class="col-12 col-md-4">
          <q-select
             v-model="filterCourse"
             :options="courseOptions"
             label="Filter by Course"
             filled
             dense
             clearable
             emit-value
             map-options
             :dark="$q.dark.isActive"
             @update:model-value="fetchClasses"
          />
       </div>
    </div>

    <!-- Live Classes List -->
    <div v-if="loading" class="row justify-center q-py-xl">
       <q-spinner-dots size="3em" color="primary" />
    </div>

    <div v-else-if="classes.length > 0" class="row q-col-gutter-lg">
        <div v-for="cls in classes" :key="cls.id" class="col-12 col-md-6 col-lg-4">
             <q-card class="class-card h-full column" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
                <q-img 
                 :src="cls.thumbnail_url || getPlatformImage(cls.platform)"
                 height="150px"
                 class="white-text"
                >
                  <div class="absolute-bottom text-subtitle2 text-weight-bold">
                    {{ cls.platform.toUpperCase() }}
                  </div>
                </q-img>

                <q-card-section class="col">
                   <div class="row items-center justify-between q-mb-xs">
                      <q-badge color="primary">{{ cls.courses?.title || 'General' }}</q-badge>
                      <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-6'">
                         {{ formatDate(cls.start_time) }}
                      </div>
                   </div>
                   <div class="text-h6 text-weight-bold q-mt-sm">{{ cls.title }}</div>
                   <div class="text-body2 q-mt-xs" :class="$q.dark.isActive ? 'text-grey-4' : 'text-grey-7'">
                       {{ cls.description || 'No description provided.' }}
                   </div>
                   
                   <div class="row items-center q-mt-md text-caption text-grey">
                      <q-icon name="person" size="16px" class="q-mr-xs" />
                      Instructor: {{ cls.profiles?.full_name || 'Unknown' }}
                   </div>
                </q-card-section>
                
                <q-separator :dark="$q.dark.isActive" />
                
                <q-card-actions align="right" class="q-pa-md">
                   <!-- Allow adding students even if course is not linked (logic handled in dialog) -->
                   <q-btn flat color="secondary" icon="group_add" v-if="canDelete(cls)" @click="openEnrollDialog(cls)" dense round>
                       <q-tooltip>Add Student to this Course</q-tooltip>
                   </q-btn>
                   <q-btn flat color="negative" icon="delete" v-if="canDelete(cls)" @click="confirmDelete(cls)" dense round />
                   <q-btn 
                     :color="isExampleLink(cls.link) ? 'grey' : 'primary'" 
                     :label="isExampleLink(cls.link) ? 'Link Not Available' : 'Join Class'"
                     :icon="isExampleLink(cls.link) ? 'link_off' : 'launch'"
                     type="a" 
                     :href="cls.link" 
                     target="_blank" 
                     rounded 
                     no-caps
                     :disable="isExampleLink(cls.link)"
                   />
                </q-card-actions>
             </q-card>
        </div>
    </div>
    
    <div v-else class="text-center q-py-xl">
        <q-icon name="event_busy" size="4em" color="grey-5" />
        <div class="text-h6 text-grey-5 q-mt-md">No live classes scheduled.</div>
    </div>

    <!-- Schedule Dialog -->
    <q-dialog v-model="dialog" persistent>
       <q-card style="min-width: 500px" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark'">
          <q-card-section>
             <div class="text-h6">Schedule New Class</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
             <q-input 
                v-model="form.title" 
                label="Class Title" 
                filled 
                :dark="$q.dark.isActive" 
                :rules="[val => !!val || 'Title is required']"
             />
             
             <q-select
                v-model="form.course_id"
                :options="courseOptions"
                label="Course (Optional)"
                filled
                emit-value
                map-options
                :dark="$q.dark.isActive"
             />

             <q-input 
                v-model="form.description" 
                label="Description" 
                filled 
                type="textarea" 
                autogrow
                :dark="$q.dark.isActive" 
             />

             <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                   <q-select
                      v-model="form.platform"
                      :options="platformOptions"
                      label="Platform"
                      filled
                      emit-value
                      map-options
                      :dark="$q.dark.isActive"
                   />
                </div>
                <div class="col-12 col-md-6">
                   <q-input 
                      v-model="form.start_time" 
                      label="Start Time" 
                      filled 
                      :dark="$q.dark.isActive"
                      type="datetime-local"
                      :rules="[val => !!val || 'Start time is required']"
                   />
                </div>
                <div class="col-12 col-md-6">
                   <q-input 
                      v-model="form.expires_at" 
                      label="Auto Remove At (Optional)" 
                      filled 
                      :dark="$q.dark.isActive"
                      type="datetime-local"
                      hint="Leave empty to keep indefinitely"
                   />
                </div>
             </div>

             <q-input 
                v-model="form.link" 
                label="Meeting Link" 
                filled 
                :dark="$q.dark.isActive" 
                hint="e.g. Zoom invite link"
                :rules="[val => !!val || 'Link is required']"
             />

             <q-file
                v-model="form.thumbnailFile"
                label="Class Thumbnail (Optional)"
                filled
                :dark="$q.dark.isActive"
                accept=".jpg, .png, .jpeg, .webp"
             >
                <template v-slot:prepend>
                   <q-icon name="image" />
                </template>
             </q-file>

          </q-card-section>

          <q-card-actions align="right" class="text-primary">
             <q-btn flat label="Cancel" v-close-popup />
             <q-btn flat label="Schedule" @click="saveClass" :loading="saving" />
          </q-card-actions>
       </q-card>
    </q-dialog>

    <!-- ENROLL DIALOG -->
    <q-dialog v-model="showEnrollDialog">
        <q-card style="min-width: 500px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
             <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
                <div class="text-h6">Enroll Student to Course</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup />
             </q-bar>
             
             <q-card-section>
                <div class="text-subtitle2 q-mb-md">
                    Adding student to course: <b>{{ selectedClassForEnroll?.courses?.title || 'Unknown Course' }}</b>
                </div>
                <div class="row q-col-gutter-sm items-center q-mb-md">
                    <div class="col-grow">
                         <StudentSelector 
                            v-model="studentToEnroll" 
                            label="Select Student" 
                            :dark="$q.dark.isActive"
                         />
                    </div>
                    <div class="col-auto">
                        <q-btn color="positive" icon="person_add" label="Add Access" @click="enrollStudentToCourse" :disable="!studentToEnroll" :loading="enrolling" />
                    </div>
                </div>
             </q-card-section>
        </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar, date } from 'quasar'
import StudentSelector from 'components/StudentSelector.vue'

const $q = useQuasar()
const classes = ref([])
const loading = ref(false)
const dialog = ref(false)
const saving = ref(false)
const filterCourse = ref(null)
const courseOptions = ref([])
const userRole = ref(null)
const userId = ref(null)

const form = ref({
   title: '',
   description: '',
   link: '',
   platform: 'zoom',
   start_time: '',
   course_id: null,
   thumbnailFile: null // New field
})

const platformOptions = [
   { label: 'Zoom', value: 'zoom' },
   { label: 'Google Meet', value: 'google_meet' },
   { label: 'YouTube', value: 'youtube' },
   { label: 'Other', value: 'other' }
]

const canCreate = computed(() => ['admin', 'teacher'].includes(userRole.value))

onMounted(async () => {
   await checkUser()
   await fetchCourses()
   await fetchClasses()
})

const checkUser = async () => {
   const { data: { user } } = await supabase.auth.getUser()
   if (user) {
      userId.value = user.id
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (data) userRole.value = data.role
   }
}

const fetchCourses = async () => {
   const { data } = await supabase.from('courses').select('id, title')
   if (data) {
       courseOptions.value = data.map(c => ({ label: c.title, value: c.id }))
   }
}

const fetchClasses = async () => {
   loading.value = true
   try {
       let query = supabase
         .from('class_schedules')
         .select(`*, courses(title), profiles(full_name)`)
         .order('start_time', { ascending: true })
         .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`) // Show if NULL (forever) OR Future Expiry

       // If Student, Get Enrolled Courses First
       if (userRole.value === 'student' && userId.value) {
           const { data: enrollments } = await supabase
              .from('enrollments')
              .select('course_id')
              .eq('user_id', userId.value)
           
           const enrolledIds = (enrollments || []).map(e => e.course_id)
           
           // Include classes with NO course (General) OR Enrolled Course
           // Supabase doesn't support complex OR with different columns easily in one go without raw filter
           // But 'course_id.in.(...)' is simple. 
           // To allow nulls, we might need a workaround or just fetch all and filter in JS if the list is small. 
           // Or use .or(`course_id.in.(${enrolledIds.join(',')}),course_id.is.null`)
           
           if (enrolledIds.length > 0) {
               query = query.or(`course_id.in.(${enrolledIds.join(',')}),course_id.is.null`)
           } else {
               query = query.is('course_id', null)
           }
       }
       
       if (filterCourse.value) {
           query = query.eq('course_id', filterCourse.value)
       }
       
       const { data, error } = await query
       if (error) throw error
       classes.value = data
   } catch (err) {
       console.error(err)
       $q.notify({ type: 'negative', message: 'Failed to fetch classes' })
   } finally {
       loading.value = false
   }
}

const openScheduleDialog = () => {
    form.value = {
       title: '',
       description: '',
       link: '',
       platform: 'zoom',
       start_time: '',
       expires_at: '',
       course_id: null
    }
    dialog.value = true
}

const saveClass = async () => {
    // Basic validation
    if (!form.value.title || !form.value.start_time || !form.value.link) {
        $q.notify({ type: 'warning', message: 'Please fill required fields' })
        return
    }

    saving.value = true
    try {
        let thumbnailUrl = null
        
        // Upload thumbnail if selected
        if (form.value.thumbnailFile) {
            const file = form.value.thumbnailFile
             const fileExt = file.name.split('.').pop()
             const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
             const filePath = `${fileName}`
             
             const { error: uploadError } = await supabase.storage
                .from('class-thumbnails')
                .upload(filePath, file)
                
             if (uploadError) throw uploadError
             
             const { data: { publicUrl } } = supabase.storage
                .from('class-thumbnails')
                .getPublicUrl(filePath)
                
             thumbnailUrl = publicUrl
        }

        const { error } = await supabase.from('class_schedules').insert({
            title: form.value.title,
            description: form.value.description,
            link: form.value.link,
            platform: form.value.platform,
            start_time: new Date(form.value.start_time).toISOString(),
            expires_at: form.value.expires_at ? new Date(form.value.expires_at).toISOString() : null,
            course_id: form.value.course_id,
            created_by: userId.value,
            thumbnail_url: thumbnailUrl
        })

        if (error) throw error
        
        $q.notify({ type: 'positive', message: 'Class scheduled successfully' })
        dialog.value = false
        fetchClasses()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to schedule class: ' + (err.message || 'Unknown error') })
    } finally {
        saving.value = false
    }
}

const canDelete = (cls) => {
    return userRole.value === 'admin' || (userRole.value === 'teacher' && cls.created_by === userId.value)
}

const confirmDelete = (cls) => {
    if (!confirm('Are you sure you want to cancel this class?')) return
    
    // Optimistic UI update or actually delete
    // ... logic to delete
    deleteClass(cls.id)
}

const deleteClass = async (id) => {
    try {
        const { error } = await supabase.from('class_schedules').delete().eq('id', id)
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Class cancelled' })
        fetchClasses()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to cancel class' })
    }
}

const formatDate = (val) => {
    return date.formatDate(val, 'MMM D, YYYY [at] h:mm A')
}

const getPlatformImage = (platform) => {
    // Return relevant placeholder images or material patterns
    if (platform === 'zoom') return 'https://cdn.pixabay.com/photo/2020/04/09/10/44/zoom-5020922_1280.jpg' // Zoom placeholder
    if (platform === 'youtube') return 'https://cdn.pixabay.com/photo/2016/11/19/03/08/youtube-1837872_1280.png'
    if (platform === 'google_meet') return 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-96dp/logo_meet_2020q4_color_2x_web_96dp.png'
    return 'https://cdn.quasar.dev/img/material.png'
}

const isExampleLink = (link) => {
    return !link || link === '#' || link.includes('example.com')
}

// Enrollment Logic
const showEnrollDialog = ref(false)
const selectedClassForEnroll = ref(null)
const studentToEnroll = ref(null)
const enrolling = ref(false)

const openEnrollDialog = (cls) => {
    if (!cls.course_id) {
        $q.notify({ type: 'warning', message: 'This class is not linked to a specific Course. You cannot enroll students directly.' })
        return
    }
    selectedClassForEnroll.value = cls
    studentToEnroll.value = null
    showEnrollDialog.value = true
}

const enrollStudentToCourse = async () => {
    if (!studentToEnroll.value || !selectedClassForEnroll.value?.course_id) return
    
    enrolling.value = true
    try {
        const { error } = await supabase.from('enrollments').insert({
            course_id: selectedClassForEnroll.value.course_id,
            user_id: studentToEnroll.value.id
        })
        
        if (error) {
            if (error.code === '23505') {
                 $q.notify({ type: 'warning', message: 'Student already enrolled' })
            } else {
                 throw error
            }
        } else {
            $q.notify({ type: 'positive', message: 'Student added to course!' })
            showEnrollDialog.value = false
        }
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Enrollment failed' })
    } finally {
        enrolling.value = false
    }
}
</script>

<style scoped>
.class-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
}
.class-card:hover {
  transform: translateY(-4px);
}
.bg-dark-card {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.05);
}
</style>
