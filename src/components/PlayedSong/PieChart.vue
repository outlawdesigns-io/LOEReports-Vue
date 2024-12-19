<script setup>

import { useStore } from 'vuex';
import { ref,computed } from 'vue';
import CommonMethods from '../../CommonMethods';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale } from 'chart.js';
import { Pie } from 'vue-chartjs';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

const store = useStore();

const props = defineProps({
  timeFrame: {
    type: String,
    required: true,
  },
  metalFormula:{
    type:String,
    required:true,
  }
});

const data  = computed(()=>{
  let storeData = store.state.Song.played.reduce((acc,e)=>{
    if(column.value === 'genre'){
      const pattern = new RegExp(props.metalFormula.slice(1, props.metalFormula.lastIndexOf('/')), props.metalFormula.slice(props.metalFormula.lastIndexOf('/') + 1));
      if(e[column.value]?.match(pattern)){
        acc['Metal'] = (acc['Metal'] || 0) + 1;
      }else{
        acc[e[column.value]] = (acc[e[column.value]] || 0) + 1;
      }
    }else{
      acc[e[column.value]] = (acc[e[column.value]] || 0) + 1;
    }
    return acc;
  },{});
  return {
    labels: Object.keys(storeData),
    datasets: [
      {
        data:Object.values(storeData),
        backgroundColor:Object.values(storeData).map(CommonMethods.generateColor)
      }
    ],
  }
});

const options = ref(
  {responsive:true, maintainAspectRatio:false}
);

const update = (event) => {
  store.dispatch('getStatsByColumn',[props.timeFrame,column.value]);
}

const tiedPairs = ref({
  artist_country:'publisher',
  publisher:'genre',
  genre:'artist',
  artist:'album',
});

const column = ref('genre');


</script>

<template>
  <div>
    <v-select v-model="column" :items="Object.keys(tiedPairs)" @update:modelValue="update"></v-select>
    <Pie :data="data" />
  </div>
</template>

<style scoped></style>
