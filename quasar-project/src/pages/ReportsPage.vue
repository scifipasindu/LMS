<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
        <q-icon name="bar_chart" size="2em" color="primary" class="q-mr-md" />
        <div class="text-h4 text-weight-bold">Reports</div>
    </div>

    <q-card flat bordered class="bg-dark-card">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="enrollments" label="Enrollments (Attendance)" />
          <q-tab name="payments" label="Payments History" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated class="bg-transparent">
          <!-- ENROLLMENTS TAB -->
          <q-tab-panel name="enrollments">
             <div class="row q-mb-md items-center">
                 <div class="col-12 col-md-4">
                     <q-select
                        filled
                        dense
                        v-model="selectedCourse"
                        :options="courseOptions"
                        label="Filter by Course"
                        emit-value
                        map-options
                        clearable
                        @update:model-value="fetchEnrollments"
                        :dark="$q.dark.isActive"
                     />
                 </div>
                 <div class="col-12 col-md-8 text-right">
                     <q-btn icon="add" label="Enroll Student" color="accent" class="q-mr-sm" @click="openEnrollDialog" />
                     <q-btn icon="refresh" flat round color="primary" @click="fetchEnrollments" />
                 </div>
             </div>

             <q-table
                :rows="enrollments"
                :columns="enrollmentColumns"
                row-key="id"
                :loading="loadingEnrollments"
                flat
                bordered
                :dark="$q.dark.isActive"
                class="bg-transparent"
             >
                <template v-slot:body-cell-student="props">
                    <q-td :props="props">
                        <div class="row items-center">
                            <q-avatar size="sm" class="q-mr-sm">
                                <img :src="props.row.profiles?.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'">
                            </q-avatar>
                            <div>
                                <div class="text-weight-bold">{{ props.row.profiles?.full_name || 'Unknown' }}</div>
                                <div class="text-caption text-grey">{{ props.row.profiles?.email }}</div>
                            </div>
                        </div>
                    </q-td>
                </template>
                <template v-slot:body-cell-course="props">
                    <q-td :props="props">
                        {{ props.row.courses?.title || 'Deleted Course' }}
                    </q-td>
                </template>
             </q-table>
          </q-tab-panel>

          <!-- PAYMENTS TAB -->
          <q-tab-panel name="payments">
             <div class="row q-mb-md justify-end">
                 <q-btn icon="refresh" flat round color="primary" @click="fetchPayments" />
             </div>

             <q-table
                :rows="payments"
                :columns="paymentColumns"
                row-key="id"
                :loading="loadingPayments"
                flat
                bordered
                :dark="$q.dark.isActive"
                 class="bg-transparent"
             >
                <template v-slot:body-cell-student="props">
                    <q-td :props="props">
                        <div class="row items-center">
                             <q-avatar size="sm" class="q-mr-sm">
                                <img :src="props.row.profiles?.avatar_url || 'https://cdn.quasar.dev/img/boy-avatar.png'">
                            </q-avatar>
                            {{ props.row.profiles?.full_name || 'Unknown' }}
                        </div>
                    </q-td>
                </template>
                <template v-slot:body-cell-status="props">
                    <q-td :props="props">
                        <q-chip 
                            :color="props.row.status === 'completed' ? 'positive' : (props.row.status === 'pending' ? 'warning' : 'negative')" 
                            text-color="white" 
                            dense
                        >
                            {{ props.row.status }}
                        </q-chip>
                    </q-td>
                </template>
                <template v-slot:body-cell-receipt="props">
                    <q-td :props="props">
                        <q-btn 
                            v-if="props.row.receipt_url" 
                            flat 
                            round 
                            icon="receipt" 
                            color="info" 
                            type="a" 
                            :href="props.row.receipt_url" 
                            target="_blank"
                        >
                            <q-tooltip>View Receipt</q-tooltip>
                        </q-btn>
                        <span v-else class="text-grey-7">-</span>
                    </q-td>
                </template>
             </q-table>
          </q-tab-panel>
        </q-tab-panels>
    </q-card>

    <!-- ENROLL STUDENT DIALOG -->
    <q-dialog v-model="enrollDialog">
        <q-card style="min-width: 400px" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white'">
            <q-card-section>
                <div class="text-h6">Enroll Student</div>
            </q-card-section>
            <q-card-section class="q-gutter-y-md">
                <q-select
                    filled
                    v-model="enrollForm.student"
                    use-input
                    input-debounce="300"
                    label="Search Student (Name/Email)"
                    :options="studentOptions"
                    @filter="filterStudents"
                    :dark="$q.dark.isActive"
                    option-label="label"
                    option-value="id"
                >
                    <template v-slot:no-option>
                        <q-item>
                            <q-item-section class="text-grey">
                                No results
                            </q-item-section>
                        </q-item>
                    </template>
                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                            <q-item-section avatar>
                                <q-avatar size="sm">
                                    <img :src="scope.opt.avatar || 'https://cdn.quasar.dev/img/boy-avatar.png'">
                                </q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ scope.opt.label }}</q-item-label>
                                <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select>

                <q-select
                    filled
                    v-model="enrollForm.course"
                    :options="courseOptions"
                    label="Select Course"
                    emit-value
                    map-options
                    :dark="$q.dark.isActive"
                />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup />
                <q-btn flat label="Enroll" color="positive" @click="enrollStudent" :loading="enrolling" />
            </q-card-actions>
        </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()
