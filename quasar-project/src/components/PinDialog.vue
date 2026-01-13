<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 300px" :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark'">
      <q-card-section>
        <div class="text-h6 text-negative row items-center">
            <q-icon name="lock" class="q-mr-sm"/>
            Security PIN Required
        </div>
        <div class="text-caption">Please enter your 6-digit Security PIN to proceed.</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="pin"
          filled
          :dark="$q.dark.isActive"
          label="Security PIN"
          mask="######"
          type="password"
          autofocus
          class="text-center"
          input-class="text-center letter-spacing-lg"
          @keyup.enter="verify"
          :error="!!error"
          :error-message="error"
        />
      </q-card-section>

      <q-card-actions align="right">
        <!-- Optional Cancel Button (can be hidden if mandatory) -->
        <q-btn v-if="!mandatory" flat label="Cancel" v-close-popup />
        <q-btn flat label="Verify" color="negative" @click="verify" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { supabase } from 'boot/supabase'

const props = defineProps({
  modelValue: Boolean,
  targetPin: String, // If provided, compares against this. If null, fetches from DB.
  mandatory: Boolean // If true, hides Cancel
})

const emit = defineEmits(['update:modelValue', 'verified'])

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const pin = ref('')
const error = ref('')
const loading = ref(false)
const fetchedPin = ref(null)

const verify = async () => {
    if (pin.value.length !== 6) {
        error.value = 'PIN must be 6 digits'
        return
    }

    loading.value = true
    error.value = ''

    try {
        let correctPin = props.targetPin || fetchedPin.value

        // If not provided and not fetched yet, fetch now
        if (!correctPin) {
             const { data: { user } } = await supabase.auth.getUser()
             if (!user) throw new Error('Not authenticated')

             const { data: profile } = await supabase
                .from('profiles')
                .select('security_pin')
                .eq('id', user.id)
                .single()
            
             correctPin = profile?.security_pin
             fetchedPin.value = correctPin
        }

        if (!correctPin) {
            // User has no PIN set? 
            // If mandatory, maybe fail? allowing for now if no PIN set for user convenience unless strict mode
             emit('verified')
             show.value = false
             return
        }

        if (pin.value === correctPin) {
            emit('verified')
            show.value = false
            pin.value = '' // Clear
        } else {
            error.value = 'Incorrect PIN'
        }

    } catch (err) {
        console.error(err)
        error.value = 'Verification Error'
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.bg-dark-card {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
}
.letter-spacing-lg {
    letter-spacing: 5px;
}
</style>
