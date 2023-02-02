<template>
  <div class="card" v-bind:class="{selected: selected}">
  <article>
    <div class="markdown-render" v-html="content"></div>
  </article>
    <div class="actions">
      <router-link :to="`/edit/${note.id}`" class="icon" title="Modifier">✎ </router-link>
      <button class="icon" title="Supprimer" v-on:click="deleteNote">🗑 </button>
      <button class="icon" title="Télécharger" v-on:click="downloadNote">⭳</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Note } from '../services/notes/note.model'
import { marked } from 'marked'
import NoteLocalStorageService from '../services/notes/note-local-storage.service'

function download(note: Note): void {
  const hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(note.content);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'knote.md';
  hiddenElement.click();
}

export default defineComponent({
  name: 'NoteCard',
  props: {
    note: {
      type: Object as PropType<Note>,
      required: true
    },
    selected: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      content: ""
    }
  },
  methods: {
    deleteNote(e: MouseEvent) {
      e.stopPropagation();
      e.preventDefault();
      NoteLocalStorageService.deleteNote(this.note.id)
        .then(() => this.$emit("notes-change"))
        .catch(err => console.error(err))
    },
    downloadNote(e: MouseEvent) {
      e.stopPropagation();
      e.preventDefault();
      download(this.note);
    }
  },
  watch: {
    note: {
      handler(newNote) {
        marked.parse(newNote.content, (err, parseResult) => this.content = parseResult)
      },
      immediate: true,
    }
  }
})
</script>

<style scoped>
.card {
  display: flex;
  align-items: flex-start;
  padding: 4px 0.5rem;
  -webkit-box-shadow: 2px 2px 5px 1px rgba(0,0,0,0.5);
  box-shadow: 2px 2px 5px 1px rgba(0,0,0,0.5);
}
article {
  flex: 1;
}
.markdown-render {
  overflow: hidden;
  height: 180px;
  transition: height 300ms linear;
}
.selected .markdown-render {
  height: auto;
  min-height: 250px;
}
.actions {
  font-size: 1.2rem;
  width: fit-content;
  position: sticky;
  top: 136px;
}
.actions > * {
  margin-bottom: 4px;
}

@media (hover: hover) {
  .actions {
    visibility: hidden;
    opacity: 0;
    transition: opacity 200ms;
  }

  .card:hover .actions {
    visibility: visible;
    opacity: 1;
  }
}
</style>
