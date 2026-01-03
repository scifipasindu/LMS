<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <h4 class="text-h4 text-weight-bold q-my-none" :class="$q.dark.isActive ? 'text-white' : 'text-dark'">Payments History</h4>
    </div>

    <q-card :class="$q.dark.isActive ? 'bg-dark-card text-white' : 'bg-white text-dark shadow-2'">
      <q-table
        :rows="payments"
        :columns="columns"
        row-key="id"
        :dark="$q.dark.isActive"
        flat
        class="bg-transparent"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip 
              :color="props.row.status === 'Paid' ? 'positive' : 'warning'" 
              text-color="white" 
              dense 
              class="text-uppercase"
            >
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>
        
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
             <q-btn flat round icon="download" color="primary" dense>
                <q-tooltip>Download Invoice</q-tooltip>
             </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue' // core
const columns = [
  { name: 'date', label: 'Date', align: 'left', field: 'date', sortable: true },
  { name: 'description', label: 'Description', align: 'left', field: 'description' },
  { name: 'amount', label: 'Amount', align: 'right', field: 'amount' },
  { name: 'status', label: 'Status', align: 'center', field: 'status' },
  { name: 'action', label: 'Invoice', align: 'center' }
]

const payments = ref([]) // TODO: Connect to real payments data when available
</script>

<style scoped>
.bg-dark-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}
</style>
