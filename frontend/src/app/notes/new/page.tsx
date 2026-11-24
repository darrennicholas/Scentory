'use client';

import Link from 'next/link';
import { NoteForm } from '@/components/note-form';

export default function NewNote() {
  return <main className="page">
    <p className="eyebrow">The olfactory archive</p>
    <div className="page-heading"><div><h1>Add a fragrance note</h1><p className="muted">Record an ingredient and how it appears in your scent archive.</p></div></div>
    <div className="form-layout note-form-layout"><section className="panel"><NoteForm /></section><aside className="panel"><h2>Build your note library</h2><p className="muted">A clear name and category make notes easier to find when building a fragrance pyramid.</p><Link href="/notes">Back to notes</Link></aside></div>
  </main>;
}
