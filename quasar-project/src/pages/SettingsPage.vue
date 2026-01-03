<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <h4 class="text-h4 text-white text-weight-bold q-my-none">System Settings</h4>
      <q-btn 
        color="primary" 
        icon="save" 
        label="Save Changes" 
        :loading="saving" 
        @click="saveSettings" 
        unelevated 
        rounded 
      />
    </div>

    <div v-if="loading" class="flex flex-center" style="height: 400px">
      <q-spinner color="primary" size="3em" />
    </div>

    <q-card v-else class="bg-dark-card text-white">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="general" label="General" icon="tune" />
        <q-tab name="home" label="Home" icon="home" />
        <q-tab name="bank" label="Bank Details" icon="account_balance" />
        <q-tab name="telegram" label="Telegram" icon="telegram" />
        <q-tab name="whatsapp" label="WhatsApp" icon="chat" />
        <q-tab name="navbar" label="NavBar" icon="menu" />
        <q-tab name="footer" label="Footer" icon="info" />
      </q-tabs>

      <q-separator :dark="$q.dark.isActive" />

      <q-tab-panels v-model="tab" animated class="bg-transparent">
        
        <!-- GENERAL SETTINGS -->
        <q-tab-panel name="general">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <h6 class="text-h6 q-my-sm">Site Identity</h6>
              <q-input 
                :dark="$q.dark.isActive" filled v-model="settings.general.siteTitle" 
                label="Site Title" 
                class="q-mb-md" 
              />
              
              <div class="q-mb-md">
                <div class="text-caption text-grey-5 q-mb-xs">Site Logo Url</div>
                <div class="row q-col-gutter-sm">
                   <div class="col-grow">
                      <q-input dark filled v-model="settings.general.logoUrl" label="Logo URL" placeholder="https://..." />
                   </div>
                   <div class="col-auto" v-if="settings.general.logoUrl">
                      <q-btn icon="delete" color="negative" flat round dense @click="settings.general.logoUrl = ''">
                        <q-tooltip>Remove Image</q-tooltip>
                      </q-btn>
                   </div>
                   <div class="col-auto">
                      <q-file dark filled v-model="settings.general.logoFile" @update:model-value="(file) => handleUpload(file, (url) => settings.general.logoUrl = url)" accept="image/*" label="Upload" style="width: 120px">
                        <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                      </q-file>
                   </div>
                </div>
                <div class="q-mt-sm q-pa-sm bg-dark-page rounded-borders row flex-center" style="border: 1px dashed rgba(255,255,255,0.2); min-height: 80px;">
                   <q-img v-if="settings.general.logoUrl" :src="settings.general.logoUrl" style="max-height: 60px; max-width: 150px" fit="contain" />
                   <div v-else class="text-grey-7 text-caption">No Dark Logo Set</div>
                </div>
              </div>

              <div class="q-mb-md">
                <div class="text-caption text-grey-5 q-mb-xs">Light Mode Logo</div>
                <div class="row q-col-gutter-sm">
                   <div class="col-grow">
                      <q-input dark filled v-model="settings.general.logoUrlLight" label="Logo URL" placeholder="https://..." />
                   </div>
                   <div class="col-auto" v-if="settings.general.logoUrlLight">
                      <q-btn icon="delete" color="negative" flat round dense @click="settings.general.logoUrlLight = ''">
                        <q-tooltip>Remove Image</q-tooltip>
                      </q-btn>
                   </div>
                   <div class="col-auto">
                      <q-file dark filled v-model="settings.general.logoFileLight" @update:model-value="(file) => handleUpload(file, (url) => settings.general.logoUrlLight = url)" accept="image/*" label="Upload" style="width: 120px">
                        <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                      </q-file>
                   </div>
                </div>
                <div class="q-mt-sm q-pa-sm bg-white rounded-borders row flex-center" style="border: 1px dashed rgba(0,0,0,0.2); min-height: 80px;">
                   <q-img v-if="settings.general.logoUrlLight" :src="settings.general.logoUrlLight" style="max-height: 60px; max-width: 150px" fit="contain" />
                   <div v-else class="text-grey-7 text-caption">No Light Logo Set</div>
                </div>
              </div>
              
              <div class="q-mb-md">
                <div class="text-caption text-grey-5 q-mb-xs">Logo Size (px)</div>
                <q-slider v-model="settings.general.logoSize" :min="20" :max="200" label dark color="accent" />
              </div>
              
              <div class="q-mb-md">
                <div class="text-caption text-grey-5 q-mb-xs">Favicon URL</div>
                <div class="row q-col-gutter-sm">
                   <div class="col-grow">
                     <q-input dark filled v-model="settings.general.faviconUrl" label="Favicon URL" />
                   </div>
                   <div class="col-auto">
                     <q-file dark filled v-model="settings.general.faviconFile" @update:model-value="(file) => handleUpload(file, (url) => settings.general.faviconUrl = url)" accept="image/*" label="Upload" style="width: 120px">
                        <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                     </q-file>
                   </div>
                </div>
                <div class="q-mt-sm q-pa-sm bg-dark-page rounded-borders row flex-center" style="border: 1px dashed rgba(255,255,255,0.2); min-height: 60px;">
                   <q-img v-if="settings.general.faviconUrl" :src="settings.general.faviconUrl" width="32px" height="32px" fit="contain" />
                   <div v-else class="text-grey-7 text-caption">No Favicon Set</div>
                </div>
              </div>
            </div>
            
            <div class="col-12 col-md-6">
              <h6 class="text-h6 q-my-sm">Display Options</h6>
              <div class="q-mb-md">
                <div class="text-caption text-grey-5 q-mb-xs">Brand Mode</div>
                <q-btn-toggle
                  v-model="settings.general.brandMode"
                  spread
                  dark
                  no-caps
                  toggle-color="primary"
                  color="grey-9"
                  text-color="white"
                  :options="[
                    {label: 'Logo Only', value: 'logo'},
                    {label: 'Title Only', value: 'title'},
                    {label: 'Both', value: 'both'}
                  ]"
                />
              </div>

              <h6 class="text-h6 q-my-sm q-mt-xl">Maintenance Mode</h6>
               <q-toggle
                  v-model="settings.general.maintenanceMode"
                  label="Enable Maintenance Mode"
                  left-label
                  dark
                  color="negative"
                  class="q-mb-md"
                />
                
                <q-input 
                  dark filled v-model="settings.general.maintenanceTitle" 
                  label="Maintenance Title" 
                  class="q-mb-md"
                  :disable="!settings.general.maintenanceMode"
                />
                
                <q-input 
                  dark filled v-model="settings.general.maintenanceDescription" 
                  label="Maintenance Description" 
                  type="textarea"
                  rows="3"
                  :disable="!settings.general.maintenanceMode"
                />
            </div>
          </div>
        </q-tab-panel>

        <!-- HOME SETTINGS -->
        <q-tab-panel name="home">
          <div class="text-h6 q-mb-md">Hero Slider</div>
           <div class="row q-col-gutter-md q-mb-xl">
            <div class="col-12 col-md-6">
               <div class="row q-col-gutter-sm q-mb-sm">
                  <div class="col-grow">
                     <q-input dark filled v-model="settings.home.slider.image" label="Slider Image URL" />
                  </div>
                  <div class="col-auto" v-if="settings.home.slider.image">
                      <q-btn icon="delete" color="negative" flat round dense @click="settings.home.slider.image = ''">
                        <q-tooltip>Remove Image</q-tooltip>
                      </q-btn>
                   </div>
                  <div class="col-auto">
                     <q-file dark filled v-model="settings.home.slider.sliderFile" @update:model-value="(file) => handleUpload(file, (url) => settings.home.slider.image = url)" accept="image/*" label="Upload" style="width: 120px">
                       <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                     </q-file>
                  </div>
               </div>
               <div v-if="settings.home.slider.image" class="q-mb-sm">
                  <q-img :src="settings.home.slider.image" style="height: 120px; border-radius: 8px;" fit="cover" />
               </div>
               <q-input dark filled v-model="settings.home.slider.subtitle" label="Subtitle" class="q-mb-sm" />
               <q-input dark filled v-model="settings.home.slider.title" label="Title" class="q-mb-sm" />
            </div>
            <div class="col-12 col-md-6">
               <q-input dark filled v-model="settings.home.slider.subText" label="Sub Text" type="textarea" rows="4" class="q-mb-sm" />
               <div class="row q-col-gutter-sm">
                  <div class="col-6"><q-input dark filled v-model="settings.home.slider.btnText" label="Button Text" /></div>
                  <div class="col-6"><q-input dark filled v-model="settings.home.slider.btnUrl" label="Button URL" /></div>
               </div>
            </div>
          </div>
          
          <q-separator dark class="q-mb-lg" />
          
          <div class="text-h6 q-mb-md">Guides</div>
          <div class="row q-col-gutter-md q-mb-lg">
             <div v-for="i in 4" :key="i" class="col-12 col-md-6">
                <q-card class="bg-dark-page q-pa-sm">
                   <div class="text-subtitle2 text-accent q-mb-sm">Guide {{ i }}</div>
                   <q-input dark denes filled v-model="settings.home.guides[i-1].title" label="Guide Title" class="q-mb-xs" />
                   <q-input dark dense filled v-model="settings.home.guides[i-1].subText" label="Sub Text" class="q-mb-xs" />
                   <q-input dark dense filled v-model="settings.home.guides[i-1].link" label="Link URL" />
                </q-card>
             </div>
          </div>

          <q-separator dark class="q-mb-lg" />

          <div class="row q-col-gutter-lg">
             <div class="col-12 col-md-6">
                <div class="text-h6 q-mb-md">About Us</div>
                <q-input dark filled v-model="settings.home.about.title" label="Title" class="q-mb-sm" />
                <div class="row q-col-gutter-sm q-mb-sm">
                   <div class="col-grow">
                      <q-input dark filled v-model="settings.home.about.image" label="Image URL" />
                   </div>
                   <div class="col-auto" v-if="settings.home.about.image">
                      <q-btn icon="delete" color="negative" flat round dense @click="settings.home.about.image = ''">
                        <q-tooltip>Remove Image</q-tooltip>
                      </q-btn>
                   </div>
                   <div class="col-auto">
                      <q-file dark filled v-model="settings.home.about.aboutFile" @update:model-value="(file) => handleUpload(file, (url) => settings.home.about.image = url)" accept="image/*" label="Upload" style="width: 120px">
                        <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                      </q-file>
                   </div>
                </div>
                <div v-if="settings.home.about.image" class="q-mb-sm">
                   <q-img :src="settings.home.about.image" style="height: 120px; border-radius: 8px;" fit="cover" />
                </div>
                <q-editor dark v-model="settings.home.about.description" min-height="150px" class="bg-dark-page border-grey q-mb-sm" />
                
                <div class="row q-col-gutter-sm">
                   <div class="col-6"><q-input dark filled v-model="settings.home.about.btnText" label="Button Text" /></div>
                   <div class="col-6"><q-input dark filled v-model="settings.home.about.btnUrl" label="Button URL" /></div>
                </div>
             </div>
             
             <div class="col-12 col-md-6">
                 <div class="text-h6 q-mb-md">Contact Us</div>
                 <q-input dark filled v-model="settings.home.contact.phone1" label="Normal Call 1" class="q-mb-sm">
                   <template v-slot:prepend><q-icon name="phone" /></template>
                 </q-input>
                 <q-input dark filled v-model="settings.home.contact.phone2" label="Normal Call 2" class="q-mb-sm">
                   <template v-slot:prepend><q-icon name="phone" /></template>
                 </q-input>
                 <q-input dark filled v-model="settings.home.contact.whatsapp" label="WhatsApp" class="q-mb-sm">
                   <template v-slot:prepend><q-icon name="chat" /></template>
                 </q-input>
                 <q-input dark filled v-model="settings.home.contact.telegram" label="Telegram" class="q-mb-sm">
                   <template v-slot:prepend><q-icon name="telegram" /></template>
                 </q-input>
                 <q-input dark filled v-model="settings.home.contact.email" label="Email" class="q-mb-sm">
                   <template v-slot:prepend><q-icon name="email" /></template>
                 </q-input>
                 <q-input dark filled v-model="settings.home.contact.website" label="Website" class="q-mb-sm">
                   <template v-slot:prepend><q-icon name="language" /></template>
                 </q-input>
             </div>
          </div>
        </q-tab-panel>

        <!-- BANK DETAILS -->
        <q-tab-panel name="bank">
           <div class="text-h6 q-mb-md">Bank Accounts</div>
           <div class="row q-col-gutter-md">
              <div v-for="(bank, index) in settings.bank" :key="index" class="col-12 col-md-4">
                 <q-card class="bg-dark-page q-pa-md">
                    <div class="text-subtitle1 text-primary q-mb-md">Bank {{ index + 1 }}</div>
                    <q-input dark filled v-model="bank.name" label="Bank Name" class="q-mb-sm" />
                    <q-input dark filled v-model="bank.accountNumber" label="Account Number" class="q-mb-sm" />
                    <q-input dark filled v-model="bank.holder" label="Account Holder" class="q-mb-sm" />
                    <q-input dark filled v-model="bank.branch" label="Branch" />
                 </q-card>
              </div>
           </div>
        </q-tab-panel>

        <!-- TELEGRAM -->
        <q-tab-panel name="telegram">
           <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">Telegram Channels</div>
              <q-btn size="sm" color="accent" label="Add Channel" icon="add" @click="addTelegram" />
           </div>
           
           <div v-for="(channel, index) in settings.telegram" :key="index" class="q-mb-md bg-dark-page q-pa-md rounded-borders relative-position">
              <q-btn flat round dense icon="close" color="negative" class="absolute-top-right q-ma-xs" @click="removeTelegram(index)" />
              <div class="row q-col-gutter-sm">
                 <div class="col-12 col-md-4">
                    <q-input dark filled dense v-model="channel.title" label="Channel Title" />
                 </div>
                 <div class="col-12 col-md-4">
                    <q-input dark filled dense v-model="channel.description" label="Description" />
                 </div>
                 <div class="col-12 col-md-4">
                    <q-input dark filled dense v-model="channel.link" label="Join Link" />
                 </div>
              </div>
           </div>
        </q-tab-panel>

        <!-- WHATSAPP -->
        <q-tab-panel name="whatsapp">
           <div class="row items-center justify-between q-mb-md">
              <div class="text-h6">WhatsApp Channels</div>
              <q-btn size="sm" color="secondary" label="Add Channel" icon="add" @click="addWhatsApp" />
           </div>
           
           <div v-for="(channel, index) in settings.whatsapp" :key="index" class="q-mb-md bg-dark-page q-pa-md rounded-borders relative-position">
              <q-btn flat round dense icon="close" color="negative" class="absolute-top-right q-ma-xs" @click="removeWhatsApp(index)" />
              <div class="row q-col-gutter-sm">
                 <div class="col-12 col-md-4">
                    <q-input dark filled dense v-model="channel.title" label="Group Title" />
                 </div>
                 <div class="col-12 col-md-4">
                    <q-input dark filled dense v-model="channel.description" label="Description" />
                 </div>
                 <div class="col-12 col-md-4">
                    <q-input dark filled dense v-model="channel.link" label="Join Link" />
                 </div>
              </div>
           </div>
        </q-tab-panel>

        <!-- NAVBAR -->
        <q-tab-panel name="navbar">
           <div class="text-h6 q-mb-md">Navigation Bar Items</div>
           <div class="q-banner bg-info text-white q-mb-md rounded-borders dense">
              Configure the top 5 customizable menu items.
           </div>
           
           <div v-for="i in 5" :key="i" class="row q-col-gutter-md q-mb-sm items-center">
              <div class="col-1 text-grey-5 text-bold">#{{ i }}</div>
              <div class="col-5">
                 <q-input dark filled dense v-model="settings.navbar[i-1].title" label="Title" />
              </div>
              <div class="col-6">
                 <q-input dark filled dense v-model="settings.navbar[i-1].link" label="Link URL" />
              </div>
           </div>
        </q-tab-panel>

        <!-- FOOTER -->
        <q-tab-panel name="footer">
           <div class="text-h6 q-mb-md">Footer Settings</div>
           
           <div class="q-mb-lg">
              <div class="text-caption text-grey-5 q-mb-xs">Footer About Description</div>
              <q-input dark filled v-model="settings.footer.about" type="textarea" rows="3" label="Short description about company" />
           </div>
           
           <div class="row q-col-gutter-lg">
              <div v-for="section in ['company', 'community', 'legal']" :key="section" class="col-12 col-md-4">
                 <div class="text-subtitle1 text-uppercase text-weight-bold q-mb-sm text-accent">{{ section }}</div>
                 <div v-for="j in 4" :key="j" class="row q-col-gutter-xs q-mb-xs">
                    <div class="col-6">
                       <q-input dark filled dense v-model="settings.footer.sections[section][j-1].text" label="Link Text" style="font-size: 12px" />
                    </div>
                    <div class="col-6">
                       <q-input dark filled dense v-model="settings.footer.sections[section][j-1].url" label="URL" style="font-size: 12px" />
                    </div>
                 </div>
              </div>
           </div>
           
           <q-separator dark class="q-my-lg" />
           
           <div class="text-subtitle1 text-white q-mb-sm">Developer Credits</div>
           <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                 <q-input dark filled v-model="settings.footer.devName" label="Developer Name" />
              </div>
              <div class="col-12 col-md-6">
                 <q-input dark filled v-model="settings.footer.devUrl" label="Developer URL" />
              </div>
           </div>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const tab = ref('general')
