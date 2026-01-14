<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
      <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
        <div class="text-h6">Upload Homework</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup />
      </q-bar>
      
      <q-card-section class="q-gutter-y-md q-pt-md">
         <!-- Course Selection -->
         <q-select
            filled 
            :dark="$q.dark.isActive"
            v-model="selectedCourse"
            :options="courses"
            option-label="title"
            option-value="id"
            label="Select Course"
            :rules="[val => !!val || 'Required']"
            @update:model-value="fetchClasses"
         >
            <template v-slot:no-option>
                <q-item>
                    <q-item-section class="text-grey">No enrolled courses found.</q-item-section>
                </q-item>
            </template>
         </q-select>

         <!-- Class/Session Selection -->
         <q-select
            filled 
            :dark="$q.dark.isActive"
            v-model="selectedClass"
            :options="classes"
            option-label="label"
            option-value="id"
            label="Select Class/Session"
            :disable="!selectedCourse"
            hint="Pick the class this homework is for"
         >
             <template v-slot:no-option>
                <q-item>
                    <q-item-section class="text-grey">No classes found for this course.</q-item-section>
                </q-item>
             </template>
         </q-select>

         <!-- File Upload -->
         <q-file
            filled 
            :dark="$q.dark.isActive"
            v-model="file"
            label="Attach PDF"
            accept=".pdf, image/*"
            :rules="[val => !!val || 'Required']"
         >
            <template v-slot:prepend>
               <q-icon name="attach_file" />
            </template>
         </q-file>

         <!-- Comment/Note -->
         <q-input 
            filled 
            :dark="$q.dark.isActive"
            v-model="note"
            label="Notes (Optional)"
            type="textarea"
            rows="2" 
         />
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn 
            color="primary" 
            icon="cloud_upload" 
            label="Submit" 
            @click="uploadHomework" 
            :loading="uploading"
            :disable="!file || !selectedCourse" 
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar, date as qDate } from 'quasar'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'uploaded'])
const $q = useQuasar()

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const courses = ref([])
const classes = ref([])
const selectedCourse = ref(null)
const selectedClass = ref(null)
const file = ref(null)
const note = ref('')
const uploading = ref(false)
const currentUserId = ref(null)

onMounted(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        currentUserId.value = user.id
        fetchEnrolledCourses()
    }
})

const fetchEnrolledCourses = async () => {
    // Fetch courses the student is enrolled in
    const { data } = await supabase
        .from('enrollments')
        .select(`
            course:courses (
                id, title
            )
        `)
        .eq('user_id', currentUserId.value)
        
    if (data) {
        courses.value = data.map(e => e.course)
    }
}

const fetchClasses = async () => {
    selectedClass.value = null
    classes.value = []
    
    if (!selectedCourse.value) return
    
    // Fetch classes for this course
    const { data } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('course_id', selectedCourse.value.id)
        .order('start_time', { ascending: false })
        
    if (data) {
        classes.value = data.map(c => {
            const d = new Date(c.start_time)
            return {
                id: c.id,
                label: `${c.title} - ${qDate.formatDate(d, 'MMM D, h:mm A')}`,
                ...c
            }
        })
    }
}

const uploadHomework = async () => {
    if (!file.value || !selectedCourse.value) return
    
    uploading.value = true
    try {
        const fileExt = file.value.name.split('.').pop()
        const fileName = `assignments/${currentUserId.value}/${Date.now()}.${fileExt}`
        
        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, file.value)
            
        if (uploadError) throw uploadError
        
        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName)
            
        // 2. Insert Record
        const { error: dbError } = await supabase.from('homework_submissions').insert([{
            user_id: currentUserId.value,
            course_id: selectedCourse.value.id,
            class_id: selectedClass.value ? selectedClass.value.id : null,
            file_url: publicUrl,
            file_name: file.value.name,
            // We could store note if we added a column, but for now just basic info
        }])
        
        if (dbError) throw dbError
        
        $q.notify({ type: 'positive', message: 'Homework Submitted Successfully!' })
        emit('uploaded')
        show.value = false
        
        // Reset
        file.value = null
        selectedClass.value = null
        selectedCourse.value = null
        note.value = ''
        
    } catch (e) {
        console.error(e)
        $q.notify({ type: 'negative', message: 'Upload Failed' })
    } finally {
        uploading.value = false
    }
}
</script>
