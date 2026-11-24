'use client';

import { GlobalDropdown } from '@/components/global-dropdown';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { NoteForm } from '@/components/note-form';
import { apiRequest } from '@/lib/api';
import { categories, label, Note, Page } from '@/lib/models';

export default function Notes() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Note | null>(null);
  const params = new URLSearchParams({ page: String(page), limit: '12' });
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  const query = useQuery({ queryKey: ['notes', params.toString()], queryFn: () => apiRequest<Page<Note>>(`/fragrance-notes?${params}`) });
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest(`/fragrance-notes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
      if (query.data?.data.length === 1 && page > 1) setPage(page - 1);
    },
  });

  return <main className="page">
    <p className="eyebrow">The olfactory archive</p>
    <div className="page-heading">
      <div><h1>Botanical &amp; Olfactory Notes</h1><p className="muted">A curated index of aromatic ingredients and their place in your personal fragrance collection.</p></div>
      <Link className="btn" href="/notes/new">+ Add note</Link>
    </div>
    <div className="toolbar">
      <input aria-label="Search notes" placeholder="Search notes…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
      <GlobalDropdown aria-label="Filter category" value={category} onValueChange={value => { setCategory(value); setPage(1); }}>
        <option value="">All categories</option>{categories.map(item => <option key={item} value={item}>{label(item)}</option>)}
      </GlobalDropdown>
    </div>
    {remove.isError && <p className="error" role="alert">{remove.error.message}</p>}
    {query.isLoading ? <LoadingSkeleton label="Loading notes" /> : query.isError ? <p className="error">Could not load notes. <button onClick={() => query.refetch()}>Try again</button></p> : query.data?.data.length ? <div className="grid note-grid">
      {query.data.data.map(note => {
        const related = Array.from(new Map(note.perfumes?.map(item => [item.perfumeId, item.perfume])).values());
        return <article className="card" key={note.id}>
          <p className="eyebrow">{label(note.category)}</p><h3>{note.name}</h3>
          <p className="muted">{note.description || 'No description yet.'}</p>
          <p className="muted">{related.length} related fragrances</p>
          {related.length > 0 && <details><summary>View related fragrances</summary>{related.map(perfume => <p key={perfume.id}><Link href={`/perfumes/${perfume.id}`}>{perfume.brand} — {perfume.name}</Link></p>)}</details>}
          <div className="actions"><button className="link-button" onClick={() => setEditing(note)}>Edit</button><button className="link-button" disabled={remove.isPending} onClick={() => { if (confirm(`Delete ${note.name}? Notes used by fragrances cannot be deleted.`)) remove.mutate(note.id); }}>Delete</button></div>
        </article>;
      })}
    </div> : <div className="empty"><h2>No notes found</h2><p className="muted">Add a note or adjust your filters.</p><Link className="btn" href="/notes/new">Add note</Link></div>}
    <div className="pagination"><span>{query.data?.meta.total ?? 0} notes</span><button className="btn secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>{page} / {Math.max(1, query.data?.meta.totalPages ?? 1)}</span><button className="btn secondary" disabled={page >= (query.data?.meta.totalPages ?? 1)} onClick={() => setPage(page + 1)}>Next</button></div>
    {editing && <dialog ref={node => { if (node && !node.open) node.showModal(); }} onCancel={() => setEditing(null)} aria-label="Edit note"><NoteForm key={editing.id} note={editing} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} /></dialog>}
  </main>;
}
