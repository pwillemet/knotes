<script setup lang="ts">
  import Header from "./layout/Header.vue";
  import { marked } from "marked";

  marked.setOptions(
      {
        breaks: true
      }
  )

</script>

<template>
  <Header></Header>
  <main>
    <router-view></router-view>
  </main>
</template>

<style scoped>

</style>
