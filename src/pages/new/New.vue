<template>
  <h1>{{ updatingNote ? "Modifier une " : "Nouvelle" }} note</h1>
  <form v-on:submit="addNote">
    <div class="form-field markdown-form-field">
      <div>
        <textarea v-model="content"
                  id="textarea-content"
                  name="textarea-content"
                  placeholder="# Commencez par un titre ou glissez/déposez un fichier Markdown..."
                  v-bind:class="{ 'drag-target': dragging }"
                  v-on:dragover="dragOverHandler"
                  v-on:dragenter="dragEnterHandler"
                  v-on:drop="dropHandler"
        ></textarea>
      </div>
      <div class="separator" />
      <div v-html="markdownRender" class="markdown-render"></div>
      <p v-if="err" class="error-message">{{err}}</p>
      </div>
    <button type="submit" :disabled="!!err  || !content" class="add-button">{{ updatingNote != null ? "Modifier" : "Ajouter" }}</button>
  </form>
</template>

<script lang="ts">
import { marked } from "marked";
import { defineComponent, onUnmounted } from 'vue'
import NoteLocalStorageService from '../../services/notes/note-local-storage.service'
import { NewNote, Note } from '../../services/notes/note.model'

marked.setOptions(
    {
      breaks: true
    }
)

export default defineComponent({
  name: 'New',
  data() {
    return {
      content: "",
      err: "",
      markdownRender: "",
      updatingNote: null as Note | null,
      dragging: false,
    }
  },
  methods: {
    parseContent(value: string) {
      marked.parse(value, (err, parseResult) => {
        if (err == null) {
          this.err = "";
          this.markdownRender = parseResult;
        } else {
          err = err.message;
        }
      })
    },
    addNote(e: Event) {
      e.preventDefault();
      const note: NewNote = {
        ...this.updatingNote ?? {},
        content: this.content,
        keywords: [],
      }
      const promise = this.updatingNote
          ? NoteLocalStorageService.updateNote(note as Note)
          : NoteLocalStorageService.storeNote(note);
      promise
          .then(() => this.$router.push("/"))
          .catch((e) => console.error(e))
    },
    dragOverHandler(e: DragEvent) {
      if (e.dataTransfer?.files.length === 1) e.dataTransfer.dropEffect = "copy";
      e.preventDefault();
    },
    dragEnterHandler(e: DragEvent) {
      e.preventDefault();
    },
    async dropHandler(e: DragEvent) {
      this.dragging = false;
      if (e.dataTransfer?.files.length === 1) {
        const text = await e.dataTransfer.files[0].text();
        this.content = text;
      }
    }
  },
  watch: {
    content: {
      handler(value) {
        console.log("watch")
        this.parseContent(value);
      },
      immediate: true,
    }
  },
  mounted() {
    const id = this.$route.params.id;
    if (id != null && typeof id === "string") {
      NoteLocalStorageService.getNoteById(id)
          .then(note => {
            if (note != null) {
              this.updatingNote = note;
              this.content = note.content;
            }
          })
          .catch(err => console.error(err))
    }
    const dragOverCb = (e: Event) => this.dragging = true;
    const dragLeaveCb = (e: Event) => this.dragging = false;
    window.addEventListener("dragover", dragOverCb, true);
    window.addEventListener("dragleave", dragLeaveCb, true);
    onUnmounted(() => {
      window.removeEventListener("dragover", dragOverCb);
      window.removeEventListener("dragleave", dragLeaveCb);
    })
  }
})
</script>

<style scoped>
h1 {
  margin: 0.5rem;
  text-align: center;
}

.markdown-form-field {
  display: grid;
  align-items: stretch;
  gap: 1rem;
  grid-template-columns: 1fr 4px 1fr;
}

.separator {
  background: black;
}

textarea {
  height: clamp(100px, 50vh, 30rem);
  width: 100%;
  resize: none;
}

.drag-target {
  -webkit-box-shadow: 1px 1px 1px 2px rgba(0,150,4,0.3);
  box-shadow: 1px 1px 1px 2px rgba(0,150,4,0.3);
}

.error-message {
  grid-row: 2;
  grid-column: 1 / span 3;
  color: red;
}

.add-button {
  display: block;
  width: 75%;
  margin: auto;
}

.markdown-render {
  border: solid black 1px;
  padding: .5rem;
}

</style>
