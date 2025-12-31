<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <h4 class="text-h4 text-white text-weight-bold q-my-none">My Classes</h4>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-4" v-for="course in courses" :key="course.id">
        <q-card class="bg-dark-card text-white column full-height">
          <q-img :src="course.image" :ratio="16/9">
             <div class="absolute-bottom text-subtitle2 bg-black-grad">
               {{ course.teacher }}
             </div>
          </q-img>

          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ course.title }}</div>
                <div class="text-caption text-grey-5">{{ course.schedule }}</div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-caption text-grey">Progress</div>
            <q-linear-progress :value="course.progress" color="accent" class="q-mt-xs" rounded />
          </q-card-section>

          <q-card-actions align="right" class="q-mt-auto">
            <q-btn flat color="accent" label="View Class" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
const courses = [
  { 
    id: 1, 
    title: 'Advanced Mathematics', 
    teacher: 'Mr. Silva',
    schedule: 'Mon & Wed 10:00 AM',
    progress: 0.75,
    image: 'https://cdn.quasar.dev/img/parallax2.jpg'
  },
  { 
    id: 2, 
    title: 'Physics 101', 
    teacher: 'Mrs. Perera',
    schedule: 'Tue & Thu 2:00 PM',
    progress: 0.45,
    image: 'https://cdn.quasar.dev/img/parallax1.jpg'
  },
  { 
    id: 3, 
    title: 'Chemistry Lab', 
    teacher: 'Dr. Fernando',
    schedule: 'Friday 9:00 AM',
    progress: 0.20,
    image: 'https://cdn.quasar.dev/img/mountains.jpg'
  }
]
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
