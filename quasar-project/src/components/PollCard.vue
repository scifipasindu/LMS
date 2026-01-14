<template>
  <q-card class="poll-card q-mb-lg" :class="$q.dark.isActive ? 'bg-dark-card' : 'bg-white shadow-1'">
      <q-card-section>
          <div class="row items-center justify-between q-mb-xs">
              <div class="text-h6 text-weight-bold">{{ poll.title }}</div>
              <q-badge v-if="!poll.is_active" color="grey" label="Ended" />
              <q-badge v-else color="positive" label="Active" outline />
          </div>
          <div v-if="poll.description" class="text-caption text-grey q-mb-md">{{ poll.description }}</div>

          <q-separator :dark="$q.dark.isActive" class="q-mb-md" />

          <!-- Questions Loop -->
          <div class="q-gutter-y-lg">
              <div v-for="(question, qIdx) in poll.poll_questions" :key="question.id">
                  <div class="text-subtitle1 text-weight-medium q-mb-sm">{{ qIdx + 1 }}. {{ question.question_text }}</div>
                  
                  <div class="q-gutter-y-sm q-pl-sm">
                      <div 
                          v-for="option in question.poll_options" 
                          :key="option.id" 
                          class="poll-option relative-position overflow-hidden cursor-pointer"
                          :class="{
                              'selected': isOptionSelected(question.id, option.id), 
                              'disabled': voting || hasVoted(question.id),
                              'items-center': true,
                              'bg-green-1': hasVoted(question.id) && option.is_correct && !$q.dark.isActive,
                              'bg-green-10': hasVoted(question.id) && option.is_correct && $q.dark.isActive,
                              'bg-red-1': hasVoted(question.id) && isOptionSelected(question.id, option.id) && !option.is_correct && !$q.dark.isActive,
                              'bg-red-10': hasVoted(question.id) && isOptionSelected(question.id, option.id) && !option.is_correct && $q.dark.isActive
                          }"
                          @click="castVote(question.id, option.id)"
                      >
                          <!-- Progress Bar (Only show if Neutral) -->
                          <div 
                              class="absolute-full bg-primary-soft transition-width" 
                              :style="{ width: getPercentage(question, option) + '%' }"
                              v-if="!hasVoted(question.id) || (!option.is_correct && !isOptionSelected(question.id, option.id))"
                          ></div>
                          
                          <!-- Content -->
                          <div class="relative-position row justify-between items-center q-px-md q-py-sm">
                              <div class="row items-center">
                                  <q-icon v-if="isOptionSelected(question.id, option.id)" :name="option.is_correct ? 'check_circle' : 'cancel'" :color="option.is_correct ? 'positive' : 'negative'" class="q-mr-sm" />
                                  <q-icon v-else-if="hasVoted(question.id) && option.is_correct" name="check_circle" color="positive" class="q-mr-sm" />
                                  <q-icon v-else :name="isAdmin && option.is_correct ? 'check_circle' : 'radio_button_unchecked'" :color="isAdmin && option.is_correct ? 'positive' : 'grey-6'" class="q-mr-sm" />
                                  
                                  <span :class="{'text-weight-bold': isOptionSelected(question.id, option.id) || (hasVoted(question.id) && option.is_correct)}">{{ option.option_text }}</span>
                              </div>
                              <div class="text-caption text-weight-bold">{{ getPercentage(question, option) }}%</div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="text-caption text-grey q-mt-xs text-right">
                      {{ getTotalVotes(question) }} votes
                  </div>
              </div>
          </div>

      </q-card-section>
      
      <!-- Admin Actions -->
      <q-card-actions v-if="isAdmin || isCreator" align="right">
          <q-btn flat dense color="negative" label="End Survey" size="sm" v-if="poll.is_active" @click="$emit('end', poll.id)" />
          <q-btn flat dense color="grey" label="Delete" icon="delete" size="sm" @click="$emit('delete', poll.id)" />
      </q-card-actions>
  </q-card>
</template>

<script setup>


const props = defineProps({
    poll: { type: Object, required: true },
    userVotes: { type: Object, default: () => ({}) }, // Object map: { questionId: optionId }
    isAdmin: { type: Boolean, default: false },
    isCreator: { type: Boolean, default: false },
    voting: { type: Boolean, default: false }
})

const emit = defineEmits(['vote', 'end', 'delete'])

const getTotalVotes = (question) => {
    return question.poll_options.reduce((acc, opt) => acc + (opt.vote_count || 0), 0)
}

const getPercentage = (question, option) => {
    const total = getTotalVotes(question)
    if (total === 0) return 0
    return Math.round(((option.vote_count || 0) / total) * 100)
}

const hasVoted = (questionId) => {
    return !!props.userVotes[questionId]
}

const isOptionSelected = (questionId, optionId) => {
    return props.userVotes[questionId] === optionId
}

const castVote = (questionId, optionId) => {
    if (props.voting || !props.poll.is_active) return
    if (hasVoted(questionId)) return // Already voted on this question
    
    emit('vote', { pollId: props.poll.id, questionId, optionId })
}
</script>

<style scoped lang="scss">
.poll-card {
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
}

.bg-dark-card {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.05);
}

.poll-option {
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  transition: all 0.2s;
  
  &:hover:not(.disabled) {
      background: rgba(0,0,0,0.02);
  }
  
  &.selected {
      border-color: $primary;
  }
}

.bg-primary-soft {
  background: rgba($primary, 0.15);
  transition: width 0.5s ease-out;
}

body.body--dark {
  .poll-option {
      border-color: rgba(255,255,255,0.1);
      &:hover:not(.disabled) {
          background: rgba(255,255,255,0.05);
      }
  }
}
</style>
