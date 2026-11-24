'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FieldError } from '@/components/field-error';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { useSaveFeedback } from '@/components/providers';
import { apiAll, apiRequest } from '@/lib/api';
import { clientFieldErrors, collectionFormSchema } from '@/lib/form-validation';
import { Perfume } from '@/lib/models';
import { z } from 'zod';

type Payload = z.infer<typeof collectionFormSchema>;

export default function NewCollection() {
  const router = useRouter();
  const qc = useQueryClient();
  const runSave = useSaveFeedback();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCover] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>({});
  const perfumes = useQuery({ queryKey: ['perfumes', 'collection-selector'], queryFn: () => apiAll<Perfume>('/perfumes') });
  const save = useMutation({
    meta: { feedbackHandled: true },
    mutationFn: (payload: Payload) => runSave(
      () => apiRequest<{ data: { id: string } }>('/collections', { method: 'POST', body: JSON.stringify(payload) }),
      'Collection created successfully.',
    ),
    onSuccess: ({ data }) => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      qc.invalidateQueries({ queryKey: ['perfumes'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      router.push(`/collections/${data.id}`);
    },
  });
  const toggle = (id: string, checked: boolean) => setSelected(current => checked ? [...current, id] : current.filter(value => value !== id));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = collectionFormSchema.safeParse({ name, description, coverImageUrl, perfumeIds: selected });
    if (!result.success) { setClientErrors(clientFieldErrors(result.error)); return; }
    setClientErrors({});
    save.mutate(result.data);
  };

  return <main className="page">
    <p className="eyebrow">A new curation</p>
    <div className="page-heading"><div><h1>Curate a New Collection</h1><p className="muted">Gather fragrances by season, mood, or memory.</p></div></div>
    <form onSubmit={submit} className="form-layout">
      <div>
        <section className="panel"><h2>Collection Identity</h2><div className="form-grid">
          <label className="wide">Name *<input required minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)} /><FieldError error={save.error} field="name" clientErrors={clientErrors} /></label>
          <label className="wide">Description<textarea maxLength={500} value={description} onChange={event => setDescription(event.target.value)} /><FieldError error={save.error} field="description" clientErrors={clientErrors} /></label>
          <label className="wide">Cover image URL or local image path<input type="text" inputMode="url" placeholder="https://… or /storage/images/…" value={coverImageUrl} onChange={event => setCover(event.target.value)} /><FieldError error={save.error} field="coverImageUrl" clientErrors={clientErrors} /></label>
        </div></section>
        <section className="panel"><h2>Include from Your Wardrobe</h2><p className="muted">Choose fragrances now or add them later.</p>
          {perfumes.isError ? <p className="error">Could not load perfumes. <button type="button" onClick={() => perfumes.refetch()}>Try again</button></p>
            : perfumes.isLoading ? <div className="skeleton-lines" role="status" aria-label="Loading fragrances"><span /><span /><span /></div>
              : perfumes.data?.length ? perfumes.data.map(perfume => <label className="note-row collection-perfume-option" key={perfume.id}>
                <input type="checkbox" checked={selected.includes(perfume.id)} onChange={event => toggle(perfume.id, event.target.checked)} />
                <span><strong>{perfume.brand} — {perfume.name}</strong><small>{perfume.concentration.replaceAll('_', ' ')}</small></span>
              </label>) : <p className="muted">No fragrances in your archive yet.</p>}
          <FieldError error={save.error} field="perfumeIds" clientErrors={clientErrors} />
        </section>
        {save.isError && <p className="error" role="alert">{save.error.message}</p>}
        <div className="form-actions"><button type="button" className="btn secondary" onClick={() => router.back()}>Cancel</button><button className="btn" disabled={save.isPending}>Save collection</button></div>
      </div>
      <aside className="panel"><h2>{name.trim() || 'Untitled Collection'}</h2><p className="muted">{description.trim() || 'Your personal curation.'}</p><p>{selected.length} fragrances selected</p></aside>
    </form>
  </main>;
}
