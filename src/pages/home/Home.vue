<template>
  <div class="header">
    <h1>Mes notes</h1>
    <div class="actions">
      <ul class="actions__menu" v-bind:class="{show: showMenu}">
        <li><router-link class="raw button-effect actions__menu__item" to="/new">+ Nouvelle note</router-link></li>
        <li class="actions__menu__item separator" />
        <li><button class="raw button-effect actions__menu__item" v-on:click="exportAll">Exporter les notes</button></li>
        <li><button class="raw button-effect actions__menu__item" v-on:click="exportSearch">Exporter la recherche</button></li>
        <li><button class="raw button-effect actions__menu__item" v-on:click="importNotes">Importer</button></li>
      </ul>
      <button class="actions__button" v-on:click="toggleMenu">Actions…</button>
    </div>
  </div>
  <div class="content">
    <aside v-bind:class="{ display: showKeywords }">
      <div class="aside-toggler">
        <h3>Mots-Clés</h3>
        <button class="raw aside-toggler-button" v-on:click="toggleKeywords">{{ showKeywords ? "«" : "»" }}</button>
      </div>
      <ul class="keywords-list">
        <li class="keywords-list-item" v-for="keyword in keywords" :key="keyword">
          <button class="raw keyword-button" v-on:click="() => toggleKeyword(keyword)" v-bind:class="{ selected: selectedKeywords.includes(keyword) }">{{ keyword }}</button>
        </li>
      </ul>
    </aside>
    <router-link v-if="notes.length === 0" to="/new" class="start-sentence">Créez votre première note !</router-link>
    <ul class="cards-list">
      <li v-for="note in displayNotes" :key="note.id">
        <button class="raw" v-on:click="() => selectNote(note)">
          <NoteCard :note="note" :selected="selectedNote === note" v-on:notes-change="getAllNotes" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import { isNoteArray, Note } from '../../services/notes/note.model.js'
import NoteLocalStorageService, { LOCAL_STORAGE_NOTES_KEY } from '../../services/notes/note-local-storage.service'
import NoteCard from '../../components/NoteCard.vue'
import { RouteLocationNormalizedLoaded } from 'vue-router'

function download(notes: Note[]): void {
  const notesStr = JSON.stringify(notes, null, 2);
  const hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(notesStr);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'knotes.json';
  hiddenElement.click();
}

async function upload(): Promise<Note[]> {
  return new Promise<Note[]>((resolve, reject) => {
    const hiddenElement = document.createElement('input');
    hiddenElement.type = "file"
    hiddenElement.addEventListener("change", async (e: Event) => {
      const fileStr = await hiddenElement.files?.[0]?.text() ?? "[]"
      const json = JSON.parse(fileStr);
      if (isNoteArray(json)) {
        resolve(json);
      } else {
        reject("Cannot parse notes from selected file")
      }
    })
    hiddenElement.click();
  });
}

