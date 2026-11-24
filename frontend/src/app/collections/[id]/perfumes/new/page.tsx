'use client';

import { GlobalDropdown } from '@/components/global-dropdown';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FieldError } from '@/components/field-error';
import { useSaveFeedback } from '@/components/providers';
import { apiAll, apiRequest } from '@/lib/api';
import { Perfume } from '@/lib/models';

type Collection = { id: string; name: string; perfumes: { perfume: Perfume }[] };

export default function AddPerfumeToCollection() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const runSave = useSaveFeedback();
  const [perfumeId, setPerfumeId] = useState('');
  const collection = useQuery({ queryKey: ['collections', id], queryFn: () => apiRequest<{ data: Collection }>(`/collections/${id}`) });
  const perfumes = useQuery({ queryKey: ['perfumes', 'collection-add'], queryFn: () => apiAll<Perfume>('/perfumes') });
  const save = useMutation({
    meta: { feedbackHandled: true },
    mutationFn: () => runSave(() => apiRequest(`/collections/${id}/perfumes`, { method: 'POST', body: JSON.stringify({ perfumeId }) }), 'Fragrance added to the collection.'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['collections'] });
      qc.invalidateQueries({ queryKey: ['perfumes'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      router.push(`/collections/${id}`);
    },
  });

  const available = perfumes.data?.filter(perfume => !collection.data?.data.perfumes.some(item => item.perfume.id === perfume.id)) ?? [];
  if (collection.isLoading || perfumes.isLoading) return <main className="page">Loading fragrances…</main>;
  if (collection.isError || perfumes.isError || !collection.data) return <main className="page"><p className="error">Could not load collection fragrances.</p><Link href={`/collections/${id}`}>Back to collection</Link></main>;

  return <main className="page">
    <p className="eyebrow">{collection.data.data.name}</p>
    <div className="page-heading"><div><h1>Add a fragrance</h1><p className="muted">Choose a perfume from your archive for this collection.</p></div></div>
    <form className="panel collection-add-form" onSubmit={event => { event.preventDefault(); save.mutate(); }}>
      {available.length ? <div className="dropdown-field"><label htmlFor="collection-perfume">Perfume *</label><GlobalDropdown id="collection-perfume" required value={perfumeId} onValueChange={value => setPerfumeId(value)}><option value="">Select fragrance</option>{available.map(perfume => <option key={perfume.id} value={perfume.id}>{perfume.brand} — {perfume.name}</option>)}</GlobalDropdown><FieldError error={save.error} field="perfumeId" /></div> : <p className="muted">All fragrances in your archive already belong to this collection.</p>}
      {save.isError && <p className="error" role="alert">{save.error.message}</p>}
      <div className="form-actions"><button type="button" className="btn secondary" onClick={() => router.back()}>Cancel</button><button className="btn" disabled={!available.length || !perfumeId || save.isPending}>Add to collection</button></div>
    </form>
  </main>;
}
