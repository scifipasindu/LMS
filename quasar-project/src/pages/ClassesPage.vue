<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <h4 class="text-h4 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">My Classes</h4>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-4" v-for="course in courses" :key="course.id">
        <q-card class="column full-height" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
          <q-img :src="course.image" :ratio="16/9">
             <div class="absolute-bottom text-subtitle2 bg-black-grad">
               {{ course.teacher }}
             </div>
             <q-btn 
               icon="play_circle" 
               color="accent" 
               round 
               class="absolute-center shadow-10" 
               size="lg"
               :to="`/course/${course.id}/learn`"
             />
          </q-img>

          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ course.title }}</div>
                <div class="text-caption" :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-7'">{{ course.schedule }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-caption" :class="$q.dark.isActive ? 'text-grey' : 'text-grey-7'">Progress</div>
            <q-linear-progress :value="course.progress" color="accent" class="q-mt-xs" rounded />
          </q-card-section>

          <q-card-actions align="right" class="q-mt-auto">
            <q-btn flat color="accent" label="View Class" :to="`/dashboard/course/${course.id}`" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

     <!-- Video Player Dialog Deleted -->
   </q-page>
 </template>
 
 <script setup>
 import { ref, onMounted } from 'vue'
 import { supabase } from 'boot/supabase'
 
 const courses = ref([])
 const loading = ref(true)
 
 onMounted(async () => {
     const { data } = await supabase
         .from('courses')
         .select('*, lessons(*)')
         .order('created_at', { ascending: false })
     
     courses.value = (data || []).map(c => ({
         ...c,
         image: c.image_url || 'https://cdn.quasar.dev/img/parallax2.jpg',
         progress: 0.0, 
         schedule: c.schedule || 'Flexible'
     }))
     loading.value = false
 })
 </script>

<style scoped>
.bg-dark-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  transition: transform 0.2s;
}

.bg-dark-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.1);
}

.bg-black-grad {
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
}
</style>
