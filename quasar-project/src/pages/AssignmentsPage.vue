<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <h4 class="text-h4 text-white text-weight-bold q-my-none">Assignments</h4>
    </div>

    <div class="q-gutter-y-md">
       <q-list class="bg-dark-card rounded-borders text-white" separator>
          <q-item v-for="task in assignments" :key="task.id" clickable v-ripple>
             <q-item-section avatar>
                <q-avatar :color="task.type === 'Exam' ? 'negative' : 'primary'" text-color="white" icon="assignment" />
             </q-item-section>
             
             <q-item-section>
                <q-item-label class="text-h6">{{ task.title }}</q-item-label>
                <q-item-label caption class="text-grey-5">{{ task.course }} • Due: {{ task.dueDate }}</q-item-label>
             </q-item-section>
             
             <q-item-section side>
                <q-chip outline :color="getPriorityColor(task.priority)">{{ task.priority }} Priority</q-chip>
             </q-item-section>

             <q-item-section side>
                <q-btn flat round icon="upload_file" color="accent" />
             </q-item-section>
          </q-item>
       </q-list>
    </div>
  </q-page>
</template>

<script setup>
const assignments = [
  { id: 1, title: 'Calculus Midterm Review', course: 'Mathematics', dueDate: 'Oct 25, 2025', priority: 'High', type: 'Assignment' },
  { id: 2, title: 'Physics Lab Report 3', course: 'Physics', dueDate: 'Oct 28, 2025', priority: 'Medium', type: 'Lab' },
  { id: 3, title: 'Organic Chemistry Quiz', course: 'Chemistry', dueDate: 'Nov 02, 2025', priority: 'High', type: 'Exam' }
]

const getPriorityColor = (p) => {
   if (p === 'High') return 'negative'
   if (p === 'Medium') return 'warning'
   return 'positive'
}
</script>

<style scoped>
.bg-dark-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
}
</style>
