<script setup>

import { useStore } from 'vuex';
import { ref,computed } from 'vue';
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
import PieChart from './PlayedSong/PieChart.vue';
import FirstAndAllBarChart from './PlayedSong/FirstTimeAndAll_StackedBar.vue';
import SongTable from './PlayedSong/SongTable.vue';
import PlaysAndAdditionsBarChart from './PlayedSong/PlaysAndAdditions_Bar.vue';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

const store = useStore();

const lineData = computed(()=>{
  return {
    labels: store.state.playsAndAdditions.map((e)=>{ return new Date(e.x).toISOString().split('T')[0] }),
    datasets:[
      {
        data: store.state.playsAndAdditions.map((e)=>{ return e.play_events }),
        label: 'Play Events',
        backgroundColor:'#f7bb07',
        borderColor:'#f7bb07',
        tension: 0.5,
      },
      {
        data: store.state.playsAndAdditions.map((e)=>{ return e.new_additions }),
        label:'Library Additions',
        backgroundColor:'#fc03db',
        borderColor:'#fc03db',
        tension: 0.5,
      }
    ]
  };
});

const playedSongs = computed(()=>{
  return store.state.playedSongs;
});

const unplayedSongs = computed(()=>{
  return store.state.unplayedSongs;
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
    value:/^$|(?!)/,
  },
  {
    label:'Grouped',
    value:/metal/i,
  },
  {
    label:'Grouped+',
    value:/metal|core|grind/gi,
  },
  // {
  //   label:'Family Groups',
  //   value:'/./',
  // }
]);

const selectedTimeFrame = ref('qtd');
// const selectedMetalFormula = ref('AD');
const selectedMetalFormula = ref(/^$|(?!)/);

function _generateColor(label){
  return '#' + Math.floor(Math.random()*16777215).toString(16);
}

const resetGraphs = () => {
  store.dispatch('getPlayedSongs',selectedTimeFrame.value);
  store.dispatch('getPlaysAndAdditions',[selectedTimeFrame.value]);
  // store.dispatch('getStatsByColumn',[selectedTimeFrame.value,'genre']);
  // store.dispatch('getFirstTimePlays',[selectedTimeFrame.value]);
}
const init = () => {
  store.dispatch('getPlayedSongs',selectedTimeFrame.value);
  store.dispatch('getPlaysAndAdditions',[selectedTimeFrame.value]);
  store.dispatch('getUnplayedSongs');
}

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
          <v-card-title></v-card-title>
          <v-card-text>
            <Line :data="lineData" :options="{responsive:true, maintainAspectRatio:false}" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
        <!-- <v-progress-circular v-if="fetchingLineData" model-value="20" indeterminate></v-progress-circular> -->
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <PlaysAndAdditionsBarChart :timeFrame="selectedTimeFrame" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <PieChart class="bordered" :timeFrame="selectedTimeFrame" :metalFormula="selectedMetalFormula" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <FirstAndAllBarChart class="bordered" :timeFrame="selectedTimeFrame" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <v-card>
          <v-card-title>Played Songs</v-card-title>
          <v-card-text>
            <SongTable :items="playedSongs" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12">
        <v-card>
          <v-card-title>Unplayed Songs</v-card-title>
          <v-card-text>
            <SongTable :items="unplayedSongs" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <!-- <div>
    <ul>
      <li v-for="s in storeData">{{s.title}}</li>
    </ul>
  </div> -->
</template>

<style scoped>

</style>
