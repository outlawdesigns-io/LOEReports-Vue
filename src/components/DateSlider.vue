<style scoped>
:deep(.v-slider-thumb__label) {
  min-width: 85px;
}
</style>
<template>
  <v-row>
    <v-select v-model="selectedTimeFrame" :items="timeframes" item-title="label" item-value="value" label="Time Frame" @update:modelValue="resetPoints"></v-select>
  </v-row>
  <v-row>
    <v-col class="pa-12">
      <v-range-slider
        :model-value="[0, recentDays.length - 1]"
        :step="stepIncrement"
        :ticks="sliderTicks"
        :max="recentDays.length - 1"
        min="0"
        show-ticks="always"
        thumb-label="always"
        tick-size="1"
        strict
        @end="emitSliderChange"
      >
        <template v-slot:thumb-label="{ modelValue }">
          {{ formatThumb(modelValue) }}
          <!-- <v-icon :icon="season(modelValue)" theme="dark"></v-icon> -->
        </template>
      </v-range-slider>
    </v-col>
  </v-row>
</template>
<script setup>
  //as we expand to month/Quarter etc, we still use dates, but we increase the step?
  //that seems ok, as long as you can control manually with an input
  import { ref,computed } from 'vue';
  const emit = defineEmits(['updateValue','updateRange']);
  import CommonMethods from '../CommonMethods';

  const selectedTimeFrame = ref('wtd');

  const timeframes = ref([
    {
      label:'All Time',
      value:'all'
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
    }
  ]);

  const resetPoints = async () => {
    emit('updateRange',[recentDays.value[0],recentDays.value[recentDays.value.length - 1]])
  }
  const emitSliderChange = (value) => {
    emit('updateValue',[recentDays.value[value[0]],recentDays.value[value[1]]])
  }
  const formatTick = (date) => {
    if(!date) return;
    switch(selectedTimeFrame.value){
      case 'wtd':
        return date.toLocaleDateString('en-US',{
          weekday:'short'
        });
      case 'mtd':
        return date.toLocaleDateString('en-US',{
          month:'short',
          day:'numeric'
        });
      case 'qtd':
        return date.toLocaleDateString('en-US',{
          month:'short'
        });
      case 'ytd':
        return date.toLocaleDateString('en-US',{
          month:'short'
        });
      case 'all':
        return date.toLocaleDateString('en-US',{
          month:'short',
          year:'numeric'
        });
    }
  }

  const formatThumb = (index) => {
    return recentDays.value[index].toLocaleDateString('en-US',{
      month:'short',
      day:'numeric',
      year:'numeric'
    });
  }
  const recentDays = computed(()=>{
    let startDate;
    switch (selectedTimeFrame.value){
      case 'all':
        startDate = new Date(0);
      break;
      case 'ytd':
        startDate = CommonMethods.firstofTheYear();
      break;
      case 'qtd':
        startDate = CommonMethods.firstOfTheQuarter();
      break;
      case 'mtd':
        startDate = CommonMethods.firstofTheMonth();
      break;
      case 'wtd':
        startDate = CommonMethods.firstofWeek();
      break;
      default:
        startDate = CommonMethods.firstofWeek();
    }
    // return CommonMethods.getDatesBetween(startDate,new Date());
    return [...CommonMethods.getDatesBetween(startDate,new Date()), new Date()];
  });
  const getTicks = (dates) => {
    return dates.map((date, index)=> ({date, index})).filter(({ date })=>{
      if(dates.length <= 8){
        return true;
      }
      if(dates.length <= 31){
        return date.getDay() === 1;
      }
      return date.getDate() === 1;
    });
  }
  const stepIncrement = computed(()=>{
    if(recentDays.value.length > 730){
      return 30;
    }
    if(recentDays.value.length > 365){
      return 7;
    }
    return 1;
  });
  const sliderTicks = computed(()=>{
    const result = {};
    let dates = getTicks(recentDays.value).forEach(({date, index})=>{
      result[index] = formatTick(date);
    });
    return result;
  });
</script>
