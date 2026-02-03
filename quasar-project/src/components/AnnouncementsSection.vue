<template>
  <div class="q-mb-xl">
    <div class="row items-center justify-between q-mb-lg">
       <h5 class="text-h5 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Announcements</h5>
       <q-btn v-if="canManage" color="primary" icon="add" label="New Announcement" @click="openDialog" />
    </div>

    <!-- Announcements Grid -->
    <div v-if="loading" class="row justify-center q-pa-lg">
        <q-spinner color="primary" size="3em" />
    </div>
    
    <div v-else-if="announcements.length > 0" class="row q-col-gutter-lg">
       <div class="col-12 col-md-6 col-lg-4" v-for="announcement in announcements" :key="announcement.id">
          <q-card class="column full-height" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
             <q-img v-if="announcement.image_url" :src="announcement.image_url" :ratio="16/9" />
             
             <q-card-section>
                <div class="text-h6 border-bottom q-pb-sm q-mb-sm">{{ announcement.title }}</div>
                <div class="text-body2 text-grey-6 q-mb-md" style="white-space: pre-wrap;">{{ announcement.description }}</div>
                
                <div class="column q-gutter-y-sm">
                    <div v-if="announcement.link" class="row items-center">
                        <q-icon name="link" size="sm" color="primary" class="q-mr-sm" />
                        <a :href="announcement.link" target="_blank" class="text-primary" style="text-decoration: none; word-break: break-all;">{{ announcement.link }}</a>
                    </div>
                    
                    <div v-if="announcement.contact_number" class="row items-center">
                        <q-icon name="phone" size="sm" color="secondary" class="q-mr-sm" />
                        <span>{{ announcement.contact_number }}</span>
                    </div>
                </div>
             </q-card-section>
             
             <q-card-actions v-if="canManage" align="right" class="q-mt-auto">
                <q-btn flat round icon="delete" color="negative" @click="deleteAnnouncement(announcement.id)" />
             </q-card-actions>
          </q-card>
       </div>
    </div>
    
    <div v-else class="text-center q-pa-xl text-grey border-dashed rounded-borders">
       No announcements yet.
    </div>

    <!-- ADD DIALOG -->
    <q-dialog v-model="showDialog" persistent>
        <q-card style="width: 90vw; max-width: 600px" :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
            <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
                <div class="text-h6">New Announcement</div>
                <q-space />
                <q-btn dense flat icon="close" v-close-popup />
            </q-bar>

            <q-card-section class="q-gutter-y-md q-pt-md">
                <q-input filled :dark="$q.dark.isActive" v-model="form.title" label="Title" :rules="[val => !!val || 'Required']" />
                
                <q-input filled :dark="$q.dark.isActive" v-model="form.description" label="Description" type="textarea" rows="4" />
                
                <div class="row q-col-gutter-sm">
                     <div class="col-12 col-md-6">
                        <q-input filled :dark="$q.dark.isActive" v-model="form.link" label="External Link (Optional)" hint="https://..." />
                     </div>
                     <div class="col-12 col-md-6">
                        <q-input filled :dark="$q.dark.isActive" v-model="form.contact_number" label="Contact Number (Optional)" />
                     </div>
                </div>

                <!-- IMAGE UPLOAD -->
                <div class="row items-center q-col-gutter-md">
                    <div class="col-grow">
                        <q-file 
                            filled :dark="$q.dark.isActive" 
                            v-model="imageFile" 
                            label="Upload Image (Optional)" 
                            accept="image/*"
                            @update:model-value="handleImageUpload"
                            :loading="uploadingImage"
                        >
                            <template v-slot:prepend>
                                <q-icon name="cloud_upload" />
                            </template>
                        </q-file>
                    </div>
                    <div class="col-auto" v-if="form.image_url">
                        <q-avatar rounded size="60px">
                            <img :src="form.image_url" style="object-fit: cover">
                        </q-avatar>
                    </div>
                </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pb-md q-pr-md">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn color="primary" label="Post Announcement" @click="saveAnnouncement" :loading="processing || uploadingImage" />
            </q-card-actions>
        </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const announcements = ref([])
const showDialog = ref(false)
const processing = ref(false)
const form = ref({ title: '', description: '', image_url: '', link: '', contact_number: '' })
const imageFile = ref(null)
const uploadingImage = ref(false)
const userRole = ref(null)

const canManage = computed(() => {
    return ['admin', 'teacher', 'staff'].includes(userRole.value)
})

onMounted(async () => {
    await fetchUserRole()
    fetchAnnouncements()
})

const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        userRole.value = data?.role
    }
}

const fetchAnnouncements = async () => {
    loading.value = true
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (error) console.error(error)
    else announcements.value = data || []
    loading.value = false
}

const openDialog = () => {
    form.value = { title: '', description: '', image_url: '', link: '', contact_number: '' }
    imageFile.value = null
    showDialog.value = true
}

const handleImageUpload = async (file) => {
    if (!file) return
    uploadingImage.value = true
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `announcements/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(fileName, file)
            
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('uploads').getPublicUrl(fileName)
        form.value.image_url = data.publicUrl
        $q.notify({ type: 'positive', message: 'Image Uploaded!' })
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Upload failed' })
    } finally {
        uploadingImage.value = false
    }
}

const saveAnnouncement = async () => {
    if (!form.value.title) return
    processing.value = true
    try {
        const { error } = await supabase.from('announcements').insert([{
            ...form.value
        }])
        
        if (error) throw error
        
        $q.notify({ type: 'positive', message: 'Announcement Posted!' })
        showDialog.value = false
        fetchAnnouncements()
    } catch (err) {
        console.error(err)
        $q.notify({ type: 'negative', message: 'Failed to post announcement' })
    } finally {
        processing.value = false
    }
}

const deleteAnnouncement = async (id) => {
    if(!confirm('Delete this announcement?')) return
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (!error) {
        $q.notify({ type: 'positive', message: 'Deleted' })
        fetchAnnouncements()
    }
}
</script>

<style scoped>
.bg-dark-card { background: #121212; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; }
.border-bottom { border-bottom: 1px solid rgba(255,255,255,0.1); }
.border-dashed { border: 2px dashed #ccc; border-radius: 8px; }
</style>