const loading = ref(true)
const saving = ref(false)

// Default Structure based on user request
const defaultSettings = {
  general: {
    siteTitle: 'Online Class',
    logoUrl: '',
    logoUrlLight: '',
    logoSize: 45,
    faviconUrl: '',
    brandMode: 'both',
    maintenanceMode: false,
    maintenanceTitle: 'Under Maintenance',
    maintenanceDescription: 'We are currently performing scheduled maintenance. Please check back later.'
  },
   home: {
      slider: { 
         image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
         subtitle: 'The Future of', 
         title: 'Tuition Management', 
         subText: 'All-in-one platform for students, teachers, and parents. seamless learning, smart management.', 
         btnText: 'Get Started', 
         btnUrl: '/register' 
      },
      guides: [
         { title: 'Student Management', subText: 'Complete usage tracking', link: '#' },
         { title: 'Smart Attendance', subText: 'QR based system', link: '#' },
         { title: 'Fee Management', subText: 'Automated collection', link: '#' },
         { title: 'Online Exams', subText: 'Automated grading', link: '#' }
      ],
      classes: { title: 'Our Classes', description: '' },
      social: { telegram: true, whatsapp: true },
      about: { 
         title: 'About Us', 
         image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
         description: 'OnlineClass.edu.lk is designed to bridge the gap between technology and education.', 
         btnText: 'Read More', 
         btnUrl: '#' 
      },
      contact: { phone1: '', phone2: '', whatsapp: '', telegram: '', email: '', website: '' }
   },
  bank: [
     { name: '', accountNumber: '', holder: '', branch: '' },
     { name: '', accountNumber: '', holder: '', branch: '' },
     { name: '', accountNumber: '', holder: '', branch: '' }
  ],
  telegram: [
     { title: 'Official Channel', description: 'Join for updates', link: '#' }
  ],
  whatsapp: [
     { title: 'Official Group', description: 'Chat with us', link: '#' }
  ],
  navbar: [
     { title: 'Home', link: '/' },
     { title: 'About', link: '/about' },
     { title: 'Courses', link: '/courses' },
     { title: 'Contact', link: '/contact' },
     { title: 'Login', link: '/login' }
  ],
  footer: {
     about: 'Providing the best online education experience.',
     sections: {
        company: [{text:'', url:''}, {text:'', url:''}, {text:'', url:''}, {text:'', url:''}],
        community: [{text:'', url:''}, {text:'', url:''}, {text:'', url:''}, {text:'', url:''}],
        legal: [{text:'', url:''}, {text:'', url:''}, {text:'', url:''}, {text:'', url:''}]
     },
     devName: 'Pasindu',
     devUrl: '#'
  }
}

