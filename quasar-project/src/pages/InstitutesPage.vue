<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-h4 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Institutes</h4>
      <q-btn color="primary" icon="add" label="Add Institute" @click="openDialog" />
    </div>

    <q-table
      :rows="institutes"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :dark="$q.dark.isActive"
      :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'"
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
            <div class="row items-center">
                <q-avatar rounded size="40px" class="q-mr-md" v-if="props.row.logo_url">
                    <img :src="props.row.logo_url">
                </q-avatar>
                <q-avatar rounded size="40px" color="primary" text-color="white" icon="school" class="q-mr-md" v-else />
                <div>{{ props.row.name }}</div>
            </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn 
            v-if="props.row.location_url"
            flat round dense 
            color="accent" 
            icon="map" 
            type="a" 
            :href="props.row.location_url" 
            target="_blank"
            class="q-mr-sm"
          >
            <q-tooltip>View Map</q-tooltip>
          </q-btn>
          <q-btn flat round dense color="primary" icon="edit" @click="editInstitute(props.row)" />
          <q-btn flat round dense color="negative" icon="delete" @click="deleteInstitute(props.row.id)" />
        </q-td>
      </template>
      
      <template v-slot:no-data>
        <div class="full-width row flex-center q-pa-md text-grey">
          No institutes found. Click "Add Institute" to create one.
        </div>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark'">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Institute' : 'New Institute' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveInstitute" class="q-gutter-md">
            <!-- Basic Info -->
             <div class="row q-col-gutter-sm">
                <div class="col-12">
                     <q-input filled :dark="$q.dark.isActive" v-model="form.name" label="Institute Name" :rules="[val => !!val || 'Name is required']" />
                </div>
                <div class="col-12 col-md-6">
                    <q-input filled :dark="$q.dark.isActive" v-model="form.contact" label="Contact Number" />
                </div>
                <div class="col-12 col-md-6">
                     <q-input filled :dark="$q.dark.isActive" v-model="form.location_url" label="Google Maps Link" prepend-icon="place" />
                </div>
                <div class="col-12">
                    <q-input filled :dark="$q.dark.isActive" v-model="form.address" label="Address" type="textarea" rows="2" />
                </div>
             </div>

             <!-- Image Uploads -->
             <div class="text-subtitle2 q-mt-md">Images</div>
             
             <!-- LOGO -->
             <div class="row items-center q-col-gutter-sm">
                 <div class="col">
                     <q-file filled :dark="$q.dark.isActive" v-model="files.logo" label="Upload Logo" accept="image/*" @update:model-value="(f) => handleUpload(f, 'logo_url')">
                         <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                     </q-file>
                 </div>
                 <div class="col-auto" v-if="form.logo_url">
                     <q-avatar rounded size="50px"><img :src="form.logo_url"></q-avatar>
                 </div>
             </div>

             <!-- IMAGE 1 -->
             <div class="row items-center q-col-gutter-sm">
                 <div class="col">
                     <q-file filled :dark="$q.dark.isActive" v-model="files.image1" label="Institute Image 1" accept="image/*" @update:model-value="(f) => handleUpload(f, 'image1_url')">
                         <template v-slot:prepend><q-icon name="image" /></template>
                     </q-file>
                 </div>
                 <div class="col-auto" v-if="form.image1_url">
                     <q-avatar rounded size="50px"><img :src="form.image1_url"></q-avatar>
                 </div>
             </div>

             <!-- IMAGE 2 -->
             <div class="row items-center q-col-gutter-sm">
                 <div class="col">
                     <q-file filled :dark="$q.dark.isActive" v-model="files.image2" label="Institute Image 2" accept="image/*" @update:model-value="(f) => handleUpload(f, 'image2_url')">
                         <template v-slot:prepend><q-icon name="image" /></template>
                     </q-file>
                 </div>
                 <div class="col-auto" v-if="form.image2_url">
                     <q-avatar rounded size="50px"><img :src="form.image2_url"></q-avatar>
                 </div>
             </div>
            
             <div class="row justify-end q-mt-lg">
                <q-btn flat label="Cancel" color="primary" v-close-popup class="q-mr-sm" />
                <q-btn type="submit" :label="isEditing ? 'Update' : 'Create'" color="primary" :loading="saving || uploading" />
             </div>
          </q-form>
        </q-card-section>
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
const institutes = ref([])
const showDialog = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const uploading = ref(false)

const form = ref({
  id: null,
  name: '',
  address: '',
  contact: '',
  location_url: '',
  logo_url: '',
  image1_url: '',
  image2_url: ''
})

const files = ref({
    logo: null,
    image1: null,
    image2: null
})

const columns = [
  { name: 'name', required: true, label: 'Institute Name', align: 'left', field: 'name', sortable: true },
  { name: 'address', align: 'left', label: 'Address', field: 'address', sortable: true },
  { name: 'contact', align: 'left', label: 'Contact', field: 'contact', sortable: true },
  { name: 'actions', label: 'Actions', align: 'right' }
]

onMounted(() => {
  fetchInstitutes()
})

const fetchInstitutes = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('institutes')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching institutes:', error)
  } else {
    institutes.value = data || []
  }
  loading.value = false
}

const handleUpload = async (file, targetField) => {
    if (!file) return
    uploading.value = true
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `institutes/${Date.now()}_${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, file)
            
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)
        form.value[targetField] = data.publicUrl
        $q.notify({ type: 'positive', message: 'Image Uploaded!' })
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Upload failed' })
    } finally {
        uploading.value = false
    }
}

const openDialog = () => {
  isEditing.value = false
  form.value = { id: null, name: '', address: '', contact: '', location_url: '', logo_url: '', image1_url: '', image2_url: '' }
  files.value = { logo: null, image1: null, image2: null }
  showDialog.value = true
}

const editInstitute = (row) => {
  isEditing.value = true
  form.value = { ...row }
  files.value = { logo: null, image1: null, image2: null }
  showDialog.value = true
}

const saveInstitute = async () => {
  saving.value = true
  try {
    const payload = { ...form.value }
    delete payload.id // Don't update ID
    
    let error = null
    
    if (isEditing.value) {
        const { error: updateError } = await supabase
            .from('institutes')
            .update(payload)
            .eq('id', form.value.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('institutes')
            .insert([payload])
        error = insertError
    }

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: isEditing.value ? 'Institute updated' : 'Institute created'
    })
    showDialog.value = false
    fetchInstitutes()
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Failed to save institute.'
    })
  } finally {
    saving.value = false
  }
}

const deleteInstitute = async (id) => {
  if (!confirm('Are you sure you want to delete this institute?')) return

  try {
    const { error } = await supabase
      .from('institutes')
      .delete()
      .eq('id', id)
      
    if (error) throw error

    $q.notify({ type: 'positive', message: 'Institute deleted' })
    fetchInstitutes()
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Failed to delete institute' })
  }
}
</script>

<style scoped>
.bg-dark-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
}
</style>
