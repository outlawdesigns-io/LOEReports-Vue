<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import CommonMethods from '../../CommonMethods';
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
    labels: ['First Time Plays', 'Replays' ],
    datasets: [
      {
        label:'First Time Plays',
        backgroundColor:[CommonMethods.generateColor(),CommonMethods.generateColor()],
        data: [
          store.state.Song.played.reduce(CommonMethods.reduceFirstTimePlays,0),
          null
        ]
      },
      {
        label:'Replays',
        backgroundColor:[CommonMethods.generateColor(),CommonMethods.generateColor()],
        data: [
          null,
          store.state.Song.played.reduce(CommonMethods.reduceReplays,0),
        ]
      }
    ]
  }
});

</script>

<template>
  <div id="chartContainer">
    <Bar :data="data" :options="options" />
  </div>
</template>

<style scoped>
#chartContainer{
  /* width:50%; */
}
</style>