const settings = reactive(JSON.parse(JSON.stringify(defaultSettings)))

onMounted(async () => {
  await fetchSettings()
})

const fetchSettings = async () => {
   loading.value = true
   const { data, error } = await supabase
     .from('system_settings')
     .select('value')
     .eq('key', 'config')
     .single()
   
   if (!error && data) {
       Object.assign(settings, data.value)
       // Reset ephemeral file objects to avoid type errors
       if (settings.general) { 
         settings.general.logoFile = null; 
         settings.general.logoFileLight = null; 
         settings.general.faviconFile = null; 
       }
       if (settings.home?.slider) settings.home.slider.sliderFile = null;
       if (settings.home?.about) settings.home.about.aboutFile = null;
   }
   loading.value = false
}

const saveSettings = async () => {
   saving.value = true
   
   // Create a clean copy without ephemeral file objects
   const cleanSettings = JSON.parse(JSON.stringify(settings))
   if (cleanSettings.general) { 
      delete cleanSettings.general.logoFile; 
      delete cleanSettings.general.logoFileLight;
      delete cleanSettings.general.faviconFile; 
   }
   if (cleanSettings.home?.slider) {
      delete cleanSettings.home.slider.sliderFile;
      // Revert to default slider image if empty
      if (!cleanSettings.home.slider.image) {
         cleanSettings.home.slider.image = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
   }
   if (cleanSettings.home?.about) {
      delete cleanSettings.home.about.aboutFile;
      // Revert to default about image if empty
      if (!cleanSettings.home.about.image) {
         cleanSettings.home.about.image = 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
   }

   const { error } = await supabase
     .from('system_settings')
     .upsert({ 
        key: 'config', 
        value: cleanSettings 
     }, { onConflict: 'key' })
     
   if (error) {
       $q.notify({ type: 'negative', message: 'Failed to save settings: ' + error.message })
   } else {
       $q.notify({ type: 'positive', message: 'Settings saved successfully!' })
   }
   saving.value = false
}

const addTelegram = () => settings.telegram.push({ title: '', description: '', link: '' })
const removeTelegram = (i) => settings.telegram.splice(i, 1)

const addWhatsApp = () => settings.whatsapp.push({ title: '', description: '', link: '' })
const removeWhatsApp = (i) => settings.whatsapp.splice(i, 1)

// Image Upload Logic
const uploading = ref(false)

const handleUpload = async (file, targetUpdateFn) => {
  if (!file) return
  uploading.value = true
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `settings/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, { upsert: true })
      
    if (uploadError) {
       console.error('Supabase Upload Error:', uploadError)
       throw uploadError
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath)
      
    targetUpdateFn(publicUrl)
    $q.notify({ type: 'positive', message: 'Image uploaded successfully' })
    
  } catch (error) {
    console.error('Upload Error:', error)
    $q.notify({ type: 'negative', message: 'Upload failed: ' + error.message })
  } finally {
    uploading.value = false
  }
}

</script>

<style scoped lang="scss">
.bg-dark-card { background: #121212; }
.bg-dark-page { background: #050505; }
.border-grey { border: 1px solid rgba(255,255,255,0.1); }
</style>
