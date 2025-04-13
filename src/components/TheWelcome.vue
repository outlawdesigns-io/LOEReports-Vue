<script setup>

import { useStore } from 'vuex';
import { ref,computed,watch } from 'vue';

const store = useStore();

</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="12"></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12"></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12"></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="4"></v-col>
      <v-col cols="12" sm="4"></v-col>
      <v-col cols="12" sm="4"></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12"></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12"></v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6"></v-col>
      <v-col cols="12" sm="6"></v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>
