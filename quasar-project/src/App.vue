<template>
  <router-view />
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useMeta } from 'quasar'
import { supabase } from 'boot/supabase'

const siteTitle = ref('Online Class')
const faviconLink = ref('favicon.ico')

const faviconType = computed(() => {
  const url = faviconLink.value.toLowerCase()
  if (url.includes('.ico')) return 'image/x-icon'
  if (url.includes('.svg')) return 'image/svg+xml'
  return 'image/png'
})

useMeta(() => ({
  title: siteTitle.value,
  link: {
    icon: { type: faviconType.value, rel: 'icon', href: faviconLink.value }
  }
}))

onMounted(async () => {
  console.log('App mounted, fetching settings...')
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'config')
    .single()
    
  if (error) console.error('Error fetching settings:', error)
  
  if (data?.value?.general) {
      console.log('Settings fetched:', data.value.general)
      if (data.value.general.siteTitle) siteTitle.value = data.value.general.siteTitle
      if (data.value.general.faviconUrl) {
         // Append timestamp to force refresh
         faviconLink.value = `${data.value.general.faviconUrl}?t=${Date.now()}`
         console.log('New favicon applied:', faviconLink.value)
      }
  }
})
</script>