export default defineComponent({
  name: 'Home',
  components: { NoteCard },
  data() {
    return {
      notes: [] as Note[],
      search: "",
      selectedNote: null as Note | null,
      showMenu: false,
      showKeywords: false,
      selectedKeywords: [] as string[],
    };
  },
  methods: {
    getAllNotes() {
      NoteLocalStorageService.getNotes()
          .then(notes => this.notes = notes)
          .catch(err => console.error(err))
    },
    selectNote(note: Note) {
      this.selectedNote = this.selectedNote === note ? null : note;
    },
    toggleMenu(e: Event) {
      e.stopPropagation();
      this.showMenu = !this.showMenu;
    },
    toggleKeywords(e: Event) {
      this.showKeywords = !this.showKeywords;
    },
    toggleKeyword(keyword: string) {
      const [extractedKeyword, newSelectedKeywords] = this.selectedKeywords.extract(k => k === keyword);
      if (extractedKeyword != null) {
        this.selectedKeywords = newSelectedKeywords;
      } else {
        this.selectedKeywords = [...this.selectedKeywords, keyword];
      }
    },
    exportAll() {
      download(this.notes);
      this.showMenu = false;
    },
    exportSearch() {
      download(this.displayNotes);
      this.showMenu = false;
    },
    async importNotes() {
      try {
        const notes = await upload();
        this.notes = await NoteLocalStorageService.importNotes(notes)
        this.showMenu = false;
      } catch (e) {
        console.error(e);
      }
    }
  },
  computed: {
    displayNotes(): Note[] {
      const regex = new RegExp(this.search, "im");
      return this.notes
          .filter(note => regex.test(note.content))
          .filter(note => this.selectedKeywords.every(keyword => note.keywords.includes(keyword)))
    },
    keywords(): string[] {
      const keywords = this.notes.map(note => note.keywords).flat();
      return [...new Set(keywords)];
    }
  },
  beforeCreate () {
    if (window.localStorage.getItem(LOCAL_STORAGE_NOTES_KEY) == null) {
      try {
        fetch("/presentation.md")
            .then(result => {
              if (!result.ok) throw new Error(result.statusText);
              return result;
            })
            .then(result => result.text())
            .then(text => NoteLocalStorageService.storeNote({ content: text, keywords: ["introduction"] }))
            .then(note => this.getAllNotes())
      } catch (e) {
        console.error(e);
      }
    }
  },
  mounted () {
    this.getAllNotes();
    const globalClickEventListener = (e: Event) => this.showMenu = false;
    document.getRootNode().addEventListener("click", globalClickEventListener)
    onUnmounted(() => document.getRootNode().removeEventListener("click", globalClickEventListener));
  },
  watch: {
    $route: {
      handler(route: RouteLocationNormalizedLoaded) {
        const search = route.query.search;
        this.search = typeof search === "string" ? search : "";
      },
      deep: true
    }
  }
});
</script>

<style scoped>
.header {
  position: sticky;
  top: 77px;
  display: flex;
  background: white;
  z-index: 1;
  align-items: center;
  padding: .5rem 2rem;
  border-bottom: 1px solid black;
}
.content {
  display: flex;
  align-items: flex-start;
}
.actions {
  margin-left: auto;
  margin-right: 4rem;
  position: relative;
}
.actions__button {
  position: relative;
  background: white;
  z-index: 2;
}
.actions__menu {
  position: absolute;
  top: calc(100% - 5px);
  min-width: 100%;
  background: white;
  z-index: 1;
  border: 2px solid black;
  padding-top: 5px;
  visibility: hidden;
}
.actions__menu.show {
  visibility: visible;
}
.actions__menu__item {
  display: block;
  width: 100%;
  padding-inline: .25rem;
  white-space: nowrap;
}
.separator {
  height: 1px;
  background: black;
  margin-block: .1rem;
}
aside {
  width: clamp(7.8rem, 25%, 15rem);
  height: calc(100vh - 129px);
  position: sticky;
  top: 129px;
  border-right: 1px solid black;
  border-bottom: 1px solid black;
  margin-left: calc(2em - clamp(7.5rem, 25%, 15rem));
  transition: margin-left 250ms ease-out;
}
aside.display {
  margin-left: 0;
}
.aside-toggler {
  display: flex;
  border-bottom: 1px solid black;
}
.aside-toggler h3 {
  margin-left: auto;
}
.aside-toggler-button {
  font-size: 2rem;
  margin-left: auto;
  border-left: 1px solid black;
  padding-inline: .5rem;
}
.aside-toggler-button:hover {
  color: #999;
}
.keywords-list {
  visibility: hidden;
  height: calc(100% - 25px);
  overflow: auto;
}
.display .keywords-list {
  visibility: visible;
}
.keyword-button {
  display: block;
  width: 100%;
  padding-inline: .5rem;
}
.keyword-button.selected {
  color: white;
  background: black;
}
.start-sentence {
  display: block;
  width: fit-content;
  margin: 5rem auto;
}
.cards-list {
  padding: 1rem 1rem;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  justify-items: center;
  flex: 1;
}
.cards-list li {
  width: 100%;
  max-width: 50em;
}
.cards-list li button {
  display: block;
  width: 100%;
  transition: translate 250ms linear;
}

@media (hover: hover) {
  .cards-list button:hover {
    transition: translate 200ms cubic-bezier(0,2.00,.75,2.00);
    translate: 4px -4px;
  }

  .keyword-button:hover {
    text-decoration: underline;
  }
}

</style>
