'use client';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Perfume } from '@/lib/models';
import { PerfumeForm } from '@/components/perfume-form';
export default function EditPerfume() { const {id}=useParams<{id:string}>(); const q=useQuery({queryKey:['perfumes',id],queryFn:()=>apiRequest<{data:Perfume}>(`/perfumes/${id}`)}); return <main className="page"><div className="page-heading"><div><p className="eyebrow">Olfactory archive</p><h1>Edit Olfactory Entry</h1></div></div>{q.isLoading ? <LoadingSkeleton variant="detail" label="Loading fragrance" /> : q.isError || !q.data ? <p className="error">Could not load fragrance. <button onClick={()=>q.refetch()}>Try again</button></p> : <PerfumeForm perfume={q.data.data}/>}</main>; }
