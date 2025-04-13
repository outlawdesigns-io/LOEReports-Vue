<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import CommonMethods from '../../../CommonMethods';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, BarElement, Title, Tooltip, Legend);

const store = useStore();

defineProps({
  timeFrame: {
    type: String,
    required: true,
  },
});

const options = ref(
  {
    responsive:true,
    maintainAspectRatio:true,
    scales:{
      x:{
        stacked:true
      },
      y:{
        beginAtZero:true
      }
    }
  }
);

const data = computed(()=>{
  return {
    labels: ['Play Events','Library Additions'],
    datasets: [
      {
        label:'Play Events',
        backgroundColor:['#f7bb07'],
        data: [
          store.state.playsAndAdditions.reduce((acc,e)=>{ return acc += e.play_events },0),
          null
        ]
      },
      {
        label:'Library Additions',
        backgroundColor:['#fc03db'],
        data:[
          null,
          store.state.playsAndAdditions.reduce((acc,e)=>{ return acc += e.new_additions },0)
        ]
      }
    ]
  }
});

</script>

<template>
  <div>
    <Bar :data="data" :options="options" />
  </div>
</template>

<style scoped></style>
