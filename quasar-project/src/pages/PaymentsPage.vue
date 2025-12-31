<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <h4 class="text-h4 text-white text-weight-bold q-my-none">Payments History</h4>
    </div>

    <q-card class="bg-dark-card text-white">
      <q-table
        :rows="payments"
        :columns="columns"
        row-key="id"
        dark
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
const columns = [
  { name: 'date', label: 'Date', align: 'left', field: 'date', sortable: true },
  { name: 'description', label: 'Description', align: 'left', field: 'description' },
  { name: 'amount', label: 'Amount', align: 'right', field: 'amount' },
  { name: 'status', label: 'Status', align: 'center', field: 'status' },
  { name: 'action', label: 'Invoice', align: 'center' }
]

const payments = [
  { id: 1, date: '2025-10-01', description: 'October Tuition - Math', amount: 'Rs. 2500', status: 'Paid' },
  { id: 2, date: '2025-10-05', description: 'October Tuition - Physics', amount: 'Rs. 3000', status: 'Paid' },
  { id: 3, date: '2025-11-01', description: 'November Tuition - Math', amount: 'Rs. 2500', status: 'Pending' }
]
</script>

<style scoped>
.bg-dark-card {
  background: #121212;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}
</style>
