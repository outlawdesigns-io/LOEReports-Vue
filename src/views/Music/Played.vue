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
import FirstAndReplayBarChart from '../../components/Music/PlayedSong/FirstAndReplayBarChart.vue';
import PlaysAndAdditionsBarChart from '../../components/Music/PlayedSong/PlaysAndAdditions_Bar.vue';


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

const replayRatio = computed(()=>{
  return CommonMethods.reduceRatio(
    store.state.Song.played.reduce(CommonMethods.reduceReplays,0),
    store.state.Song.played.reduce(CommonMethods.reduceFirstTimePlays,0)
  );
});
const consumptionRatio = computed(()=>{
  return CommonMethods.reduceRatio(
    store.state.playsAndAdditions.reduce((acc,e)=>{ return acc += e.play_events },0),
    store.state.playsAndAdditions.reduce((acc,e)=>{ return acc += e.new_additions },0)
  );
});
const playTimeStr = computed(()=>{
  let lengthData = store.state.Song.played.reduce(CommonMethods.Music.reduceLength,{});
  let ms = lengthData.milliseconds || 0;
  let retStr = CommonMethods.buildTimeStr(ms);
  return retStr += ` (Null: ${((lengthData.nullCount / store.state.Song.played.length) * 100).toFixed(2) || 0}%)`;
});

const libraryConsumptionPercent = computed(()=>{
  return `${store.state.Song.libraryConsumptionData.percent_consumed}%`;
});

const libraryConsumptionRate = computed(()=>{
  if(selectedTimeFrame.value == 'td'){
    const hourCounts = Object.values(store.state.Song.played.reduce((acc, e)=>{
      const date = new Date(e.playDate);
      const hour = date.getHours();
      if(!e.isFirstTimePlay){
        return acc;
      }else if(!acc[hour]){
        acc[hour] = 1;
      }else{
        acc[hour]++;
      }
      return acc;
    },{}));
    return hourCounts.length ? (hourCounts.reduce((a, b)=> a + b) / hourCounts.length).toFixed(2): 0;
  }else{
    const values = store.state.playsAndAdditions.map((e)=>{ return e.play_events });
    return values.length ? (values.reduce((a, b) => a + b) / values.length).toFixed(2) : 0;
  }
});

const avgDaysToFirstPlay = computed(()=>{
  let res = store.state.Song.played.reduce((acc, e)=>{
    if(!e.isFirstTimePlay){
      return acc;
    }
    acc.daySum += e.daysInLibrary;
    acc.itemCount++;
    return acc;
  },{daySum:0,itemCount:0});
  return (res.daySum / res.itemCount).toFixed(2);
});

const playedSongs = computed(()=>{
  return store.state.Song.played;
});

const unplayedSongs = computed(()=>{
  return store.state.Song.unplayed;
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

const selectedTimeFrame = ref('wtd');
const selectedMetalFormula = ref(metalFormulas.value[0].value);

const updateSelectedFormula = (newFormula) => {
  selectedMetalFormula.value = newFormula;
};

const resetGraphs = async () => {
  try{
    await store.dispatch('getSongPlaysAndAdditions',[selectedTimeFrame.value]);
    await store.dispatch('getLibraryConsumptionData',selectedTimeFrame.value);
    await store.dispatch('getPlayedSongs',selectedTimeFrame.value);
  }catch(err){
    console.log(err);
    alert("Error caught!!\n" + err.error);
  }
  // store.dispatch('getStatsByColumn',[selectedTimeFrame.value,'genre']);
  // store.dispatch('getFirstTimePlays',[selectedTimeFrame.value]);
}
const init = async () => {
  try{
    await store.dispatch('subscribeToPlayedSongs');
    await store.dispatch('getPlayedSongs',selectedTimeFrame.value);
    await store.dispatch('getSongPlaysAndAdditions',[selectedTimeFrame.value]);
    await store.dispatch('getUnplayedSongs');
    await store.dispatch('getLibraryConsumptionData',selectedTimeFrame.value);
  }catch(err){
    console.log(err);
    alert("Error caught!!\n" + err.error);
  }
}

/*
probably a more appropriate way to do this,
like a component event we can bind to or something
*/
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
          <v-card-title class="text-center">Consumption Metrics</v-card-title>
          <v-card-text class="text-center">
            <v-list>
              <v-list-item>
                Play Time: {{playTimeStr}}
              </v-list-item>
              <v-list-item>
                Library Consumed: {{libraryConsumptionPercent}}
              </v-list-item>
              <v-list-item>
                Consumption Rate: {{libraryConsumptionRate}} {{ selectedTimeFrame == 'td' ? '/ hour':'/ day'}}
              </v-list-item>
              <v-list-item>
                Library Exhaustion Projection: {{ selectedTimeFrame == 'td' ? (unplayedSongs.length / (libraryConsumptionRate * 24)).toFixed(2):(unplayedSongs.length / libraryConsumptionRate).toFixed(2) }} days
              </v-list-item>
              <v-list-item>
                Average Days To First Play: {{avgDaysToFirstPlay}}
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
        <!-- <v-progress-circular v-if="fetchingLineData" model-value="20" indeterminate></v-progress-circular> -->
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title class="text-center">
            <span style="margin:auto">Consumption Ratio {{consumptionRatio.join(':')}}</span>
          </v-card-title>
          <v-card-text class="text-center">
            <PlaysAndAdditionsBarChart :timeFrame="selectedTimeFrame" />
          </v-card-text>
          <v-card-actions>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <PieChart class="bordered" :items="playedSongs" :metalFormula="selectedMetalFormula" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card>
          <v-card-title class="text-center">
            <span>Replay Ratio {{replayRatio.join(':')}}</span>
          </v-card-title>
          <v-card-text>
            <FirstAndReplayBarChart class="bordered" :timeFrame="selectedTimeFrame" />
          </v-card-text>
          <v-card-actions class="justify-center"></v-card-actions>
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
    <v-row>
      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title></v-card-title>
          <v-card-text>
            <PieChart class="bordered" :items="unplayedSongs" :metalFormula="selectedMetalFormula" />
          </v-card-text>
          <v-card-actions></v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6"></v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>
