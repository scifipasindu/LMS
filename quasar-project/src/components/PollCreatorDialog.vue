<template>
  <q-dialog v-model="show" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card :class="$q.dark.isActive ? 'bg-dark text-white' : 'bg-white text-dark'">
          <q-bar class="q-py-md" :class="$q.dark.isActive ? 'bg-black' : 'bg-grey-3'">
              <span class="text-h6">Create New Survey / Paper</span>
              <q-space />
              <q-btn dense flat icon="close" v-close-popup />
          </q-bar>
          
          <q-card-section class="q-px-xl q-py-lg">
              <q-form @submit="createPoll" class="q-gutter-y-lg" style="max-width: 800px; margin: 0 auto;">
                  
                  <!-- Poll Details -->
                  <div class="text-h5 text-weight-bold">Survey Details</div>
                  <q-input 
                      filled :dark="$q.dark.isActive" 
                      v-model="pollTitle" 
                      label="Survey Title" 
                      placeholder="e.g. Weekly Feedback or General Knowledge Quiz"
                      :rules="[val => !!val || 'Required']"
                  />
                  <q-input 
                      filled :dark="$q.dark.isActive" 
                      v-model="pollDescription" 
                      label="Description (Optional)" 
                      type="textarea"
                      rows="2"
                  />

                  <q-separator :dark="$q.dark.isActive" />

                  <!-- Questions List -->
                  <div v-for="(question, qIdx) in questions" :key="qIdx" class="q-pa-md rounded-borders" :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
                      <div class="row items-center justify-between q-mb-sm">
                          <div class="text-subtitle1 text-weight-bold">Question {{ qIdx + 1 }}</div>
                          <q-btn flat round dense icon="delete" color="negative" @click="removeQuestion(qIdx)" v-if="questions.length > 1" />
                      </div>

                      <q-input 
                          filled :dark="$q.dark.isActive" 
                          v-model="question.text" 
                          label="Question" 
                          :rules="[val => !!val || 'Required']"
                          class="q-mb-md"
                      />

                      <!-- Options -->
                      <div class="q-pl-md">
                          <div class="text-caption text-grey q-mb-sm">Options (Select the correct answer)</div>
                          <div v-for="(opt, oIdx) in question.options" :key="oIdx" class="row items-center q-gutter-x-sm q-mb-sm">
                              <!-- Correct Answer Selection -->
                              <q-radio 
                                  dense 
                                  :dark="$q.dark.isActive"
                                  v-model="question.correctIdx" 
                                  :val="oIdx"
                                  color="positive"
                              >
                                  <q-tooltip>Mark as Correct Answer</q-tooltip>
                              </q-radio>
                              
                              <q-input 
                                  dense outlined :dark="$q.dark.isActive" 
                                  v-model="question.options[oIdx]" 
                                  class="col-grow"
                                  :placeholder="`Option ${oIdx + 1}`"
                                  :rules="[val => !!val || 'Required']"
                                  :bg-color="question.correctIdx === oIdx ? ($q.dark.isActive ? 'green-10' : 'green-1') : ''"
                              />
                              <q-btn flat round dense icon="close" size="sm" color="grey" @click="removeOption(qIdx, oIdx)" v-if="question.options.length > 2" />
                          </div>
                          <q-btn flat dense :color="$q.dark.isActive ? 'white' : 'primary'" icon="add" label="Add Option" size="sm" @click="addOption(qIdx)" />
                      </div>
                  </div>

                  <div class="row justify-center q-py-md">
                      <q-btn outline :color="$q.dark.isActive ? 'white' : 'primary'" icon="add_circle" label="Add New Question" @click="addQuestion" />
                  </div>
                  
                  <!-- Footer -->
                  <div class="row justify-end q-mt-xl q-pt-md border-top">
                      <q-btn flat label="Cancel" v-close-popup class="q-mr-sm" size="lg" />
                      <q-btn unelevated color="primary" type="submit" label="Create Survey" size="lg" :loading="loading" />
                  </div>
              </q-form>
          </q-card-section>
      </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'create'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const pollTitle = ref('')
const pollDescription = ref('')
const loading = ref(false)

// Initial state: 1 question with 2 options
const createEmptyQuestion = () => ({
    text: '',
    options: ['', ''],
    correctIdx: 0 // Default first option correct? Or null? Let's default 0 to ensure one is always selected if they don't change it. Or null to force. User said "admin danna ona" (admin needs to put). Let's default null and validate? Or default 0 for ease. Let's default 0.
})

const questions = ref([createEmptyQuestion()])

const addQuestion = () => {
    questions.value.push(createEmptyQuestion())
}

const removeQuestion = (idx) => {
    questions.value.splice(idx, 1)
}

const addOption = (qIdx) => {
    questions.value[qIdx].options.push('')
}

const removeOption = (qIdx, oIdx) => {
    questions.value[qIdx].options.splice(oIdx, 1)
    // Adjust correctIdx if needed
    if (questions.value[qIdx].correctIdx === oIdx) {
        questions.value[qIdx].correctIdx = 0 // Reset to first if deleted
    } else if (questions.value[qIdx].correctIdx > oIdx) {
        questions.value[qIdx].correctIdx--
    }
}

const createPoll = () => {
    if (!pollTitle.value) return
    
    // Basic Validation
    for (const q of questions.value) {
        if (!q.text.trim()) return
        if (q.options.some(o => !o.trim())) return
        if (q.correctIdx === null || q.correctIdx === undefined) {
             // Should ideally show error. But with default 0 it's fine.
             return
        }
    }
    
    emit('create', {
        title: pollTitle.value,
        description: pollDescription.value,
        questions: questions.value.map(q => ({
            text: q.text,
            options: q.options.map((opt, idx) => ({
                text: opt,
                isCorrect: idx === q.correctIdx
            }))
        }))
    })
}
</script>
