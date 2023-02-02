export type Note = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  keywords: string[];
}

export type NewNote = Partial<Note> & Pick<Note, "content" | "keywords">

export function isNote(note: any): note is Note {
  return typeof note.id === "string"
    && typeof note.content === "string"
    && typeof note.created_at === "string"
    && typeof note.updated_at === "string"
    && Array.isArray(note.keywords)
    && note.keywords.every((keyword: any) => typeof keyword === "string");
}

export function isNoteArray(notes: any): notes is Note[] {
  return Array.isArray(notes) && notes.every((note: any) => isNote(note));
}
