'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { useSaveFeedback } from '@/components/providers';
import { apiAll, apiRequest } from '@/lib/api';
import { Perfume } from '@/lib/models';

type Collection = { id: string; name: string; perfumes: { perfume: Perfume }[] };

export default function AddPerfumeToCollection() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const runSave = useSaveFeedback();
  const [selected, setSelected] = useState<string[]>([]);
  const collection = useQuery({ queryKey: ['collections', id], queryFn: () => apiRequest<{ data: Collection }>(`/collections/${id}`) });
  const perfumes = useQuery({ queryKey: ['perfumes', 'collection-add'], queryFn: () => apiAll<Perfume>('/perfumes') });
  const save = useMutation({
    meta: { feedbackHandled: true },
    mutationFn: (perfumeIds: string[]) => runSave(
      () => apiRequest(`/collections/${id}/perfumes`, { method: 'POST', body: JSON.stringify({ perfumeIds }) }),
      `${perfumeIds.length} fragrance${perfumeIds.length === 1 ? '' : 's'} added to the collection.`,
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      qc.invalidateQueries({ queryKey: ['perfumes'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      router.push(`/collections/${id}`);
    },
  });

  if (collection.isLoading || perfumes.isLoading) return <main className="page"><LoadingSkeleton variant="detail" label="Loading collection fragrances" /></main>;
  if (collection.isError || perfumes.isError || !collection.data) return <main className="page"><p className="error">Could not load collection fragrances.</p><Link href={`/collections/${id}`}>Back to collection</Link></main>;

  const existing = new Set(collection.data.data.perfumes.map(item => item.perfume.id));
  const available = perfumes.data?.filter(perfume => !existing.has(perfume.id)) ?? [];
  const toggle = (perfumeId: string, checked: boolean) => setSelected(current => checked
    ? [...current, perfumeId]
    : current.filter(id => id !== perfumeId));

  return <main className="page">
    <p className="eyebrow">{collection.data.data.name}</p>
    <div className="page-heading"><div><h1>Add fragrances</h1><p className="muted">Choose one or more perfumes from your archive.</p></div></div>
    <form className="panel collection-add-form" onSubmit={event => { event.preventDefault(); save.mutate(selected); }}>
      {available.length ? <fieldset className="collection-perfume-selector">
        <legend>Fragrances to add <span className="muted">({selected.length} selected)</span></legend>
        {available.map(perfume => <label className="collection-perfume-option" key={perfume.id}>
          <input type="checkbox" checked={selected.includes(perfume.id)} onChange={event => toggle(perfume.id, event.target.checked)} />
          <span><strong>{perfume.name}</strong><small>{perfume.brand} · {perfume.concentration.replaceAll('_', ' ')}</small></span>
        </label>)}
      </fieldset> : <p className="muted">All fragrances in your archive already belong to this collection.</p>}
      {save.isError && <p className="error" role="alert">{save.error.message}</p>}
      <div className="form-actions"><button type="button" className="btn secondary" onClick={() => router.back()}>Cancel</button><button className="btn" disabled={!available.length || !selected.length || save.isPending}>Add {selected.length || ''} to collection</button></div>
    </form>
  </main>;
}
