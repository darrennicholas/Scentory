'use client';

import { GlobalDropdown } from '@/components/global-dropdown';
import {LoadingSkeleton} from '@/components/loading-skeleton';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { concentrations, families, label, Page, Perfume } from '@/lib/models';
import { PerfumeCard } from '@/components/perfume-card';
export default function Perfumes() {
 const [search,setSearch]=useState(''); const [debouncedSearch,setDebouncedSearch]=useState(''); const [family,setFamily]=useState(''); const [concentration,setConcentration]=useState(''); const [sort,setSort]=useState('newest'); const [page,setPage]=useState(1);
 useEffect(()=>{const timer=setTimeout(()=>setDebouncedSearch(search),300);return()=>clearTimeout(timer)},[search]);
 useEffect(()=>{const initial=new URLSearchParams(window.location.search).get('family');if(initial && families.includes(initial))setFamily(initial)},[]);
 const params=new URLSearchParams({page:String(page),sort}); if(debouncedSearch)params.set('search',debouncedSearch); if(family)params.set('fragranceFamily',family); if(concentration)params.set('concentration',concentration);
 const q=useQuery({queryKey:['perfumes',params.toString()],queryFn:()=>apiRequest<Page<Perfume>>(`/perfumes?${params}`)});
 return <main className="page"><p className="eyebrow">Personal perfume archive · {q.data?.meta.total ?? 0} fragrances</p><div className="page-heading"><div><h1>The Collection</h1><p className="muted">Your fragrance library — an evolving archive of the scents you love.</p></div><Link className="btn" href="/perfumes/new">+ Add perfume</Link></div><div className="toolbar"><input aria-label="Search fragrances" placeholder="Search by perfume or brand…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/><GlobalDropdown aria-label="Concentration" value={concentration} onValueChange={value=>{setConcentration(value);setPage(1)}}><option value="">All concentrations</option>{concentrations.map(c=><option key={c} value={c}>{label(c)}</option>)}</GlobalDropdown><GlobalDropdown aria-label="Family" value={family} onValueChange={value=>{setFamily(value);setPage(1)}}><option value="">All families</option>{families.map(f=><option key={f} value={f}>{label(f)}</option>)}</GlobalDropdown><GlobalDropdown aria-label="Sort" value={sort} onValueChange={value=>{setSort(value);setPage(1)}}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="brand_asc">Brand A–Z</option></GlobalDropdown></div>{q.isLoading ? <LoadingSkeleton label="Loading fragrances"/> : q.isError ? <p className="error">Could not load your fragrances. <button onClick={()=>q.refetch()}>Try again</button></p> : q.data?.data.length ? <div className="grid">{q.data.data.map(p=><PerfumeCard key={p.id} perfume={p}/>)}</div> : <div className="empty"><h2>No fragrances found</h2><p className="muted">Add a fragrance or adjust your filters.</p><Link className="btn" href="/perfumes/new">Add perfume</Link></div>}<div className="pagination"><span>{q.data?.meta.total ?? 0} fragrances</span><button className="btn secondary" disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><span>{page} / {Math.max(1,q.data?.meta.totalPages ?? 1)}</span><button className="btn secondary" disabled={page >= (q.data?.meta.totalPages ?? 1)} onClick={()=>setPage(page+1)}>Next</button></div></main>;
}



