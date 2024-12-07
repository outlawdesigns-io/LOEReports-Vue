<script setup>

import { useStore } from 'vuex';
import { ref,computed, watch } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  }
});

const filterDialog = ref(false);
const coverDialog = ref(false);
const selectedColumn = ref(null);
const selectedValues = ref([]);
const filteredItems = ref();
const columnFilter = ref(null);
const distinctValues = ref([]);
const inspectionPath = ref(null);
const searchStr = ref(null);

const columns = ref([
  {key:'title', title: 'Title'},
  {key:'track_number', title:'Track #'},
  {key:'album', title: 'Album'},
  {key:'artist', title: 'Artist'},
  {key:'genre', title: 'Genre'},
  {key:'publisher', title:'Record Label'},
  {key:'year', title: 'year'},
  {key:'artist_country', title: 'Country'},
  {key:'daysInLibrary', title: 'Days In Library'},
  {key:'cover_path', title: 'Album art'}
]);


const openFilterDialog = () => {
  filterDialog.value = true;
};

const closeFilterDialog = () => {
  filterDialog.value = false;
  //resetSelection();
}
const toggleCoverDialog = (cover_path,on) => {
  coverDialog.value = on;
  inspectionPath.value = buildCoverPathUrl(cover_path);
}
const applyFilter = () => {
  filteredItems.value = props.items.filter((e)=>{
    if (selectedValues.value.length === 0) return true;
    return selectedValues.value.includes(e[selectedColumn.value]);
  });
  closeFilterDialog();
}
const getDistinctValues = () => {
  if (selectedColumn.value){
    const values = [...new Set(props.items.map(item => item[selectedColumn.value]))];
    distinctValues.value = values;
  }
}
const resetSelection = () => {
  selectedValues.value = [];
}
const resetTable = () => {
  filteredItems.value = props.items;
  resetSelection();
}
const buildCoverPathUrl = (cover_path) => {
  return `https://loe.outlawdesigns.io${cover_path.match(/.*\/LOE(.*)/)[1]}`;
}

watch(selectedColumn,(newValue, oldValue)=>{
  getDistinctValues();
});
watch(()=>props.items,(newValue)=>{
  filteredItems.value = newValue;
  selectedColumn.value = null;
  resetSelection();
},{immediate: true});
watch(columnFilter,(newValue,oldValue)=>{
  if(newValue.length === 0){
    getDistinctValues();
  }else{
    distinctValues.value = distinctValues.value.filter((e)=>{ return e?.toLowerCase().includes(newValue.toLowerCase())});
  }
});

resetTable();

</script>

<template>
  <v-container>
    <v-dialog v-model="filterDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Filter by column</span>
        </v-card-title>
        <v-card-text>
          <v-select
          v-model="selectedColumn"
          :items="columns"
          item-title="title"
          item-value="key"
          label="Select Column"
          @update:modelValue="resetSelection"
          dense
          hide-details />
          <v-text-field v-if="selectedColumn" label="Type to filter choices..." v-model="columnFilter"></v-text-field>
          <v-checkbox v-if="distinctValues.length"
          v-for="value in distinctValues"
          v-model="selectedValues"
          :key="value"
          :label="value"
          :value="value"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="applyFilter">Apply</v-btn>
          <v-btn color="grey" @click="closeFilterDialog">Cancel</v-btn>
          <v-btn color="grey" @click="resetTable">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="coverDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Cover Art</v-card-title>
        <v-card-text>
          <img id="inspectionImg" :src="inspectionPath" alt="cover_path" />
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-dialog>
    <template v-slot:text></template>
    <v-data-table :headers="columns" :items="filteredItems" :search="searchStr">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <span v-if="selectedColumn">{{selectedColumn}}: {{selectedValues.join(', ')}}</span>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                  v-model="searchStr"
                  label="search"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  hide-details
                  single-line
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-toolbar-title>
          <v-btn icon @click="openFilterDialog">
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item="props">
        <tr>
          <td v-for="column in columns" :key="column.key">
            <template v-if="column.key === 'cover_path'">
              <!-- static text -->
              <img :height="50" :width="50" :src="buildCoverPathUrl(props.item[column.key])" alt='cover_path' @click="toggleCoverDialog(props.item[column.key],true)" />
            </template>
            <template v-else>
              {{ props.item[column.key] }}
            </template>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-container>
</template>

<style scoped>
#inspectionImg{
  height: 100%;
  width:100%;
}
</style>
