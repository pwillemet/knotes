import { NewNote, Note } from './note.model'

export type NoteService = {
  storeNote: (note: NewNote) => Promise<Note>;
  getNoteById: (id: string) => Promise<Note | null>;
  getNotes: () => Promise<Note[]>;
  deleteNote: (id: string) => Promise<void>;
  updateNote: (note: Note) => Promise<Note>;
  importNotes: (notes: Note[]) => Promise<Note[]>;
}
