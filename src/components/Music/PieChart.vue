<script setup>

import { useStore } from 'vuex';
import { ref,computed } from 'vue';
import CommonMethods from '../../CommonMethods';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale } from 'chart.js';
import { Pie } from 'vue-chartjs';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

const store = useStore();

const props = defineProps({
  // timeFrame: {
  //   type: String,
  //   required: true,
  // },
  items: {
    type: Array,
    required: true,
  },
  metalFormula:{
    type:String,
    required:true,
  }
});

const data  = computed(()=>{
  let storeData = props.items.reduce((acc,e)=>{
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


const columns = computed(()=>{
  return props.items.length > 0 && typeof props.items[0] === 'object' ? Object.keys(props.items[0]).reduce((acc,e)=>{acc.push({key:e,title:e}); return acc},[]) : [];
});

const column = ref('genre');


</script>

<template>
  <div>
    <v-select v-model="column" :items="columns"></v-select>
    <Pie :data="data" />
  </div>
</template>

<style scoped></style>
