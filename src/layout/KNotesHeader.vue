<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: "KNotesHeader",
    computed: {
      showSearch(): boolean {
        return this.$route.path === "/";
      },
      showNewNote(): boolean {
        return this.$route.path !== "/new/";
      }
    },
    data() {
      return {
        search: "",
      }
    },
    methods: {
      searchChange() {
        let newRoute = this.$route.path;
        if (this.search) newRoute += `?search=${this.search}`;
        this.$router.replace(newRoute);
      }
    }
  });
</script>

<template>
  <header>
    <router-link to="/" class="raw title">Knotes</router-link>
    <form v-if="showSearch">
      <div class="search-input-field">
        <input type="text" id="search-input" name="search-input" v-model="search" v-on:input="searchChange" />
        <label for="search-input" class="search-input-label">🔎</label>
      </div>
    </form>
    <router-link v-if="showSearch" to="/new" class="new-note">+ Nouvelle note</router-link>
  </header>
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: clamp(8px, 2%, 2.5em);
  border-bottom: 5px solid black;
}
.title {
  font-size: 2rem;
  line-height: normal;
  margin-right: auto;
  width: fit-content;
}
.title:first-letter {
  font-size: 4rem;
}
.new-note {
  margin-right: auto;
  white-space: nowrap;
  width: fit-content;
}
.new-note:first-letter {
  font-size: 1.5em;
  font-weight: bold;
}
.search-input-field {
  position: relative;
}
.search-input-label {
  position: absolute;
  left: 0;
  top: calc(50% - 12px)
}
#search-input {
  padding-left: 1.5rem;
  height: 32px;
  width: clamp(5rem, 25vw, 25rem);
}


</style>
