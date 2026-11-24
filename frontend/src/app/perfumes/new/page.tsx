'use client';
import {useEffect,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {PerfumeForm} from '@/components/perfume-form';
import {apiRequest} from '@/lib/api';
import {WishlistItem} from '@/lib/models';
export default function NewPerfume(){const [id,setId]=useState<string|null>(null);useEffect(()=>setId(new URLSearchParams(window.location.search).get('wishlistId')||''),[]);const q=useQuery({queryKey:['wishlist',id],queryFn:()=>apiRequest<{data:WishlistItem}>(`/wishlist/${id}`),enabled:!!id});return <main className="page"><p className="eyebrow">The olfactory archive</p><div className="page-heading"><div><h1>Catalogue New Flacon</h1><p className="muted">Record the details of a fragrance in your personal collection.</p></div></div>{id===null||q.isLoading&&id?<p>Loading…</p>:q.isError?<p className="error">Could not load wishlist item. <button onClick={()=>q.refetch()}>Try again</button></p>:<PerfumeForm wishlist={q.data?.data}/>}</main>}
