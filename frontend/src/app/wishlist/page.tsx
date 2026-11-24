'use client';

import { GlobalDropdown } from '@/components/global-dropdown';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImageFallback } from '@/components/image-fallback';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { WishlistForm } from '@/components/wishlist-form';
import { apiRequest } from '@/lib/api';
import { label, Page, WishlistItem } from '@/lib/models';

export default function Wishlist() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const params = new URLSearchParams({ page: String(page), sort });
  if (search) params.set('search', search);
  if (priority) params.set('priority', priority);

  const query = useQuery({ queryKey: ['wishlist', params.toString()], queryFn: () => apiRequest<Page<WishlistItem>>(`/wishlist?${params}`) });
  const remove = useMutation({
    mutationFn: (id: string) => apiRequest(`/wishlist/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });

  return <main className="page">
    <p className="eyebrow">A personal fragrance wish list</p>
    <div className="page-heading"><div><h1>Curated Wishlist</h1><p className="muted">A collection of fragrances you hope to discover.</p></div><Link className="btn" href="/wishlist/new">+ Add to wishlist</Link></div>
    <div className="toolbar">
      <input aria-label="Search wishlist" placeholder="Search by brand or fragrance…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
      <GlobalDropdown aria-label="Priority" value={priority} onValueChange={value => { setPriority(value); setPage(1); }}><option value="">All priorities</option>{['HIGH', 'MEDIUM', 'LOW'].map(value => <option key={value} value={value}>{label(value)}</option>)}</GlobalDropdown>
      <GlobalDropdown aria-label="Sort wishlist" value={sort} onValueChange={value => setSort(value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="priority">Priority</option></GlobalDropdown>
    </div>
    {remove.isError && <p className="error" role="alert">{remove.error.message}</p>}
    {query.isLoading ? <LoadingSkeleton label="Loading wishlist" /> : query.isError ? <p className="error">Could not load wishlist. <button onClick={() => query.refetch()}>Try again</button></p> : query.data?.data.length ? <div className="grid note-grid">
      {query.data.data.map(item => <article className="card" key={item.id}>
        <ImageFallback src={item.imageUrl} alt={item.name} /><p className="brand">{item.brand}</p><h3>{item.name}</h3>
        <p className="muted">{label(item.concentration)} · {label(item.priority)} priority</p>
        <p>{item.estimatedPrice === null ? 'Price not set' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(item.estimatedPrice))}</p>
        <div className="actions"><button className="link-button" onClick={() => setEditing(item)}>Edit</button><button className="link-button" disabled={remove.isPending} onClick={() => { if (confirm('Permanently remove this wishlist item?')) remove.mutate(item.id); }}>Remove</button></div>
        <Link className="btn" style={{ marginTop: 18, width: '100%' }} href={`/perfumes/new?wishlistId=${item.id}`}>Add to my perfumes</Link>
      </article>)}
    </div> : <div className="empty"><h2>Your wishlist is empty</h2><p className="muted">Save a fragrance you would like to discover.</p><Link className="btn" href="/wishlist/new">Add to wishlist</Link></div>}
    <div className="pagination"><button className="btn secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>{page} / {Math.max(1, query.data?.meta.totalPages ?? 1)}</span><button className="btn secondary" disabled={page >= (query.data?.meta.totalPages ?? 1)} onClick={() => setPage(page + 1)}>Next</button></div>
    {editing && <dialog ref={node => { if (node && !node.open) node.showModal(); }} onCancel={() => setEditing(null)} aria-label="Edit wishlist item"><WishlistForm key={editing.id} item={editing} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} /></dialog>}
  </main>;
}
