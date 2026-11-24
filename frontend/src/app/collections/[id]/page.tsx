'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FieldError } from '@/components/field-error';
import { PerfumeCard } from '@/components/perfume-card';
import { useSaveFeedback } from '@/components/providers';
import { apiRequest } from '@/lib/api';
import { Perfume } from '@/lib/models';

type Collection = { id: string; name: string; description: string | null; coverImageUrl: string | null; perfumes: { perfume: Perfume }[] };

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const runSave = useSaveFeedback();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState('');
  const query = useQuery({ queryKey: ['collections', id], queryFn: () => apiRequest<{ data: Collection }>(`/collections/${id}`) });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['collections'] });
    qc.invalidateQueries({ queryKey: ['perfumes'] });
    qc.invalidateQueries({ queryKey: ['insights'] });
  };
  const remove = useMutation({
    mutationFn: (perfumeId: string) => apiRequest(`/collections/${id}/perfumes/${perfumeId}`, { method: 'DELETE' }),
    onSuccess: refresh,
  });
  const edit = useMutation({
    meta: { feedbackHandled: true },
    mutationFn: () => runSave(() => apiRequest(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify({ name, description, coverImageUrl: cover || null }) }), 'Collection details updated.'),
    onSuccess: () => { refresh(); setEditing(false); },
  });
  const del = useMutation({
    mutationFn: () => apiRequest(`/collections/${id}`, { method: 'DELETE' }),
    onSuccess: () => { refresh(); router.push('/collections'); },
  });

  if (query.isLoading) return <main className="page">Loading collection…</main>;
  if (query.isError || !query.data) return <main className="page"><p className="error">Could not load collection.</p><button onClick={() => query.refetch()}>Try again</button></main>;

  const collection = query.data.data;
  return <main className="page">
    <p className="eyebrow">Curated collection · {collection.perfumes.length} fragrances</p>
    <div className="page-heading"><div><h1>{collection.name}</h1><p className="muted">{collection.description}</p></div><div className="actions"><button className="btn" onClick={() => { setName(collection.name); setDescription(collection.description ?? ''); setCover(collection.coverImageUrl ?? ''); setEditing(true); }}>Edit collection</button><button className="btn secondary" disabled={del.isPending} onClick={() => { if (confirm('Delete this collection? Your perfumes will remain.')) del.mutate(); }}>Delete collection</button></div></div>
    {editing && <form className="panel" onSubmit={event => { event.preventDefault(); edit.mutate(); }}>
      <h2>Edit collection</h2><div className="form-grid">
        <label>Name *<input required minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)} /><FieldError error={edit.error} field="name" /></label>
        <label>Cover image URL or local image path<input type="text" inputMode="url" placeholder="https://… or /storage/images/…" value={cover} onChange={event => setCover(event.target.value)} /><FieldError error={edit.error} field="coverImageUrl" /></label>
        <label className="wide">Description<textarea maxLength={500} value={description} onChange={event => setDescription(event.target.value)} /><FieldError error={edit.error} field="description" /></label>
      </div>
      {edit.isError && <p className="error" role="alert">{edit.error.message}</p>}
      <div className="form-actions"><button type="button" className="btn secondary" onClick={() => setEditing(false)}>Cancel</button><button className="btn" disabled={edit.isPending}>Save changes</button></div>
    </form>}
    <div className="toolbar"><Link className="btn" href={`/collections/${id}/perfumes/new`}>+ Add a perfume</Link></div>
    {(remove.isError || del.isError) && <p className="error" role="alert">{remove.error?.message ?? del.error?.message}</p>}
    {collection.perfumes.length ? <div className="grid">{collection.perfumes.map(({ perfume }) => <div key={perfume.id}><PerfumeCard perfume={perfume} /><button className="link-button" style={{ marginTop: 12 }} onClick={() => { if (confirm('Remove this perfume from the collection?')) remove.mutate(perfume.id); }}>Remove from collection</button></div>)}</div> : <div className="empty"><h2>This collection is empty</h2><p className="muted">Add a fragrance from your library.</p><Link className="btn" href={`/collections/${id}/perfumes/new`}>Add a fragrance</Link></div>}
  </main>;
}
