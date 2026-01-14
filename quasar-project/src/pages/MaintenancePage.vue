<template>
  <div class="maintenance-container flex flex-center text-center q-pa-md bg-dark-page text-white fullscreen">
    <div>
      <div style="font-size: 15vh" class="q-mb-md">🛠️</div>
      <h2 class="text-h2 text-weight-bold q-mt-none q-mb-md text-primary">{{ title || 'Under Maintenance' }}</h2>
      <div class="text-h5 text-grey-5 q-mb-xl" style="max-width: 600px; margin: 0 auto; line-height: 1.6;">
        {{ description || 'We are currently performing scheduled maintenance to improve our services. Please check back soon.' }}
      </div>
       <q-btn flat no-caps color="grey-6" label="Admin Login" to="/login" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'

const title = ref('')
const description = ref('')

onMounted(async () => {
   const { data } = await supabase
     .from('system_settings')
     .select('value')
     .eq('key', 'config')
     .single()
     
   if (data?.value?.general) {
       title.value = data.value.general.maintenanceTitle
       description.value = data.value.general.maintenanceDescription
   }
})
</script>

<style scoped>
.bg-dark-page {
    background: #050505;
}
</style>
