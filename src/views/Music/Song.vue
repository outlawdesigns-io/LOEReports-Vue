<script setup>

import { useStore } from 'vuex';
import { ref,computed,watch } from 'vue';
import CommonMethods from '../../CommonMethods';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js';
import { Line } from 'vue-chartjs';
import PieChart from '../../components/Music/PieChart.vue';
import SongTable from '../../components//Music/SongTable.vue';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const store = useStore();

const lineData = computed(()=>{
  return {
    labels: Object.keys(store.state.Song.songs.reduce(CommonMethods.groupCreatedDate,{})).reverse(),
    datasets:[
      {
        data: Object.values(store.state.Song.songs.reduce(CommonMethods.groupCreatedDate,{})).reverse(),
        label:'Library Additions',
        backgroundColor:'#fc03db',
        borderColor:'#fc03db',
        tension: 0.5,
      }
    ]
  };
});

const timeframes = ref([
  {
    label:'All Time',
    value:'All'
  },
  {
    label:'This Year',
    value:'ytd'
  },
  {
    label:'This Quarter',
    value:'qtd'
  },
  {
    label:'This Month',
    value:'Mtd'
  },
  {
    label:'This Week',
    value:'wtd'
  },
  {
    label:'Today',
    value:'td'
  }
]);

const metalFormulas = ref([
  {
    label:'All Distinct',
    value:'/^$|(?!)/',
  },
  {
    label:'Grouped',
    value:'/metal/i',
  },
  {
    label:'Grouped+',
    value:'/metal|core|grind/gi',
  },
  // {
  //   label:'Family Groups',
  //   value:'/./',
  // }
]);

const selectedTimeFrame = ref('qtd');
const selectedMetalFormula = ref(metalFormulas.value[0].value);

const updateSelectedFormula = (newFormula) => {
  selectedMetalFormula.value = newFormula;
};

const resetGraphs = () => {
  init();
}
const init = () => {
  store.dispatch('getSongs',selectedTimeFrame.value);
}

const songs = computed(()=>{
  return store.state.Song.songs;
});
const playTimeStr = computed(()=>{
  let lengthData = store.state.Song.songs.reduce(CommonMethods.Music.reduceLength,{});
  let ms = lengthData.milliseconds || 0;
  let retStr = CommonMethods.buildTimeStr(ms);
  return retStr += ` (Null: ${((lengthData.nullCount / store.state.Song.songs.length) * 100).toFixed(2) || 0}%)`;
});



try{
  init();
}catch(err){
  setTimeout(()=>{
    init();
  },1000);
}


</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="12">
        <v-select v-model="selectedTimeFrame" :items="timeframes" item-title="label" item-value="value" label="Time Frame" @update:modelValue="resetGraphs"></v-select>
        <v-select v-model="selectedMetalFormula" :items="metalFormulas" item-title="label" item-value="value" label="Metal Formula" @update:modelValue="resetGraphs"></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <v-card>
          <v-card-title class="text-center">Library Metrics</v-card-title>
          <v-card-text class="text-center">
            <v-list>
              <v-list-item>
                Total Songs: {{songs.length}}
              </v-list-item>
              <v-list-item>
                Play Time: {{playTimeStr}}
              </v-list-item>
              <v-list-item>
                <!-- Library Consumed: {{libraryConsumptionPercent}} -->
              </v-list-item>
              <v-list-item>
                <!-- Consumption Rate: {{libraryConsumptionRate}} {{ selectedTimeFrame == 'td' ? '/ hour':'/ day'}} -->
              </v-list-item>
              <v-list-item>
                <!-- Library Exhaustion Projection: {{ selectedTimeFrame == 'td' ? (unplayedSongs.length / (libraryConsumptionRate * 24)).toFixed(2):(unplayedSongs.length / libraryConsumptionRate).toFixed(2) }} days -->
              </v-list-item>
              <v-list-item>
                <!-- Average Days To First Play: {{avgDaysToFirstPlay}} -->
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <Line :data="lineData" :options="{responsive:true, maintainAspectRatio:false}" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title class="text-center"></v-card-title>
          <v-card-text class="text-center"></v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <PieChart class="bordered" :items="songs" :metalFormula="selectedMetalFormula" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title class="text-center"></v-card-title>
          <v-card-text></v-card-text>
          <v-card-actions class="justify-center"></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <v-card>
          <v-card-title>Songs</v-card-title>
          <v-card-text>
            <SongTable :items="songs" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text></v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text></v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6"></v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>
