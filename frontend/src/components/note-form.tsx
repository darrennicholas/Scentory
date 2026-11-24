'use client';

import { GlobalDropdown } from '@/components/global-dropdown';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FieldError } from '@/components/field-error';
import { useSaveFeedback } from '@/components/providers';
import { apiRequest } from '@/lib/api';
import { categories, label, Note } from '@/lib/models';

export function NoteForm({ note, onCancel, onSaved }: { note?: Note; onCancel?: () => void; onSaved?: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const runSave = useSaveFeedback();
  const [name, setName] = useState(note?.name ?? '');
  const [description, setDescription] = useState(note?.description ?? '');
  const [category, setCategory] = useState(note?.category ?? 'CITRUS');
  const save = useMutation({
    meta: { feedbackHandled: true },
    mutationFn: () => runSave(
      () => apiRequest(`/fragrance-notes${note ? `/${note.id}` : ''}`, {
        method: note ? 'PATCH' : 'POST',
        body: JSON.stringify({ name, description, category }),
      }),
      note ? 'Fragrance note updated.' : 'Fragrance note added to your archive.',
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      qc.invalidateQueries({ queryKey: ['perfumes'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      if (onSaved) onSaved();
      else router.push('/notes');
    },
  });

  return <form className="note-form" onSubmit={event => { event.preventDefault(); save.mutate(); }}>
    <h2>{note ? 'Edit note' : 'Note details'}</h2>
    <label>Name *<input required minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)} /><FieldError error={save.error} field="name" /></label>
    <div className="dropdown-field"><label htmlFor="note-category">Category *</label><GlobalDropdown id="note-category" required value={category} onValueChange={value => setCategory(value)}>{categories.map(value => <option key={value} value={value}>{label(value)}</option>)}</GlobalDropdown><FieldError error={save.error} field="category" /></div>
    <label>Description<textarea maxLength={500} value={description} onChange={event => setDescription(event.target.value)} /><FieldError error={save.error} field="description" /></label>
    {save.isError && <p className="error" role="alert">{save.error.message}</p>}
    <div className="form-actions">
      <button className="btn secondary" type="button" onClick={onCancel ?? (() => router.back())}>Cancel</button>
      <button className="btn" disabled={save.isPending}>{note ? 'Save changes' : 'Save note'}</button>
    </div>
  </form>;
}
