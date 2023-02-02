<script setup lang="ts">
  import KNotesHeader from "./layout/KNotesHeader.vue";
  import { marked } from "marked";

  marked.setOptions(
      {
        breaks: true
      }
  )

</script>

<template>
  <KNotesHeader></KNotesHeader>
  <main>
    <router-view></router-view>
  </main>
</template>

<style scoped>

</style>
