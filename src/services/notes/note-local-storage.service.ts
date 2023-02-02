import { NoteService } from './note-service.model'
import { isNoteArray, NewNote, Note } from './note.model'
import { v4 } from "uuid";
import dayjs from "dayjs";
import "../global";

const LOCAL_STORAGE_NOTES_KEY = "knotes.notes"

class NoteLocalStorageService implements NoteService {

  private store = window.localStorage;

  constructor () {}

  async deleteNote(id: string): Promise<void> {
    const notes = await this.getNotes();
    const newNotes = notes.filter(note => note.id !== id);
    await this.storeNotes(newNotes);
    return Promise.resolve();
  }

  async getNoteById(id: string): Promise<Note | null> {
    const notes = await this.getNotes();
    const note = notes.find(note => note.id === id) ?? null;
    return Promise.resolve(note);
  }

  async getNotes(): Promise<Note[]> {
    const notesStr = this.store.getItem(LOCAL_STORAGE_NOTES_KEY) ?? "[]";
    try {
      const notes = JSON.parse(notesStr);
      if (!isNoteArray(notes)) {
        return Promise.reject(new Error("Wrong value in store"))
      }
      return Promise.resolve(notes)
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async storeNote(note: NewNote): Promise<Note> {
    if (note.id != null) throw new Error("Id must be null")
    const now = dayjs().toISOString();
    const newNote: Note = { ...note, id: v4(), created_at: now, updated_at: now };
    const notes = await this.getNotes();
    notes.push(newNote);
    await this.storeNotes(notes);
    return Promise.resolve(newNote);
  }

  async updateNote(note: Note): Promise<Note> {
    const notes = await this.getNotes();
    const [oldNote, newNotes] = notes.extract((n) => n.id === note.id);
    if (oldNote == null) throw new Error("Note not found");
    const newNote: Note = { ...oldNote, content: note.content, updated_at: dayjs().toISOString() }
    newNotes.push(newNote);
    await this.storeNotes(newNotes);
    return Promise.resolve(newNote);
  }

  async importNotes(notes: Note[]): Promise<Note[]> {
    const oldNotes = await this.getNotes();
    notes.forEach(note => {
        const existingNote = oldNotes.find(n => n.id === note.id);
        if (existingNote != null) Object.assign(existingNote, note);
        else oldNotes.push(note);
      })
    await this.storeNotes(oldNotes);
    return Promise.resolve(oldNotes);
  }

  private async storeNotes(notes: Note[]): Promise<void> {
    const notesStr = JSON.stringify(notes);
    this.store.setItem(LOCAL_STORAGE_NOTES_KEY, notesStr);
    return Promise.resolve();
  }

}

const noteLocalStorageService = new NoteLocalStorageService();
export default noteLocalStorageService;
