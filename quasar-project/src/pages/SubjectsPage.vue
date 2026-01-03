<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-h4 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Subjects</h4>
      <q-btn color="primary" icon="add" label="Add Subject" @click="openDialog" />
    </div>

    <!-- Data Table -->
    <q-table
      :rows="subjects"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :dark="$q.dark.isActive"
      :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense color="primary" icon="edit" @click="editSubject(props.row)" />
          <q-btn flat round dense color="negative" icon="delete" @click="deleteSubject(props.row.id)" />
        </q-td>
      </template>
      
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey">
          No subjects found. Click "Add Subject" to create one.
        </div>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark'">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Subject' : 'New Subject' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveSubject" class="q-gutter-md">
            <q-input
              filled
              :dark="$q.dark.isActive"
              v-model="form.name"
              label="Subject Name"
              :rules="[val => !!val || 'Name is required']"
            />
            <q-input
              filled
              :dark="$q.dark.isActive"
              v-model="form.description"
              label="Description (Optional)"
              type="textarea"
              rows="3"
            />
            
             <div class="row justify-end q-mt-lg">
                <q-btn flat label="Cancel" color="primary" v-close-popup class="q-mr-sm" />
                <q-btn type="submit" :label="isEditing ? 'Update' : 'Create'" color="primary" :loading="saving" />
             </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase' // client
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const subjects = ref([])
const showDialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const form = ref({
  id: null,
  name: '',
  description: ''
})

const columns = [
  { name: 'name', required: true, label: 'Subject Name', align: 'left', field: 'name', sortable: true },
  { name: 'description', align: 'left', label: 'Description', field: 'description', sortable: true },
  { name: 'actions', label: 'Actions', align: 'right' }
]

onMounted(() => {
  fetchSubjects()
})

const fetchSubjects = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching subjects:', error)
  } else {
    subjects.value = data || []
  }
  loading.value = false
}

const openDialog = () => {
  isEditing.value = false
  form.value = { id: null, name: '', description: '' }
  showDialog.value = true
}

const editSubject = (row) => {
  isEditing.value = true
  form.value = { ...row }
  showDialog.value = true
}

const saveSubject = async () => {
  saving.value = true
  try {
    const payload = {
        name: form.value.name,
        description: form.value.description
    }
    
    let error = null
    
    if (isEditing.value) {
        const { error: updateError } = await supabase
            .from('subjects')
            .update(payload)
            .eq('id', form.value.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('subjects')
            .insert([payload])
        error = insertError
    }

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: isEditing.value ? 'Subject updated' : 'Subject created'
    })
    showDialog.value = false
    fetchSubjects()
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Failed to save. Ensure `subjects` table has `name` and `description` columns.'
    })
  } finally {
    saving.value = false
  }
}

const deleteSubject = async (id) => {
  if (!confirm('Are you sure you want to delete this subject?')) return

  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
      
    if (error) throw error

    $q.notify({ type: 'positive', message: 'Subject deleted' })
    fetchSubjects()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Failed to delete subject' })
  }
}
</script>

<style scoped>
.bg-dark-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
}
</style>