const tab = ref('enrollments')

const enrollDialog = ref(false)
const enrolling = ref(false)
const studentOptions = ref([])
const currencySymbol = ref('Rs.') // Default
const enrollForm = ref({
    student: null,
    course: null
})

// Enrollments Data
const enrollments = ref([])
const loadingEnrollments = ref(false)
const selectedCourse = ref(null)
const courseOptions = ref([])

const enrollmentColumns = [
    { name: 'student', label: 'Student', align: 'left', field: r => r.profiles?.full_name, sortable: true },
    { name: 'course', label: 'Course', align: 'left', field: r => r.courses?.title, sortable: true },
    { name: 'enrolled_at', label: 'Enrolled Date', align: 'left', field: 'enrolled_at', format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm'), sortable: true },
]

// Payments Data
const payments = ref([])
const loadingPayments = ref(false)

const paymentColumns = [
    { name: 'student', label: 'Student', align: 'left', field: r => r.profiles?.full_name, sortable: true },
    { name: 'course', label: 'Course', align: 'left', field: r => r.courses?.title, sortable: true },
    { name: 'amount', label: 'Amount', align: 'right', field: 'amount', format: val => `${currencySymbol.value} ${val}`, sortable: true },
    { name: 'date', label: 'Date', align: 'left', field: 'payment_date', format: val => date.formatDate(val, 'YYYY-MM-DD HH:mm'), sortable: true },
    { name: 'method', label: 'Method', align: 'center', field: 'method', sortable: true },
    { name: 'status', label: 'Status', align: 'center', field: 'status', sortable: true },
    { name: 'receipt', label: 'Receipt', align: 'center', field: 'receipt_url' },
]

onMounted(async () => {
    fetchCourses()
    fetchEnrollments()
    fetchPayments()
    fetchSettings()
})

const fetchSettings = async () => {
   const { data } = await supabase
     .from('system_settings')
     .select('value')
     .eq('key', 'config')
     .single()
   
   if (data?.value?.general?.currency?.symbol) {
       currencySymbol.value = data.value.general.currency.symbol
   }
}

const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('id, title')
    if (data) {
        courseOptions.value = data.map(c => ({ label: c.title, value: c.id }))
    }
}

const fetchEnrollments = async () => {
    loadingEnrollments.value = true
    try {
        let query = supabase
            .from('enrollments')
            .select(`
                id,
                enrolled_at,
                profiles (id, full_name, email, avatar_url),
                courses (id, title)
            `)
            .order('enrolled_at', { ascending: false })
        
        if (selectedCourse.value) {
            query = query.eq('course_id', selectedCourse.value)
        }

        const { data, error } = await query
        if (error) throw error
        enrollments.value = data
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to fetch enrollments' })
    } finally {
        loadingEnrollments.value = false
    }
}

const fetchPayments = async () => {
    loadingPayments.value = true
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                status,
                payment_date,
                method,
                receipt_url,
                profiles (id, full_name, avatar_url),
                courses (id, title)
            `)
            .order('payment_date', { ascending: false })
            
        if (error) throw error
        payments.value = data
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to fetch payments' })
    } finally {
        loadingPayments.value = false
    }
}

// Manual Enrollment Logic
const openEnrollDialog = () => {
    enrollForm.value = { student: null, course: null }
    enrollDialog.value = true
}

const filterStudents = async (val, update) => {
    if (val === '') {
        update(() => { studentOptions.value = [] })
        return
    }

    update(async () => {
        const needle = val.toLowerCase()
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .or(`full_name.ilike.%${needle}%,email.ilike.%${needle}%`)
            .limit(5)
        
        if (data) {
            studentOptions.value = data.map(u => ({
                label: u.full_name,
                email: u.email,
                avatar: u.avatar_url,
                id: u.id,
                value: u // keep full object if needed, but we use option-value="id" basically
            }))
        }
    })
}

const enrollStudent = async () => {
    if (!enrollForm.value.student || !enrollForm.value.course) {
        $q.notify({ type: 'warning', message: 'Please select both student and course' })
        return
    }

    enrolling.value = true
    try {
        // Access form values correctly. q-select with objects might return the object or value depending on emit-value
        // student select does NOT have emit-value, so it returns the object (scope.opt)
        const studentId = enrollForm.value.student.id
        const courseId = enrollForm.value.course // this has emit-value, so it returns ID directly

        const { error } = await supabase.from('enrollments').insert({
            user_id: studentId,
            course_id: courseId
        })

        if (error) throw error

        $q.notify({ type: 'positive', message: 'Student enrolled successfully!' })
        enrollDialog.value = false
        fetchEnrollments() // refresh list
    } catch (err) {
        if (err.code === '23505') { // Unique violation
             $q.notify({ type: 'warning', message: 'Student is already enrolled in this course' })
        } else {
             console.error(err)
             $q.notify({ type: 'negative', message: 'Failed to enroll student' })
        }
    } finally {
        enrolling.value = false
    }
}
</script>

<style scoped>
.bg-dark-card {
    background: #121212;
    border: 1px solid rgba(255,255,255,0.05);
}
body.body--light .bg-dark-card {
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.1);
}
</style>
