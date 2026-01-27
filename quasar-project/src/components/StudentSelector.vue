<template>
  <div class="student-selector">
    <!-- Filters -->
    <div class="row q-col-gutter-sm q-mb-sm">
       <div class="col-12 col-md-4">
          <q-select
             v-model="filters.year"
             :options="['1','2','3','4','5','6','7','8','9','10','11','12','13']"
             label="Grade/Year"
             dense filled
             clearable
             :dark="dark"
          />
       </div>
       <div class="col-12 col-md-4">
          <q-select
             v-model="filters.stream"
             :options="['Maths','Bio','Commerce','Arts','Tech','Other']"
             label="Stream"
             dense filled
             clearable
             :dark="dark"
          />
       </div>
       <div class="col-12 col-md-4">
          <q-select
             v-model="filters.instructor"
             :options="instructorOptions"
             label="Instructor"
             dense filled
             clearable
             emit-value
             map-options
             option-label="full_name"
             option-value="id"
             :dark="dark"
             hint="Students enrolled in their courses"
          />
       </div>
    </div>

    <!-- Search & Results -->
    <q-select
       v-model="model"
       use-input
       input-debounce="300"
       :label="label"
       :options="studentOptions"
       @filter="filterStudents"
       @update:model-value="onSelect"
       option-label="full_name"
       option-value="id"
       filled
       :dark="dark"
       behavior="menu"
    >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
               <q-avatar size="sm">
                 <img :src="scope.opt.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'">
               </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.full_name }}</q-item-label>
              <q-item-label caption>
                  {{ scope.opt.grade ? `Grade ${scope.opt.grade}` : '' }} 
                  {{ scope.opt.stream ? `• ${scope.opt.stream}` : '' }}
                  <br>{{ scope.opt.email }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No students found matching criteria
            </q-item-section>
          </q-item>
        </template>
    </q-select>
    
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { supabase } from 'boot/supabase'

defineProps({
    modelValue: Object, // Single selection for now? Or leave generic
    label: { type: String, default: 'Search Student' },
    dark: Boolean
})

const emit = defineEmits(['update:modelValue', 'selected'])

const model = ref(null)
const studentOptions = ref([])
const instructorOptions = ref([])

const filters = ref({
    year: null,
    stream: null,
    instructor: null
})

onMounted(async () => {
    fetchInstructors()
})

const fetchInstructors = async () => {
    const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['admin', 'teacher'])
    instructorOptions.value = data || []
}

// Watch filters to trigger re-fetch/clear
watch(filters, () => {
    model.value = null // Clear selection on filter change? Maybe not.
}, { deep: true })

const filterStudents = async (val, update) => {
    update(async () => {
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'student') 
        
        // Search Text
        if (val) {
            query = query.ilike('full_name', `%${val}%`)
        }
        
        // Apply Filters
        if (filters.value.year) {
            query = query.eq('grade', filters.value.year)
        }
        if (filters.value.stream) {
             query = query.eq('stream', filters.value.stream)
        }
        
        // Instructor Filter (Hard Part)
        if (filters.value.instructor) {
            // 1. Get courses by instructor
            const { data: courses } = await supabase
                .from('courses')
                .select('id')
                .eq('teacher_id', filters.value.instructor)
            
            const courseIds = (courses || []).map(c => c.id)
            
            if (courseIds.length > 0) {
                 // 2. Get students enrolled in these courses
                 const { data: enrollments } = await supabase
                    .from('enrollments')
                    .select('user_id')
                    .in('course_id', courseIds)
                 
                 const studentIds = (enrollments || []).map(e => e.user_id)
                 // Use .in() with unique IDs
                 const uniqueIds = [...new Set(studentIds)]
                 if (uniqueIds.length > 0) {
                     query = query.in('id', uniqueIds)
                 } else {
                     // No students match
                     studentOptions.value = []
                     return
                 }
            } else {
                // Instructor has no courses, so no students
                 studentOptions.value = []
                 return
            }
        }

        query = query.limit(20)
        
        const { data, error } = await query
        if (error) {
            console.error(error)
            return
        }
        
        studentOptions.value = data || []
    })
}

const onSelect = (val) => {
    emit('update:modelValue', val)
    emit('selected', val)
}
</script>

<style scoped>
</style>
